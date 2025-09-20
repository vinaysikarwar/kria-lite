/* editor.widget.js
  Kria Lite — tiny, vanilla JS WYSIWYG editor
  (formerly: generic "WYSIWYG Widget")
  Supports optional server upload via options.uploadUrl or custom options.uploadHandler(file, callbacks)
  Exposes: WYSIWYG.init(selectorOrNodeList, options)
  Alias:   KriaLite.init(selectorOrNodeList, options) — convenience brand alias
*/
(function (global) {
  'use strict';

  if (global.WYSIWYG) return;

  const defaultOptions = {
    selector: '.wysiwyg',
    height: 300,
    placeholder: 'Start typing...',
    sanitize: true,
    toolbar: [
      'bold', 'italic', 'underline', 'strike', '|',
      'ul', 'ol', 'indent', 'outdent', '|',
      'link', 'image', '|',
      'code', 'quote', '|',
      'toggleSource'
    ],
    // Upload options (set any of these when initializing)
    uploadUrl: null,                // POST endpoint to upload file (FormData). If null, no automatic upload.
    uploadFieldName: 'image',       // field name for file in FormData
    uploadHeaders: {},              // extra headers for upload request (e.g. auth)
    // onUploadProgress(percent, loaded, total, imgEl, instance)
    onUploadProgress: null,
    // parseUploadResponse(json) -> returns imageURL (string) OR null/throw
    parseUploadResponse: (json) => (json && (json.url || json.data && json.data.url)) || null,
    // Or provide uploadHandler(file, callbacks) that returns Promise resolving to { url: '...' }
    uploadHandler: null
  };

  /* --- Simple CSS injected for widget --- */
  const css = `
.wysiwyg-wrapper{border:1px solid #d1d5db;border-radius:6px;background:#fff;font-family:inherit;color:#111}
.wysiwyg-toolbar{display:flex;flex-wrap:wrap;gap:6px;padding:6px;background:#fafafa;border-bottom:1px solid #e5e7eb}
.wysiwyg-toolbar button{background:transparent;border:1px solid #e5e7eb;padding:6px 8px;border-radius:6px;cursor:pointer}
.wysiwyg-editor{min-height:80px;padding:12px;outline:none;color:inherit}
.wysiwyg-editor img.uploading{opacity:0.7;filter:grayscale(30%);}
.wysiwyg-source{width:100%;box-sizing:border-box;padding:10px;border:none;font-family:monospace;min-height:100px}
.wysiwyg-hidden{display:none}
.wysiwyg-progress{height:4px;background:#e6e6e6;border-radius:4px;overflow:hidden;margin-top:6px}
.wysiwyg-progress > i{display:block;height:100%;width:0%;background:#3b82f6;border-radius:4px}
`;

  function injectCss() {
    if (document.getElementById('wysiwyg-widget-styles')) return;
    const s = document.createElement('style');
    s.id = 'wysiwyg-widget-styles';
    s.textContent = css;
    document.head.appendChild(s);
  }

  /* --- Sanitizer (basic) --- */
  function sanitizeHtml(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    div.querySelectorAll('script,style,iframe,object,embed').forEach(n => n.remove());
    const walker = document.createTreeWalker(div, NodeFilter.SHOW_ELEMENT, null);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(el => {
      Array.from(el.attributes || []).forEach(attr => {
        const name = attr.name.toLowerCase(), val = (attr.value || '').toLowerCase();
        if (name.startsWith('on') || (name === 'href' && val.startsWith('javascript:'))) el.removeAttribute(attr.name);
      });
    });
    return div.innerHTML;
  }

  /* --- Core command executor (uses execCommand for now) --- */
  function execCommandSafe(cmd, instance, value) {
    if (!instance || !instance.editorEl) { console.warn('WYSIWYG: editor not ready for command', cmd); return; }
    if (cmd === 'codeBlock') {
      document.execCommand('formatBlock', false, 'pre');
    } else if (cmd === 'formatBlock' && value) {
      document.execCommand('formatBlock', false, value);
    } else {
      document.execCommand(cmd, false, value || null);
    }
    syncToTextarea(instance);
  }

  /* --- Toolbar builder --- */
  function buildToolbar(toolbarConfig, instance) {
    const bar = document.createElement('div'); bar.className = 'wysiwyg-toolbar';
    const addBtn = (name, label, handler) => {
      const b = document.createElement('button');
      b.type = 'button'; b.dataset.cmd = name; b.title = label; b.textContent = label;
      b.addEventListener('click', handler);
      bar.appendChild(b);
      return b;
    };
    toolbarConfig.forEach(item => {
      if (item === '|') { const sep = document.createElement('div'); sep.style.width = '8px'; bar.appendChild(sep); return; }
      switch (item) {
        case 'bold': addBtn('bold', 'B', () => execCommandSafe('bold', instance)); break;
        case 'italic': addBtn('italic', 'I', () => execCommandSafe('italic', instance)); break;
        case 'underline': addBtn('underline', 'U', () => execCommandSafe('underline', instance)); break;
        case 'strike': addBtn('strikeThrough', 'S', () => execCommandSafe('strikeThrough', instance)); break;
        case 'ul': addBtn('insertUnorderedList', '• List', () => execCommandSafe('insertUnorderedList', instance)); break;
        case 'ol': addBtn('insertOrderedList', '1. List', () => execCommandSafe('insertOrderedList', instance)); break;
        case 'indent': addBtn('indent', 'Indent', () => execCommandSafe('indent', instance)); break;
        case 'outdent': addBtn('outdent', 'Outdent', () => execCommandSafe('outdent', instance)); break;
        case 'link': addBtn('link', 'Link', () => createLink(instance)); break;
        case 'image': addBtn('image', 'Image', () => triggerImage(instance)); break;
        case 'code': addBtn('codeBlock', 'Code', () => insertCode(instance)); break;
        case 'quote': addBtn('quote', 'Quote', () => execCommandSafe('formatBlock', instance, 'blockquote')); break;
        case 'toggleSource': addBtn('toggleSource', 'Source', () => toggleSource(instance)); break;
        default: addBtn(item, item, () => execCommandSafe(item, instance));
      }
    });
    return bar;
  }

  function createLink(instance) {
    if (!instance) return;
    const url = prompt('Enter URL (include http:// or https://)');
    if (!url) return;
    execCommandSafe('createLink', instance, url);
  }

  /* --- Upload helpers: either custom uploadHandler or XHR upload to uploadUrl --- */

  // Upload using XHR to allow progress events.
  function uploadFileXHR(file, opts = {}, progressCb) {
    const uploadUrl = opts.uploadUrl;
    const fieldName = opts.uploadFieldName || 'image';
    const headers = opts.uploadHeaders || {};

    if (!uploadUrl) return Promise.reject(new Error('uploadUrl not provided'));

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const fd = new FormData();
      fd.append(fieldName, file, file.name);

      xhr.open('POST', uploadUrl, true);
      // add headers if provided
      Object.keys(headers).forEach(h => {
        try { xhr.setRequestHeader(h, headers[h]); } catch (e) { /* some headers restricted */ }
      });

      xhr.upload.onprogress = (evt) => {
        if (evt.lengthComputable && typeof progressCb === 'function') {
          const percent = Math.round((evt.loaded / evt.total) * 100);
          progressCb(percent, evt.loaded, evt.total);
        }
      };

      xhr.onreadystatechange = () => {
        if (xhr.readyState !== 4) return;
        if (xhr.status >= 200 && xhr.status < 300) {
          let json = null;
          try { json = JSON.parse(xhr.responseText); } catch (err) { return reject(new Error('Invalid JSON from upload endpoint')); }
          resolve(json);
        } else {
          reject(new Error('Upload failed: ' + xhr.status + ' ' + xhr.statusText));
        }
      };

      xhr.onerror = () => reject(new Error('Network error during upload'));
      xhr.send(fd);
    });
  }

  /* --- Image trigger: insert blob preview immediately, then upload (if configured) --- */
  async function triggerImage(instance) {
    if (!instance) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.addEventListener('change', async (e) => {
      const f = e.target.files && e.target.files[0]; if (!f) return;

      // Create a blob URL preview and insert immediately
      const blobUrl = URL.createObjectURL(f);
      const img = document.createElement('img');
      img.src = blobUrl;
      img.alt = f.name || '';
      img.style.maxWidth = '100%';
      img.classList.add('uploading');
      // store blob url so we can revoke later
      img.dataset._blobUrl = blobUrl;
      insertNodeAtCaret(img, instance.editorEl);
      syncToTextarea(instance);

      // show small progress bar under editor (instance-level)
      const progress = showInstanceProgress(instance);

      // Helper to finalize when we have a final URL
      const finalizeImage = (finalUrl) => {
        if (!finalUrl) {
          // remove uploading class and keep blob preview (or mark error)
          img.classList.remove('uploading');
        } else {
          // replace preview src with server URL
          img.src = finalUrl;
          img.removeAttribute('data-_blobUrl');
          img.classList.remove('uploading');
          // revoke blob URL after a short delay (to ensure browser finished reading)
          try { URL.revokeObjectURL(blobUrl); } catch (e) { /* ignore */ }
        }
        hideInstanceProgress(instance);
        syncToTextarea(instance);
      };

      // If a custom uploadHandler is provided, call it:
      if (typeof instance.options.uploadHandler === 'function') {
        try {
          const result = await instance.options.uploadHandler(f, {
            onProgress: (p, loaded, total) => {
              if (typeof instance.options.onUploadProgress === 'function') instance.options.onUploadProgress(p, loaded, total, img, instance);
              updateInstanceProgress(instance, p);
            }
          });
          // expect uploadHandler to return { url: '...' } or a string
          let finalUrl = null;
          if (result) {
            if (typeof result === 'string') finalUrl = result;
            else if (typeof result === 'object') finalUrl = (instance.options.parseUploadResponse ? instance.options.parseUploadResponse(result) : (result.url || null));
          }
          finalizeImage(finalUrl);
        } catch (err) {
          console.error('Custom uploadHandler failed', err);
          alert('Image upload failed');
          hideInstanceProgress(instance);
        }
        return;
      }

      // Else if uploadUrl is configured, upload via XHR
      if (instance.options.uploadUrl) {
        try {
          const json = await uploadFileXHR(f, instance.options, (percent, loaded, total) => {
            if (typeof instance.options.onUploadProgress === 'function') instance.options.onUploadProgress(percent, loaded, total, img, instance);
            updateInstanceProgress(instance, percent);
          });
          // parse server response to get url
          const parsedUrl = (typeof instance.options.parseUploadResponse === 'function')
            ? instance.options.parseUploadResponse(json)
            : (json && (json.url || null));

          if (!parsedUrl) {
            console.warn('Upload response did not contain an image URL', json);
            alert('Upload succeeded but response did not include image URL');
            finalizeImage(null);
            return;
          }
          finalizeImage(parsedUrl);
        } catch (err) {
          console.error('Upload failed', err);
          alert('Image upload failed: ' + (err && err.message));
          finalizeImage(null);
        }
        return;
      }

      // No upload configured — just leave blob preview (ephemeral)
      // Remove uploading class and allow user to save manually if they want
      img.classList.remove('uploading');
      hideInstanceProgress(instance);
      syncToTextarea(instance);
      // NOTE: blob URL will be revoked when page unloads or if code removes the img later
    });
    input.click();
  }

  /* --- Progress UI helpers (simple, per instance) --- */
  function showInstanceProgress(instance) {
    if (!instance) return null;
    const root = instance.wrapper;
    let p = root.querySelector('.wysiwyg-progress');
    if (!p) {
      p = document.createElement('div'); p.className = 'wysiwyg-progress';
      const i = document.createElement('i'); p.appendChild(i);
      root.appendChild(p);
    }
    p.style.display = ''; updateInstanceProgress(instance, 0);
    return p;
  }

  function updateInstanceProgress(instance, percent) {
    if (!instance) return;
    const root = instance.wrapper;
    const p = root.querySelector('.wysiwyg-progress');
    if (!p) return;
    const i = p.querySelector('i');
    i.style.width = (Math.max(0, Math.min(100, percent || 0))) + '%';
  }

  function hideInstanceProgress(instance) {
    if (!instance) return;
    const root = instance.wrapper;
    const p = root.querySelector('.wysiwyg-progress');
    if (!p) return;
    setTimeout(() => { p.style.display = 'none'; updateInstanceProgress(instance, 0); }, 300);
  }

  /* --- Code block insertion --- */
  function insertCode(instance) {
    if (!instance || !instance.editorEl) return;
    const sel = window.getSelection();
    if (sel && sel.rangeCount && !sel.isCollapsed) {
      const range = sel.getRangeAt(0);
      const text = range.toString();
      const pre = document.createElement('pre'); const code = document.createElement('code'); code.textContent = text; pre.appendChild(code);
      range.deleteContents(); range.insertNode(pre);
    } else {
      const pre = document.createElement('pre'); const code = document.createElement('code'); code.textContent = '\n// code\n'; pre.appendChild(code);
      insertNodeAtCaret(pre, instance.editorEl);
    }
    syncToTextarea(instance);
  }

  /* --- Utilities --- */
  function insertNodeAtCaret(node, editorEl) {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) { editorEl.appendChild(node); return; }
    const range = sel.getRangeAt(0); range.deleteContents(); range.insertNode(node); range.setStartAfter(node); range.setEndAfter(node); sel.removeAllRanges(); sel.addRange(range);
  }

  function toggleSource(instance) {
    if (!instance) return;
    const { editorEl, sourceEl, options } = instance;
    if (!editorEl || !sourceEl) return;
    if (sourceEl.classList.contains('wysiwyg-hidden')) {
      sourceEl.value = editorEl.innerHTML;
      editorEl.classList.add('wysiwyg-hidden');
      sourceEl.classList.remove('wysiwyg-hidden');
      sourceEl.focus();
    } else {
      const raw = sourceEl.value;
      const applied = options.sanitize ? sanitizeHtml(raw) : raw;
      editorEl.innerHTML = applied;
      sourceEl.classList.add('wysiwyg-hidden');
      editorEl.classList.remove('wysiwyg-hidden');
      syncToTextarea(instance);
      editorEl.focus();
    }
  }

  function syncToTextarea(instance) {
    if (!instance) return;
    const { editorEl, textarea, options } = instance;
    if (!textarea) return;
    textarea.value = options.sanitize ? sanitizeHtml((editorEl && editorEl.innerHTML) || '') : (editorEl && editorEl.innerHTML) || '';
  }

  function syncFromTextarea(instance) {
    if (!instance) return;
    instance.editorEl.innerHTML = instance.textarea.value || '';
    if (instance.sourceEl && !instance.sourceEl.classList.contains('wysiwyg-hidden')) instance.sourceEl.value = instance.textarea.value || '';
  }

  /* --- Main initializer (enhances textareas) --- */
  function enhanceTextarea(textarea, options) {
    injectCss();
    const opts = Object.assign({}, defaultOptions, options || {});

    // wrapper & core elements
    const wrapper = document.createElement('div'); wrapper.className = 'wysiwyg-wrapper';
    const editorEl = document.createElement('div'); editorEl.className = 'wysiwyg-editor'; editorEl.contentEditable = true;
    editorEl.style.minHeight = (opts.height || 200) + 'px';
    editorEl.innerHTML = textarea.value || '';
    const sourceEl = document.createElement('textarea'); sourceEl.className = 'wysiwyg-source wysiwyg-hidden';
    sourceEl.style.minHeight = (opts.height || 200) + 'px';

    // instance object
    const instance = { textarea, wrapper, editorEl, sourceEl, options: opts };

    // build toolbar with valid instance
    const toolbar = buildToolbar(opts.toolbar, instance);

    // assemble DOM
    wrapper.appendChild(toolbar);
    wrapper.appendChild(editorEl);
    wrapper.appendChild(sourceEl);
    textarea.style.display = 'none';
    textarea.parentNode.insertBefore(wrapper, textarea.nextSibling);

    // events
    editorEl.addEventListener('input', () => syncToTextarea(instance));
    sourceEl.addEventListener('input', () => { /* no-op until user applies/toggles */ });
    textarea.addEventListener('change', () => syncFromTextarea(instance));
    const form = textarea.closest('form'); if (form) form.addEventListener('submit', () => syncToTextarea(instance));

    // store instance for debugging
    textarea._wysiwyg = instance;

    // Rehydrate any images stored as data attributes (optional: if you implement persistence)
    // (Not implemented here; keep for future hook)

    return instance;
  }

  function init(selectorOrList, options) {
    const sel = selectorOrList || defaultOptions.selector;
    let nodes = [];
    if (typeof sel === 'string') nodes = Array.from(document.querySelectorAll(sel));
    else if (sel instanceof NodeList || Array.isArray(sel)) nodes = Array.from(sel);
    else if (sel instanceof HTMLTextAreaElement) nodes = [sel];
    return nodes.map(n => enhanceTextarea(n, options));
  }

  /* --- Cleanup blob URLs on unload to avoid memory leaks --- */
  window.addEventListener('unload', () => {
    try {
      document.querySelectorAll('img[data-_blob-url]').forEach(img => {
        try { URL.revokeObjectURL(img.dataset._blobUrl); } catch (e) { /* ignore */ }
      });
      // also images using dataset._blobUrl (we used data-_blobUrl naming above)
      document.querySelectorAll('img').forEach(img => {
        if (img.dataset && img.dataset._blobUrl) {
          try { URL.revokeObjectURL(img.dataset._blobUrl); } catch (e) {}
        }
      });
    } catch (e) { /* ignore */ }
  });

  /* --- Expose API --- */
  global.WYSIWYG = { init, sanitizeHtml };
  // Non-breaking brand alias: KriaLite mirrors WYSIWYG
  try {
    if (!global.KriaLite) global.KriaLite = global.WYSIWYG;
  } catch (e) { /* ignore */ }

})(window);