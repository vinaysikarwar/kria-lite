/* editor.widget.js
  Kria Lite — advanced, tiny, vanilla JS WYSIWYG editor
  - WYSIWYG.init(selectorOrNodeList, options)
  - KriaLite alias mirrors WYSIWYG
  - Developed By Vinay Sikarwar
  - Supports uploadUrl / uploadHandler for image uploads
  - Advanced toolbar, dialogs, keyboard shortcuts, API methods
*/
(function (global) {
  'use strict';
  if (global.WYSIWYG) return;

  const defaultOptions = {
    selector: '.wysiwyg',
    height: 360,
    maxHeight: null, // e.g. 500 to limit editor height with scroll
    placeholder: 'Start typing...',
    sanitize: true,
    autosaveKey: null, // e.g. 'post-123-draft' to enable local autosave
    toolbar: [
      'undo','redo','|',
      'bold','italic','underline','strike','removeFormat','|',
      'h1','h2','h3','p','|',
      'fontFamily','fontSize','fontColor','bgColor','|',
      'alignLeft','alignCenter','alignRight','|',
      'ul','ol','indent','outdent','|',
      'link','image','table','hr','|',
      'code','quote','|',
      'toggleSource','fullscreen'
    ],
    uploadUrl: null,
    uploadFieldName: 'image',
    uploadHeaders: {},
    onUploadProgress: null,
    parseUploadResponse: (json) => (json && (json.url || json.data && json.data.url)) || null,
    uploadHandler: null,
    plugins: [] // array of functions(instance) for extensibility
  };

  const instancesList = [];


const ICONS_SVG = {
  //undo: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 8H4V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 8a9 9 0 109 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  //redo: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 8h5V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 8a9 9 0 11-9 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  bold: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M7 7h5a3 3 0 010 6H7zM7 13h6a3 3 0 110 6H7z"/></svg>',
  italic: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 4h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M6 20h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M15 4L9 20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  underline: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 3v7a7 7 0 0014 0V3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M4 21h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  strike: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 12h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  removeFormat: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 7h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M12 3v14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  //h1: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M3 5v14h2V9h6v10h2V5h-2v6H5V5H3z"/></svg>',
  //h2: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M4 6v12h2V6H4zM8 10h8v2H8v2h6v2H8v2h8"/></svg>',
  //h3: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M3 5v14h2V9h6v10h2V5h-2v6H5V5H3z"/><path d="M17 7v2h3v2h-3v2h3v2h-5v-2h2v-2h-2V7h5z"/></svg>',
  //p: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M5 4v16h6a4 4 0 004-4V8a4 4 0 00-4-4H5z"/></svg>',
  alignLeft: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="4" width="18" height="2" rx="1" fill="currentColor"/><rect x="3" y="9" width="12" height="2" rx="1" fill="currentColor"/><rect x="3" y="14" width="18" height="2" rx="1" fill="currentColor"/></svg>',
  alignCenter: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="4" width="18" height="2" rx="1" fill="currentColor"/><rect x="6" y="9" width="12" height="2" rx="1" fill="currentColor"/><rect x="3" y="14" width="18" height="2" rx="1" fill="currentColor"/></svg>',
  alignRight: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="4" width="18" height="2" rx="1" fill="currentColor"/><rect x="9" y="9" width="12" height="2" rx="1" fill="currentColor"/><rect x="3" y="14" width="18" height="2" rx="1" fill="currentColor"/></svg>',
  ul: '<svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="6" cy="7" r="1.5" fill="currentColor"/><circle cx="6" cy="12" r="1.5" fill="currentColor"/><circle cx="6" cy="17" r="1.5" fill="currentColor"/><rect x="10" y="6" width="11" height="2" rx="1" fill="currentColor"/><rect x="10" y="11" width="11" height="2" rx="1" fill="currentColor"/><rect x="10" y="16" width="11" height="2" rx="1" fill="currentColor"/></svg>',
  ol: '<svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><text x="2" y="8" font-size="7" fill="currentColor">1.</text><text x="2" y="13" font-size="7" fill="currentColor">2.</text><text x="2" y="18" font-size="7" fill="currentColor">3.</text><rect x="10" y="6" width="11" height="2" rx="1" fill="currentColor"/><rect x="10" y="11" width="11" height="2" rx="1" fill="currentColor"/><rect x="10" y="16" width="11" height="2" rx="1" fill="currentColor"/></svg>',
  indent: '<svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="4" width="16" height="2" rx="1" fill="currentColor"/><rect x="8" y="9" width="12" height="2" rx="1" fill="currentColor"/><rect x="8" y="14" width="12" height="2" rx="1" fill="currentColor"/><path d="M3 11l3 3-3 3V11z" fill="currentColor"/></svg>',
  outdent: '<svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="4" width="16" height="2" rx="1" fill="currentColor"/><rect x="4" y="9" width="12" height="2" rx="1" fill="currentColor"/><rect x="4" y="14" width="12" height="2" rx="1" fill="currentColor"/><path d="M21 11l-3 3 3 3V11z" fill="currentColor"/></svg>',
  link: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 14a5 5 0 007.07 0l3-3a5 5 0 00-7.07-7.07l-1 1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 10a5 5 0 00-7.07 0l-3 3a5 5 0 007.07 7.07l1-1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  image: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/><path d="M21 15l-5-5-8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  table: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>',
  hr: '<svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="11" width="18" height="2" rx="1" fill="currentColor"/></svg>',
  code: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 6L2 12l6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  quote: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 17h4v-6H7v6zM13 17h4v-6h-4v6z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  toggleSource: '<svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8 16l-4-4 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 8l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  fullscreen: '<svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M3 9V3h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 15v6h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 15v6h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 9V3h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  fontColor: '<svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" fill="none"/><circle cx="12" cy="12" r="4" fill="currentColor"/></svg>',
  bgColor: '<svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" fill="none"/><rect x="7" y="7" width="10" height="10" fill="currentColor"/></svg>',
  fontSize: '<svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><text x="2" y="16" font-size="12" fill="currentColor">A</text></svg>'
};
// ---------- end ICONS_SVG ----------


/* ---------- Toolbar builder ---------- */
function buildToolbar(toolbarConfig, instance) {
  const bar = document.createElement('div'); bar.className = 'wysiwyg-toolbar';
  instance._buttons = {}; // store button refs keyed by command name

  // helpers reuse your addSelect and addColor definitions if present.
  const addBtnIcon = (name, fallbackLabel, handler, opts={}) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.cmd = name;
    b.title = opts.title || fallbackLabel || name;
    b.setAttribute('aria-pressed', 'false');
    // put SVG icon if available
    const icon = (instance && instance.options && instance.options.icons && instance.options.icons[name]) || ICONS_SVG[name];
    if (icon) {
      b.innerHTML = icon;
      // keep icons centered
      b.style.display = 'inline-flex';
      b.style.alignItems = 'center';
      b.style.justifyContent = 'center';
      b.style.width = opts.width || '36px';
      b.style.height = opts.height || '36px';
      b.style.padding = '6px';
    } else {
      b.textContent = fallbackLabel || name;
    }
    b.addEventListener('click', (ev) => {
      try { handler(ev); } catch(err){ console.error('toolbar handler error', err); }
      // update aria-pressed toggles after click (if active logic exists)
      if (instance && typeof updateActiveButtons === 'function') setTimeout(()=>updateActiveButtons(instance), 10);
    });
    bar.appendChild(b);
    instance._buttons[name] = b;
    return b;
  };

  const addBtnText = (label, handler, opts={}) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.innerHTML = label;
    if (opts.title) b.title = opts.title;
    b.addEventListener('click', handler);
    bar.appendChild(b);
    return b;
  };

  // Use your existing addSelect and addColor if defined in scope.
  const addSelect = (optionsList, handler) => {
    const sel = document.createElement('select');
    optionsList.forEach(opt => { const o = document.createElement('option'); o.value = opt.value; o.textContent = opt.label; sel.appendChild(o); });
    sel.addEventListener('change', (e)=>handler(e.target.value));
    bar.appendChild(sel);
    return sel;
  };
  const addColor = (handler, title='Color') => {
    const inp = document.createElement('input'); inp.type='color'; inp.title=title;
    inp.addEventListener('input', (e)=>handler(e.target.value));
    bar.appendChild(inp); return inp;
  };

  toolbarConfig.forEach(item => {
    if (item === '|') { const sep = document.createElement('div'); sep.style.width='8px'; bar.appendChild(sep); return; }

    switch (item) {
  case 'undo': addBtnIcon('undo','Undo', ()=>{ if(instance && typeof instance._undo==='function'){ instance._undo(); } else { execCommand('undo'); } }, {title:'Undo (Ctrl/Cmd+Z)'}); break;
  case 'redo': addBtnIcon('redo','Redo', ()=>{ if(instance && typeof instance._redo==='function'){ instance._redo(); } else { execCommand('redo'); } }, {title:'Redo (Shift+Ctrl/Cmd+Z)'}); break;
      case 'bold': addBtnIcon('bold','Bold', ()=>{ execCommand('bold'); if(instance && instance._saveSnapshot) instance._saveSnapshot(); }, {title:'Bold'}); break;
      case 'italic': addBtnIcon('italic','Italic', ()=>{ execCommand('italic'); if(instance && instance._saveSnapshot) instance._saveSnapshot(); }, {title:'Italic'}); break;
      case 'underline': addBtnIcon('underline','Underline', ()=>{ execCommand('underline'); if(instance && instance._saveSnapshot) instance._saveSnapshot(); }, {title:'Underline'}); break;
      case 'strike': addBtnIcon('strike','Strike', ()=>{ execCommand('strikeThrough'); if(instance && instance._saveSnapshot) instance._saveSnapshot(); }, {title:'Strike'}); break;
      case 'removeFormat': addBtnIcon('removeFormat','Remove format', ()=>{ execCommand('removeFormat'); if(instance && instance._saveSnapshot) instance._saveSnapshot(); }, {title:'Remove formatting'}); break;
      case 'h1': addBtnIcon('h1','H1', ()=>{ execCommand('formatBlock','H1'); if(instance && instance._saveSnapshot) instance._saveSnapshot(); }, {title:'Heading 1'}); break;
      case 'h2': addBtnIcon('h2','H2', ()=>{ execCommand('formatBlock','H2'); if(instance && instance._saveSnapshot) instance._saveSnapshot(); }, {title:'Heading 2'}); break;
      case 'h3': addBtnIcon('h3','H3', ()=>{ execCommand('formatBlock','H3'); if(instance && instance._saveSnapshot) instance._saveSnapshot(); }, {title:'Heading 3'}); break;
      case 'p': addBtnIcon('p','P', ()=>{ execCommand('formatBlock','P'); if(instance && instance._saveSnapshot) instance._saveSnapshot(); }, {title:'Paragraph'}); break;

      case 'fontFamily':
        addSelect([
          { value: '', label: 'Font family' },
          { value: 'Inter', label: 'Inter' },
          { value: 'Arial', label: 'Arial' },
          { value: 'Helvetica', label: 'Helvetica' },
          { value: 'Times New Roman', label: 'Times New Roman' },
          { value: 'Georgia', label: 'Georgia' },
          { value: 'Verdana', label: 'Verdana' },
          { value: 'Tahoma', label: 'Tahoma' },
          { value: 'Trebuchet MS', label: 'Trebuchet MS' },
          { value: 'Courier New', label: 'Courier New' },
          { value: 'Roboto', label: 'Roboto' },
          { value: 'Monospace', label: 'Monospace' }
        ], (v)=>{ if(v){ execCommand('fontName', v); if(instance && instance._saveSnapshot) instance._saveSnapshot(); } });
        break;

      case 'fontSize':
        addSelect([
          {value:'',label:'Font size'},
          {value:'1',label:'Small'},
          {value:'3',label:'Normal'},
          {value:'5',label:'Large'},
          {value:'7',label:'Huge'}
        ], (v)=>{ if(v) execCommand('fontSize', v); else execCommand('fontSize', 3); if(instance && instance._saveSnapshot) instance._saveSnapshot();});
        break;

      case 'fontColor':
        addColor((c)=>{ execCommand('foreColor', c); if(instance && instance._saveSnapshot) instance._saveSnapshot(); }, 'Font color'); break;
      case 'bgColor':
        addColor((c)=>{ execCommand('hiliteColor', c); if(instance && instance._saveSnapshot) instance._saveSnapshot(); }, 'Background color'); break;

      case 'alignLeft': addBtnIcon('alignLeft','Align left', ()=>{ execCommand('justifyLeft'); if(instance && instance._saveSnapshot) instance._saveSnapshot(); }, {title:'Align left'}); break;
      case 'alignCenter': addBtnIcon('alignCenter','Align center', ()=>{ execCommand('justifyCenter'); if(instance && instance._saveSnapshot) instance._saveSnapshot(); }, {title:'Align center'}); break;
      case 'alignRight': addBtnIcon('alignRight','Align right', ()=>{ execCommand('justifyRight'); if(instance && instance._saveSnapshot) instance._saveSnapshot(); }, {title:'Align right'}); break;

      case 'ul': addBtnIcon('ul','Bulleted list', ()=>{ execCommand('insertUnorderedList'); if(instance && instance._saveSnapshot) instance._saveSnapshot(); }, {title:'Bulleted list'}); break;
      case 'ol': addBtnIcon('ol','Numbered list', ()=>{ execCommand('insertOrderedList'); if(instance && instance._saveSnapshot) instance._saveSnapshot(); }, {title:'Numbered list'}); break;
      case 'indent': addBtnIcon('indent','Indent', ()=>{ execCommand('indent'); if(instance && instance._saveSnapshot) instance._saveSnapshot(); }, {title:'Indent'}); break;
      case 'outdent': addBtnIcon('outdent','Outdent', ()=>{ execCommand('outdent'); if(instance && instance._saveSnapshot) instance._saveSnapshot(); }, {title:'Outdent'}); break;

      case 'link': addBtnIcon('link','Link', ()=>openLinkDialog(instance), {title:'Insert link (Ctrl/Cmd+K)'}); break;
      case 'image': addBtnIcon('image','Image', ()=>openImageDialog(instance), {title:'Insert image'}); break;
  case 'table': addBtnIcon('table','Table', ()=>openTableDialog(instance), {title:'Insert table'}); break;
      case 'hr': addBtnIcon('hr','HR', ()=>{ execCommand('insertHorizontalRule'); if(instance && instance._saveSnapshot) instance._saveSnapshot(); }, {title:'Horizontal rule'}); break;
      case 'code': addBtnIcon('code','Code', ()=>insertCode(instance), {title:'Code block'}); break;
      case 'quote': addBtnIcon('quote','Quote', ()=>{ execCommand('formatBlock','BLOCKQUOTE'); if(instance && instance._saveSnapshot) instance._saveSnapshot(); }, {title:'Blockquote'}); break;
      case 'toggleSource': addBtnIcon('toggleSource','Source', ()=>toggleSource(instance), {title:'Toggle source'}); break;
      case 'fullscreen': addBtnIcon('fullscreen','Fullscreen', ()=>toggleFullscreen(instance), {title:'Fullscreen'}); break;

      default:
        // fallback to text button for unknown entries
        addBtnText(item, ()=>execCommand(item), {title:item});
    }
  });

  return bar;
}
  const css = `
.wysiwyg-wrapper{border:1px solid #e2e8f0;border-radius:8px;background:#fff;color:#111;font-family:Inter,system-ui,Arial}
.wysiwyg-toolbar{display:flex;flex-wrap:wrap;gap:6px;padding:8px;background:#f8fafc;border-bottom:1px solid #eef2f7;scrollbar-width:none}
.wysiwyg-toolbar::-webkit-scrollbar{display:none}
.wysiwyg-toolbar button, .wysiwyg-toolbar select, .wysiwyg-toolbar input[type="color"]{background:transparent;border:1px solid #e6edf3;padding:6px 8px;border-radius:6px;cursor:pointer}
.wysiwyg-toolbar button{-webkit-tap-highlight-color:transparent}
.wysiwyg-toolbar button:focus-visible{outline:2px solid #94a3b8;outline-offset:2px}
.wysiwyg-toolbar button svg{display:block;width:16px;height:16px}
.wysiwyg-editor{min-height:120px;padding:14px;outline:none;color:inherit;word-break:break-word;overflow-y:auto}
.wysiwyg-editor[contenteditable='true']{cursor:text}
.wysiwyg-source{width:100%;box-sizing:border-box;padding:10px;border:none;font-family:monospace;min-height:140px;overflow-y:auto}
.wysiwyg-hidden{display:none}
.wysiwyg-progress{height:6px;background:#f1f5f9;border-radius:6px;overflow:hidden;margin-top:6px}
.wysiwyg-progress > i{display:block;height:100%;width:0%;background:#2563eb;border-radius:6px}
.wysiwyg-dialog{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);background:#fff;border-radius:8px;padding:14px;border:1px solid #e6edf3;box-shadow:0 10px 30px rgba(2,6,23,0.08);z-index:9999;width:420px;max-width:92%}
.wysiwyg-dialog .row{margin-bottom:8px}
.wysiwyg-dialog label{display:block;font-size:13px;color:#334155;margin-bottom:6px}
.wysiwyg-dialog input[type=text], .wysiwyg-dialog textarea{width:100%;padding:8px;border:1px solid #e6edf3;border-radius:6px}
.wysiwyg-fullscreen{position:fixed;inset:0;background:#fff;z-index:9998;padding:18px;overflow:auto;padding-left:calc(18px + env(safe-area-inset-left,0));padding-right:calc(18px + env(safe-area-inset-right,0));padding-top:calc(18px + env(safe-area-inset-top,0));padding-bottom:calc(18px + env(safe-area-inset-bottom,0))}

/* Mobile/touch optimizations */
@media (max-width: 640px), (pointer: coarse) {
  .wysiwyg-toolbar{position:sticky;top:calc(env(safe-area-inset-top,0));z-index:1000;flex-wrap:nowrap;overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch;gap:4px;padding:8px 6px}
  .wysiwyg-toolbar button, .wysiwyg-toolbar select, .wysiwyg-toolbar input[type="color"]{min-width:40px;min-height:40px;padding:8px !important}
  .wysiwyg-dialog{inset:env(safe-area-inset-top,0) env(safe-area-inset-right,0) env(safe-area-inset-bottom,0) env(safe-area-inset-left,0);left:auto;top:auto;transform:none;width:auto;max-width:100%;height:auto;max-height:100%;border-radius:0}
}
`;

  function injectCss() {
    if (document.getElementById('wysiwyg-widget-styles')) return;
    const s = document.createElement('style'); s.id = 'wysiwyg-widget-styles'; s.textContent = css; document.head.appendChild(s);
  }

  // Basic sanitizer - expanded
  function sanitizeHtml(html) {
    const div = document.createElement('div'); div.innerHTML = html;
    // remove unsafe tags
    div.querySelectorAll('script,style,iframe,object,embed,link,meta').forEach(n => n.remove());
    const walker = document.createTreeWalker(div, NodeFilter.SHOW_ELEMENT, null);
    const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(el => {
      Array.from(el.attributes || []).forEach(attr => {
        const name = attr.name.toLowerCase(), val = (attr.value || '').toLowerCase();
        if (name.startsWith('on') || (name === 'href' && val.startsWith('javascript:'))) el.removeAttribute(attr.name);
      });
    });
    return div.innerHTML;
  }

  /* ---- Utilities & API helpers ---- */
  function uid(prefix='u') { return prefix + '-' + Math.random().toString(36).slice(2,9); }

  function execCommand(cmd, value=null) { try { document.execCommand(cmd, false, value); } catch(e) { console.warn('execCommand failed', cmd, e); } }


  /* ---- Dialogs ---- */
  function openDialog(htmlContent, onClose) {
    const dlg = document.createElement('div'); dlg.className='wysiwyg-dialog';
    dlg.innerHTML = htmlContent;
    document.body.appendChild(dlg);
    function close() { try{ dlg.remove(); }catch(e){} if(typeof onClose==='function') onClose(); }
    return { dlg, close };
  }

function openLinkDialog(instance) {
  // save user selection (selection will be lost when dialog opens)
  const sel = window.getSelection();
  const savedRanges = [];
  if (sel && sel.rangeCount) {
    for (let i = 0; i < sel.rangeCount; i++) savedRanges.push(sel.getRangeAt(i).cloneRange());
  }

  const currentHtml = getSelectionHtml();
  const content = `
    <div>
      <div class="row"><label>URL</label><input type="text" id="wlink-url" placeholder="https://example.com"></div>
      <div class="row"><label>Text</label><input type="text" id="wlink-text" value="${escapeHtmlAttr(currentHtml || '')}"></div>
      <div style="display:flex;gap:8px;justify-content:flex-end"><button id="wlink-cancel">Cancel</button><button id="wlink-insert">Insert</button></div>
    </div>`;

  const {dlg, close} = openDialog(content);
  dlg.querySelector('#wlink-cancel').addEventListener('click', close);

  dlg.querySelector('#wlink-insert').addEventListener('click', ()=>{
    const url = dlg.querySelector('#wlink-url').value.trim();
    const text = dlg.querySelector('#wlink-text').value.trim();
    if(!url){ alert('URL required'); return; }

    // restore previous selection before inserting
    try {
      const s2 = window.getSelection();
      s2.removeAllRanges();
      if (savedRanges.length) {
        savedRanges.forEach(r => s2.addRange(r));
      }
    } catch (e) { /* ignore */ }

    // insert link
    if (text) {
      execCommand('insertHTML', `<a href="${escapeHtmlAttr(url)}" target="_blank" rel="noopener">${escapeHtml(text)}</a>`);
    } else {
      // if no text provided, use createLink which wraps selection
      execCommand('createLink', url);
    }

    if (instance && instance._saveSnapshot) instance._saveSnapshot();
    close();
  });
}

  function openImageDialog(instance) {
    // simple dialog: choose file or URL
    const content = `
      <div>
        <div class="row"><label>Image URL</label><input type="text" id="wimg-url" placeholder="https://..."></div>
        <div class="row"><label>Or choose file</label><input type="file" id="wimg-file" accept="image/*"></div>
        <div style="display:flex;gap:8px;justify-content:flex-end"><button id="wimg-cancel">Cancel</button><button id="wimg-insert">Insert</button></div>
      </div>`;
    const {dlg, close} = openDialog(content);
    const fileInput = dlg.querySelector('#wimg-file');
    dlg.querySelector('#wimg-cancel').addEventListener('click', close);
    dlg.querySelector('#wimg-insert').addEventListener('click', async ()=>{
      const url = dlg.querySelector('#wimg-url').value.trim();
      const file = fileInput.files && fileInput.files[0];
      if (file) {
        // insert blob preview and upload if configured
        const blobUrl = URL.createObjectURL(file);
        const img = document.createElement('img'); img.src = blobUrl; img.style.maxWidth='100%';
        insertNodeAtCaret(img, instance.editorEl);
        instance._saveSnapshot();
        close();
        // handle upload if available
        handleUploadForImageFile(file, img, instance).catch(err=>{ console.warn(err); });
      } else if (url) {
        execCommand('insertHTML', `<img src="${escapeHtmlAttr(url)}" style="max-width:100%">`);
        instance._saveSnapshot();
        close();
      } else {
        alert('Enter a URL or choose a file');
      }
    });
  }

  async function handleUploadForImageFile(file, imgEl, instance) {
    // if uploadHandler present
    if (typeof instance.options.uploadHandler === 'function') {
      try {
        const res = await instance.options.uploadHandler(file, { onProgress: (p)=>updateInstanceProgress(instance,p) });
        const finalUrl = typeof res === 'string' ? res : (instance.options.parseUploadResponse ? instance.options.parseUploadResponse(res) : (res && res.url));
        if (finalUrl) { imgEl.src = finalUrl; instance._saveSnapshot(); }
      } catch (err) { console.error('uploadHandler error', err); }
      return;
    }
    if (instance.options.uploadUrl) {
      try {
        const json = await uploadFileXHR(file, instance.options, (p)=>updateInstanceProgress(instance,p));
        const finalUrl = instance.options.parseUploadResponse ? instance.options.parseUploadResponse(json) : (json && json.url);
        if (finalUrl) imgEl.src = finalUrl;
      } catch (err) { console.error('uploadFileXHR error', err); }
      return;
    }
    // otherwise leave as blob (ephemeral)
  }

  /* ---- Table insertion (with prompt) ---- */
  function insertTable(instance, rows=2, cols=2) {
    let html = '<table border="1" style="border-collapse:collapse;width:100%">';
    for (let r=0;r<rows;r++){
      html += '<tr>';
      for (let c=0;c<cols;c++) html += '<td style="padding:6px"> </td>';
      html += '</tr>';
    }
    html += '</table><p></p>';
    execCommand('insertHTML', html);
    instance._saveSnapshot();
  }

  function openTableDialog(instance){
    const content = `
      <div>
        <div class="row"><label>Rows</label><input type="text" id="wtable-rows" value="2" inputmode="numeric" pattern="[0-9]*" placeholder="e.g. 3"></div>
        <div class="row"><label>Columns</label><input type="text" id="wtable-cols" value="2" inputmode="numeric" pattern="[0-9]*" placeholder="e.g. 2"></div>
        <div style="display:flex;gap:8px;justify-content:flex-end"><button id="wtable-cancel">Cancel</button><button id="wtable-insert">Insert</button></div>
      </div>`;
    const {dlg, close} = openDialog(content);
    // Save current selection to restore after dialog interaction
    const sel = window.getSelection();
    const savedRanges = [];
    if (sel && sel.rangeCount) {
      for (let i = 0; i < sel.rangeCount; i++) savedRanges.push(sel.getRangeAt(i).cloneRange());
    }
    const rowsEl = dlg.querySelector('#wtable-rows');
    const colsEl = dlg.querySelector('#wtable-cols');
    dlg.querySelector('#wtable-cancel').addEventListener('click', close);
    dlg.querySelector('#wtable-insert').addEventListener('click', ()=>{
      let rows = parseInt(rowsEl.value, 10);
      let cols = parseInt(colsEl.value, 10);
      if(!Number.isFinite(rows) || rows <= 0) { alert('Enter a valid positive number of rows'); return; }
      if(!Number.isFinite(cols) || cols <= 0) { alert('Enter a valid positive number of columns'); return; }
      // Restore selection and focus editor before inserting
      try {
        const s2 = window.getSelection();
        s2.removeAllRanges();
        if (savedRanges.length) savedRanges.forEach(r => s2.addRange(r));
      } catch (e) { /* ignore */ }
      if (instance && instance.editorEl) instance.editorEl.focus();
      insertTable(instance, rows, cols);
      close();
    });
  }

  /* ---- Code block (pre>code) ---- */
  function insertCode(instance) {
    const sel = getSelectionHtml();
    if (sel) {
      execCommand('insertHTML', `<pre><code>${escapeHtml(sel)}</code></pre>`);
    } else {
      execCommand('insertHTML', `<pre><code>// code here</code></pre>`);
    }
    instance._saveSnapshot();
  }

  /* ---- Source toggle ---- */
  function toggleSource(instance) {
    const {editorEl, sourceEl} = instance;
    if (!editorEl || !sourceEl) return;
    if (sourceEl.classList.contains('wysiwyg-hidden')) {
      sourceEl.value = editorEl.innerHTML;
      editorEl.classList.add('wysiwyg-hidden'); sourceEl.classList.remove('wysiwyg-hidden');
      sourceEl.focus();
    } else {
      const raw = sourceEl.value;
      editorEl.innerHTML = instance.options.sanitize ? sanitizeHtml(raw) : raw;
      sourceEl.classList.add('wysiwyg-hidden'); editorEl.classList.remove('wysiwyg-hidden');
      instance._saveSnapshot();
    }
  }

  /* ---- Fullscreen ---- */
  function toggleFullscreen(instance) {
    if (!instance) return;
    if (!instance.fullscreen) {
      instance._origParent = instance.wrapper.parentNode;
      instance._origNext = instance.wrapper.nextSibling;
      instance.wrapper.classList.add('wysiwyg-fullscreen');
      instance.fullscreen = true;
    } else {
      instance.wrapper.classList.remove('wysiwyg-fullscreen');
      instance.fullscreen = false;
    }
  }

  /* ---- Upload via XHR (progress) ---- */
  function uploadFileXHR(file, opts={}, progressCb){
    const uploadUrl = opts.uploadUrl; const fieldName = opts.uploadFieldName || 'image'; const headers = opts.uploadHeaders || {};
    if (!uploadUrl) return Promise.reject(new Error('uploadUrl not specified'));
    return new Promise((resolve,reject)=>{
      const xhr = new XMLHttpRequest(); const fd = new FormData(); fd.append(fieldName, file, file.name);
      xhr.open('POST', uploadUrl, true);
      Object.keys(headers).forEach(h=>{ try{ xhr.setRequestHeader(h, headers[h]); }catch(e){} });
      xhr.upload.onprogress = (evt)=>{ if(evt.lengthComputable && typeof progressCb === 'function'){ progressCb(Math.round((evt.loaded/evt.total)*100), evt.loaded, evt.total); } };
      xhr.onreadystatechange = ()=>{ if(xhr.readyState!==4) return; if(xhr.status>=200 && xhr.status<300){ try{ resolve(JSON.parse(xhr.responseText)); } catch(err){ reject(new Error('Invalid JSON from upload endpoint')); } } else reject(new Error('Upload failed: '+xhr.status)); };
      xhr.onerror = ()=>reject(new Error('Network error'));
      xhr.send(fd);
    });
  }

  /* ---- Progress UI per instance ---- */
  function showInstanceProgress(instance) {
    if(!instance) return;
    let p = instance.wrapper.querySelector('.wysiwyg-progress'); if(!p){ p = document.createElement('div'); p.className='wysiwyg-progress'; const i=document.createElement('i'); p.appendChild(i); instance.wrapper.appendChild(p); }
    p.style.display=''; updateInstanceProgress(instance, 0); return p;
  }
  function updateInstanceProgress(instance, percent){
    if(!instance) return; const p = instance.wrapper.querySelector('.wysiwyg-progress'); if(!p) return; p.firstElementChild.style.width = Math.max(0,Math.min(100,percent||0))+'%';
  }
  function hideInstanceProgress(instance){ if(!instance) return; const p = instance.wrapper.querySelector('.wysiwyg-progress'); if(!p) return; setTimeout(()=>{ p.style.display='none'; updateInstanceProgress(instance,0); }, 250); }

  /* ---- Insert node helper ---- */
  function insertNodeAtCaret(node, editorEl) {
    const sel = window.getSelection();
    if(!sel || !sel.rangeCount){ editorEl.appendChild(node); return; }
    const range = sel.getRangeAt(0); range.deleteContents(); range.insertNode(node);
    range.setStartAfter(node); range.setEndAfter(node); sel.removeAllRanges(); sel.addRange(range);
  }

  /* ---- Selection helpers ---- */
  function getSelectionHtml() {
    const sel = window.getSelection(); if(!sel || sel.rangeCount===0) return '';
    const container = document.createElement('div'); for(let i=0;i<sel.rangeCount;i++){ container.appendChild(sel.getRangeAt(i).cloneContents()); } return container.innerHTML;
  }

  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function escapeHtmlAttr(s){ return escapeHtml(s).replace(/"/g,'&quot;'); }

  /* ---- Placeholder handling ---- */
  /* ---- Sync helpers (sync editor <-> textarea) ---- */
  function syncToTextarea(instance){
    if(!instance) return;
    const { editorEl, textarea, options } = instance || {};
    if(!textarea) return;
    textarea.value = options && options.sanitize ? sanitizeHtml((editorEl && editorEl.innerHTML) || '') : (editorEl && editorEl.innerHTML) || '';
  }

  function syncFromTextarea(instance){
    if(!instance) return;
    const { editorEl, textarea } = instance || {};
    if(!editorEl || !textarea) return;
    editorEl.innerHTML = textarea.value || '';
  }

  function updateActiveButtons(instance){
    if(!instance || !instance._buttons) return;
    const btns = instance._buttons;
    // Inline states via queryCommandState
    const inlineStates = {
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      strike: document.queryCommandState('strikeThrough')
    };
    Object.keys(inlineStates).forEach(k=>{
      const b = btns[k]; if(!b) return; b.classList.toggle('active', !!inlineStates[k]); b.setAttribute('aria-pressed', inlineStates[k] ? 'true' : 'false');
    });

    // Lists
    const ulState = document.queryCommandState('insertUnorderedList');
    const olState = document.queryCommandState('insertOrderedList');
    if(btns['ul']) { btns['ul'].classList.toggle('active', !!ulState); btns['ul'].setAttribute('aria-pressed', ulState? 'true':'false'); }
    if(btns['ol']) { btns['ol'].classList.toggle('active', !!olState); btns['ol'].setAttribute('aria-pressed', olState? 'true':'false'); }

    // Alignment
    ['alignLeft','alignCenter','alignRight'].forEach(k=>{
      let state = false;
      if(k==='alignLeft') state = document.queryCommandState('justifyLeft');
      if(k==='alignCenter') state = document.queryCommandState('justifyCenter');
      if(k==='alignRight') state = document.queryCommandState('justifyRight');
      if(btns[k]) { btns[k].classList.toggle('active', !!state); btns[k].setAttribute('aria-pressed', state? 'true':'false'); }
    });

    // Block type detection (H1,H2,P,BLOCKQUOTE,PRE)
    try{
      const sel = window.getSelection();
      let node = sel && sel.anchorNode;
      if(node && node.nodeType===3) node = node.parentNode;
      let blockTag = null;
      while(node && node !== instance.editorEl){ if(node.nodeType===1){ blockTag = node.tagName; if(blockTag) break; } node = node.parentNode; }
      blockTag = blockTag ? blockTag.toUpperCase() : null;
      // map buttons
      if(btns['h1']) btns['h1'].classList.toggle('active', blockTag==='H1');
      if(btns['h2']) btns['h2'].classList.toggle('active', blockTag==='H2');
      if(btns['h3']) btns['h3'].classList.toggle('active', blockTag==='H3');
      if(btns['p']) btns['p'].classList.toggle('active', !blockTag || blockTag==='P' || blockTag==='DIV');
      if(btns['quote']) btns['quote'].classList.toggle('active', blockTag==='BLOCKQUOTE');
      if(btns['code']) btns['code'].classList.toggle('active', blockTag==='PRE');
    }catch(e){}

    // Link detection (if selection is inside an <a>)
    try{
      const sel = window.getSelection(); let node = sel && sel.anchorNode; let insideLink = false;
      while(node && node !== instance.editorEl){ if(node.nodeType===1 && node.tagName==='A'){ insideLink = true; break; } node = node.parentNode; }
      if(btns['link']) { btns['link'].classList.toggle('active', !!insideLink); btns['link'].setAttribute('aria-pressed', insideLink? 'true':'false'); }
    }catch(e){}

    // Image detection (selection contains img)
    try{
      const sel = window.getSelection(); let hasImg = false;
      if(sel && sel.rangeCount){ const c = document.createElement('div'); for(let i=0;i<sel.rangeCount;i++) c.appendChild(sel.getRangeAt(i).cloneContents()); if(c.querySelector && c.querySelector('img')) hasImg = true; }
      if(btns['image']) btns['image'].classList.toggle('active', !!hasImg);
    }catch(e){}
  }

  function showPlaceholderIfNeeded(instance){
    const ed = instance.editorEl;
    if(!ed) return;
    if(ed.textContent.trim().length===0 && ed.querySelectorAll('img,table,pre,iframe').length===0){
      ed.dataset.placeholderVisible = '1';
      ed.innerHTML = `<p style="color:#94a3b8">${escapeHtml(instance.options.placeholder||'Start typing...')}</p>`;
    }
  }
  function removePlaceholder(instance){
    const ed = instance.editorEl;
    if(ed && ed.dataset.placeholderVisible==='1'){ ed.innerHTML=''; delete ed.dataset.placeholderVisible; }
  }

  /* ---- History / snapshots (simple) ---- */
  function initHistory(instance){
    instance._history = []; instance._historyIndex = -1;
    instance._saveSnapshot = function(){
      try{
        const html = instance.editorEl.innerHTML;
        // avoid pushing duplicate consecutive states
        if(instance._historyIndex>=0 && instance._history[instance._historyIndex]===html) return;
        instance._history.splice(instance._historyIndex+1);
        instance._history.push(html);
        instance._historyIndex = instance._history.length-1;
        // keep capped
        if(instance._history.length>100) instance._history.shift();
      } catch(e){ console.warn('history save failed', e); }
    };
    instance._undo = function(){ if(instance._historyIndex>0){ instance._historyIndex--; instance.editorEl.innerHTML = instance._history[instance._historyIndex]; syncToTextarea(instance); } };
    instance._redo = function(){ if(instance._historyIndex < instance._history.length-1){ instance._historyIndex++; instance.editorEl.innerHTML = instance._history[instance._historyIndex]; syncToTextarea(instance); } };
    // initial snapshot
    instance._saveSnapshot();
  }

  /* ---- Keyboard shortcuts ---- */
  function installShortcuts(instance){
    window.addEventListener('keydown', instance._shortcuts = function(e){
      const mod = e.ctrlKey || e.metaKey;
      // Undo / Redo shortcuts
      if(mod && !e.shiftKey && e.key.toLowerCase()==='z'){ e.preventDefault(); if(typeof instance._undo==='function') instance._undo(); else execCommand('undo'); }
      if(mod && e.shiftKey && e.key.toLowerCase()==='z'){ e.preventDefault(); if(typeof instance._redo==='function') instance._redo(); else execCommand('redo'); }
      if(mod && e.key.toLowerCase()==='b'){ e.preventDefault(); execCommand('bold'); instance._saveSnapshot(); }
      if(mod && e.key.toLowerCase()==='i'){ e.preventDefault(); execCommand('italic'); instance._saveSnapshot(); }
      if(mod && e.key.toLowerCase()==='u'){ e.preventDefault(); execCommand('underline'); instance._saveSnapshot(); }
      if(mod && e.key.toLowerCase()==='k'){ e.preventDefault(); openLinkDialog(instance); }
      if(mod && e.key.toLowerCase()==='s'){ e.preventDefault(); // save/export
        // user may attach autosave; we'll sync to textarea and call onSave if provided
        syncToTextarea(instance);
        if(typeof instance.options.onSave === 'function') instance.options.onSave(instance.getHTML());
      }
    });
  }

  /* ---- Paste sanitization ---- */
function installPasteHandler(instance){
  // Enhanced paste handler: prefer HTML from clipboard, fallback to plain text.
  // Also support pasted image files (insert blob preview + optional upload).
  instance.editorEl.addEventListener('paste', async function(e){
    e.preventDefault();
    const dt = e.clipboardData || window.clipboardData;
    if(!dt) return;

    // 1) If there are files (images) in clipboard, handle them first
    if(dt.files && dt.files.length){
      for(let i=0;i<dt.files.length;i++){
        const f = dt.files[i];
        if(f.type && f.type.startsWith('image/')){
          // insert blob preview immediately
          const blobUrl = URL.createObjectURL(f);
          const img = document.createElement('img'); img.src = blobUrl; img.style.maxWidth='100%'; img.dataset._blobUrl = blobUrl;
          insertNodeAtCaret(img, instance.editorEl);
          instance._saveSnapshot();
          syncToTextarea(instance);
          // try upload if configured
          handleUploadForImageFile(f, img, instance).catch(err=>{ console.warn('paste image upload failed', err); });
        } else {
          // for non-image files, ignore or you could implement other handlers
        }
      }
      return;
    }

    // 2) Prefer HTML content when available
    const html = dt.getData && dt.getData('text/html');
    if(html && html.trim()){
      const applied = instance.options && instance.options.sanitize ? sanitizeHtml(html) : html;
      // insertHTML at caret
      execCommand('insertHTML', applied);
      instance._saveSnapshot();
      syncToTextarea(instance);
      // update active buttons
      try{ updateActiveButtons(instance); }catch(e){}
      return;
    }

    // 3) Fallback to plain text
    const text = dt.getData && (dt.getData('text/plain') || '');
    if(text){
      // preserve newlines -> paragraphs
      const out = text.split(/\r?\n/).map(line=>`<p>${escapeHtml(line)}</p>`).join('');
      execCommand('insertHTML', out);
      instance._saveSnapshot();
      syncToTextarea(instance);
      try{ updateActiveButtons(instance); }catch(e){}
      return;
    }

    // nothing handled
  });
}

  /* ---- Autosave to localStorage (optional) ---- */
  function installAutosave(instance){
    if(!instance.options.autosaveKey) return;
    const key = instance.options.autosaveKey;
    // load
    const saved = localStorage.getItem(key);
    if(saved) { instance.editorEl.innerHTML = saved; }
    // periodical save
    instance._autosaveTimer = setInterval(()=>{ localStorage.setItem(key, instance.editorEl.innerHTML); }, 3000);
  }

  /* ---- API methods for instance ---- */
  function applyInstanceAPIs(instance){
    instance.getHTML = ()=> instance.editorEl.innerHTML;
    instance.setHTML = (html)=>{ instance.editorEl.innerHTML = html; syncToTextarea(instance); instance._saveSnapshot(); };
    instance.getText = ()=> instance.editorEl.innerText;
    instance.insertHtml = (html)=>{ execCommand('insertHTML', html); instance._saveSnapshot(); };
    instance.destroy = ()=>{
      // remove event listeners and DOM, reveal textarea
      try{
        if(instance._autosaveTimer) clearInterval(instance._autosaveTimer);
        if(instance._shortcuts) window.removeEventListener('keydown', instance._shortcuts);
        instance.wrapper.remove();
        instance.textarea.style.display = '';
        delete instance.textarea._wysiwyg;
      }catch(e){ console.warn('destroy failed', e); }
    };
  }

  /* ---- Main enhanceTextarea ---- */
  function enhanceTextarea(textarea, options){
    injectCss();
    const opts = Object.assign({}, defaultOptions, options || {});
    const wrapper = document.createElement('div'); wrapper.className = 'wysiwyg-wrapper';
    const editorEl = document.createElement('div'); editorEl.className = 'wysiwyg-editor'; editorEl.contentEditable = true; 
    editorEl.style.minHeight = (opts.height||300)+'px';
    if (opts.maxHeight) {
      editorEl.style.maxHeight = opts.maxHeight + 'px';
      editorEl.style.overflowY = 'auto';
    }
    editorEl.innerHTML = textarea.value || '';
    const sourceEl = document.createElement('textarea'); sourceEl.className='wysiwyg-source wysiwyg-hidden'; 
    sourceEl.style.minHeight = (opts.height||300)+'px';
    if (opts.maxHeight) {
      sourceEl.style.maxHeight = opts.maxHeight + 'px';
      sourceEl.style.overflowY = 'auto';
    }

    const instance = { textarea, wrapper, editorEl, sourceEl, options: opts, fullscreen:false };
    instancesList.push(instance);
    const toolbar = buildToolbar(opts.toolbar, instance);
    wrapper.appendChild(toolbar);
    wrapper.appendChild(editorEl);
    wrapper.appendChild(sourceEl);
    textarea.style.display = 'none';
    textarea.parentNode.insertBefore(wrapper, textarea.nextSibling);

    // initialize features
    initHistory(instance);
    installShortcuts(instance);
    installPasteHandler(instance);
    installAutosave(instance);
    applyInstanceAPIs(instance);

    // basic events
    editorEl.addEventListener('input', ()=>{ syncToTextarea(instance); instance._saveSnapshot(); });
    sourceEl.addEventListener('input', ()=>{ /* editing source */ });
    textarea.addEventListener('change', ()=>{ instance.editorEl.innerHTML = textarea.value || ''; });
    const form = textarea.closest('form'); if(form) form.addEventListener('submit', ()=> syncToTextarea(instance));

    // run plugins
    if(Array.isArray(opts.plugins)){
      opts.plugins.forEach(fn => { try{ fn(instance); }catch(e){ console.warn('plugin failed', e); } });
    }

    // expose debugging handle
    textarea._wysiwyg = instance;

    return instance;
  }

  /* ---- Public init ---- */
  function init(selectorOrList, options){
    const sel = selectorOrList || defaultOptions.selector;
    let nodes = [];
    if(typeof sel === 'string') nodes = Array.from(document.querySelectorAll(sel));
    else if(sel instanceof NodeList || Array.isArray(sel)) nodes = Array.from(sel);
    else if(sel instanceof HTMLTextAreaElement) nodes = [sel];
    return nodes.map(n => enhanceTextarea(n, options));
  }

  document.addEventListener('selectionchange', ()=>{ instancesList.forEach(inst=>{ try{ updateActiveButtons(inst); }catch(e){} }); });
  /* ---- Cleanup on unload: revoke blob URLs inserted with data attribute _blobUrl ---- */
  window.addEventListener('beforeunload', () => {
    document.querySelectorAll('img').forEach(img => {
      if(img.dataset && img.dataset._blobUrl){ try{ URL.revokeObjectURL(img.dataset._blobUrl); }catch(e){} }
    });
  });

  // expose API
  global.WYSIWYG = { init, sanitizeHtml };
  try { if(!global.KriaLite) global.KriaLite = global.WYSIWYG; } catch(e) {}

})(window);