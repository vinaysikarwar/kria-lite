/* kria.editor.v2.js
  Kria Lite WYSIWYG Editor v0.2.0 — Enhanced Edition
  - WYSIWYG.v2.init(selectorOrNodeList, options)
  - KriaLite.v2 alias mirrors WYSIWYG.v2
  - Developed By Vinay Sikarwar
  - Core Enhancements: Advanced tables, media handling, text formatting
  - Advanced Features: Find/Replace, collaboration hooks, templates
  - Backward compatible with v0.1.x API
*/
(function (global) {
  'use strict';
  if (global.WYSIWYG && global.WYSIWYG.v2) return;

  const defaultOptions = {
    selector: '.wysiwyg',
    height: 360,
    maxHeight: 750,
    placeholder: 'Start typing...',
    sanitize: true,
    autosaveKey: null,
    // Enhanced toolbar with v2 features
    toolbar: [
      'undo','redo','|',
      'bold','italic','underline','strike','highlight','subscript','superscript','removeFormat','|',
      'h1','h2','h3','h4','h5','h6','p','|',
      'fontFamily','fontSize','lineHeight','fontColor','bgColor','|',
      'alignLeft','alignCenter','alignRight','alignJustify','|',
      'ul','ol','checklist','indent','outdent','|',
      'link','image','video','table','hr','|',
      'code','quote','collapsible','|',
      'findReplace','wordCount','|',
      'templates','insertSnippet','|',
      'toggleSource','fullscreen'
    ],
    // New v2 options
    collaboration: {
      enabled: false,
      userId: null,
      userName: null,
      onComment: null,
      onMention: null
    },
    templates: [
      { 
        name: 'Meeting Notes', 
        description: 'Template for meeting minutes with agenda and action items',
        content: '<h2>📋 Meeting Notes</h2><p><strong>Date:</strong> ' + new Date().toLocaleDateString() + '</p><p><strong>Attendees:</strong></p><p><strong>Agenda:</strong></p><ul><li>Topic 1</li><li>Topic 2</li></ul><h3>Action Items</h3><ul class="wysiwyg-checklist"><li>Action item 1</li><li>Action item 2</li></ul>' 
      },
      { 
        name: 'Article Template', 
        description: 'Professional article layout with title, introduction and sections',
        content: '<h1>📝 Article Title</h1><p style="font-size:18px;color:#6b7280;font-style:italic;">Write your compelling introduction here...</p><h2>Section 1</h2><p>Your content goes here...</p><h2>Section 2</h2><p>More content...</p><h2>Conclusion</h2><p>Wrap up your article...</p>' 
      },
      {
        name: 'Project Plan',
        description: 'Project planning template with phases and tasks',
        content: '<h2>🚀 Project Plan</h2><p><strong>Project Name:</strong></p><p><strong>Timeline:</strong></p><div class="wysiwyg-collapsible"><div class="wysiwyg-collapsible-header">Phase 1: Planning</div><div class="wysiwyg-collapsible-content"><ul class="wysiwyg-checklist"><li>Requirement gathering</li><li>Timeline creation</li><li>Resource allocation</li></ul></div></div><div class="wysiwyg-collapsible"><div class="wysiwyg-collapsible-header">Phase 2: Implementation</div><div class="wysiwyg-collapsible-content"><ul class="wysiwyg-checklist"><li>Development tasks</li><li>Testing procedures</li></ul></div></div>'
      },
      {
        name: 'Report Template',
        description: 'Professional report structure with summary and findings',
        content: '<h1>📊 Report Title</h1><p><strong>Date:</strong> ' + new Date().toLocaleDateString() + '</p><p><strong>Prepared by:</strong></p><h2>Executive Summary</h2><p>Brief overview of key findings...</p><h2>Methodology</h2><p>Describe your approach...</p><h2>Findings</h2><p>Present your results...</p><h2>Recommendations</h2><ul><li>Recommendation 1</li><li>Recommendation 2</li></ul>'
      }
    ],
    snippets: [
      { 
        name: '💡 Tip Box', 
        description: 'Highlighted information box for tips and helpful hints',
        content: '<div style="background:#dbeafe;border-left:4px solid #3b82f6;padding:12px;border-radius:6px;margin:8px 0;">💡 <strong>Tip:</strong> Your helpful tip here</div>' 
      },
      { 
        name: '⚠️ Warning Box', 
        description: 'Attention-grabbing warning or caution message',
        content: '<div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:12px;border-radius:6px;margin:8px 0;">⚠️ <strong>Warning:</strong> Important notice here</div>' 
      },
      {
        name: '✅ Success Box',
        description: 'Positive feedback or success message box',
        content: '<div style="background:#dcfce7;border-left:4px solid #22c55e;padding:12px;border-radius:6px;margin:8px 0;">✅ <strong>Success:</strong> Great job! Task completed.</div>'
      },
      {
        name: '📝 Quote Block',
        description: 'Styled blockquote for important quotes or testimonials',
        content: '<blockquote style="border-left:4px solid #9ca3af;padding:12px 16px;margin:16px 0;background:#f9fafb;font-style:italic;"><p>"Your quote or testimonial here..."</p><footer style="margin-top:8px;font-size:14px;color:#6b7280;">— Source Name</footer></blockquote>'
      },
      {
        name: '📋 Checklist',
        description: 'Interactive checklist for tasks and to-do items',
        content: '<h3>📋 Checklist</h3><ul class="wysiwyg-checklist"><li>Task 1</li><li>Task 2</li><li>Task 3</li></ul>'
      },
      {
        name: '📊 Simple Table',
        description: 'Basic table structure for data presentation',
        content: '<table class="wysiwyg-table-advanced"><thead><tr><th>Column 1</th><th>Column 2</th><th>Column 3</th></tr></thead><tbody><tr><td>Data 1</td><td>Data 2</td><td>Data 3</td></tr><tr><td>Data 4</td><td>Data 5</td><td>Data 6</td></tr></tbody></table>'
      }
    ],
    features: {
      dragDrop: true,
      imageResize: true,
      tableAdvanced: true,
      wordCount: true,
      findReplace: true,
      spellCheck: false,
      autoComplete: false
    },
    // Upload settings
    uploadUrl: null,
    uploadFieldName: 'image',
    uploadHeaders: {},
    onUploadProgress: null,
    parseUploadResponse: (json) => (json && (json.url || json.data && json.data.url)) || null,
    uploadHandler: null,
    // Advanced callbacks
    onWordCountUpdate: null,
    onContentChange: null,
    onSelectionChange: null,
    plugins: []
  };

  const instancesList = [];
  let wordCountUpdateTimer = null;

  // Enhanced icons with new v2 features
  const ICONS_SVG = {
    // Basic formatting (unchanged from v1)
    bold: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M7 7h5a3 3 0 010 6H7zM7 13h6a3 3 0 110 6H7z"/></svg>',
    italic: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 4h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M6 20h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M15 4L9 20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    underline: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 3v7a7 7 0 0014 0V3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M4 21h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    strike: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 12h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    
    // New v2 text formatting
    highlight: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 11H5l4-7 4 7h-4v7l-4-7z" fill="currentColor"/></svg>',
    subscript: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M3 7h6v2H3zM3 13h6v2H3zM15 21h4v-2h-4v-1h3a1 1 0 000-2h-3v2z"/><text x="12" y="12" font-size="8">X₂</text></svg>',
    superscript: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M3 7h6v2H3zM3 13h6v2H3zM15 9h4V7h-4V6h3a1 1 0 000-2h-3v2z"/><text x="12" y="8" font-size="8">X²</text></svg>',
    
    // Structure
    checklist: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2" fill="none"/></svg>',
    collapsible: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    
    // Media
    video: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" stroke-width="2"/><path d="M8 21h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M12 17v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><polygon points="10,8 16,12 10,16" fill="currentColor"/></svg>',
    
    // Tools
    findReplace: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/><path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    wordCount: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><polyline points="10,9 9,9 8,9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    templates: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/><path d="M9 9h6v6H9z" stroke="currentColor" stroke-width="2"/></svg>',
    insertSnippet: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 6L2 12l6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 2v20" stroke="currentColor" stroke-width="1" stroke-linecap="round"/></svg>',
    
    // Alignment (enhanced)
    alignJustify: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="4" width="18" height="2" rx="1" fill="currentColor"/><rect x="3" y="9" width="18" height="2" rx="1" fill="currentColor"/><rect x="3" y="14" width="18" height="2" rx="1" fill="currentColor"/></svg>',
    lineHeight: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M21 3v18" stroke="currentColor" stroke-width="1"/></svg>',
    
    // Copy existing icons from v1
    undo: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 8H4V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 8a9 9 0 109 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    redo: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 8h5V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 8a9 9 0 11-9 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    removeFormat: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 7h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M12 3v14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
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

  /* ---- Enhanced CSS with v2 features ---- */
  const css = `
.wysiwyg-wrapper{border:1px solid #e2e8f0;border-radius:8px;background:#fff;color:#111;font-family:Inter,system-ui,Arial;position:relative}
.wysiwyg-toolbar{display:flex;flex-wrap:wrap;gap:6px;padding:8px;background:#f8fafc;border-bottom:1px solid #eef2f7;scrollbar-width:none}
.wysiwyg-toolbar::-webkit-scrollbar{display:none}
.wysiwyg-toolbar button, .wysiwyg-toolbar select, .wysiwyg-toolbar input[type="color"]{background:transparent;border:1px solid #e6edf3;padding:6px 8px;border-radius:6px;cursor:pointer;transition:all 0.2s}
.wysiwyg-toolbar button:hover{background:#f1f3f4;border-color:#d1d5db}
.wysiwyg-toolbar button.active{background:#e3f2fd;border-color:#2196f3;color:#1976d2}
.wysiwyg-toolbar button{-webkit-tap-highlight-color:transparent}
.wysiwyg-toolbar button:focus-visible{outline:2px solid #94a3b8;outline-offset:2px}
.wysiwyg-toolbar button svg{display:block;width:16px;height:16px}
.wysiwyg-editor{min-height:120px;padding:14px;outline:none;color:inherit;word-break:break-word;overflow-y:auto;position:relative}
.wysiwyg-editor[contenteditable='true']{cursor:text}
.wysiwyg-source{width:100%;box-sizing:border-box;padding:10px;border:none;font-family:monospace;min-height:140px;overflow-y:auto}
.wysiwyg-hidden{display:none}
.wysiwyg-progress{height:6px;background:#f1f5f9;border-radius:6px;overflow:hidden;margin-top:6px}
.wysiwyg-progress > i{display:block;height:100%;width:0%;background:#2563eb;border-radius:6px}
.wysiwyg-dialog{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);background:#fff;border-radius:8px;padding:14px;border:1px solid #e6edf3;box-shadow:0 10px 30px rgba(2,6,23,0.08);z-index:9999;width:420px;max-width:92%}
.wysiwyg-dialog .row{margin-bottom:8px}
.wysiwyg-dialog label{display:block;font-size:13px;color:#334155;margin-bottom:6px}
.wysiwyg-dialog input[type=text], .wysiwyg-dialog textarea, .wysiwyg-dialog select{width:100%;padding:8px;border:1px solid #e6edf3;border-radius:6px}
.wysiwyg-fullscreen{position:fixed;inset:0;background:#fff;z-index:9998;padding:18px;overflow:auto;padding-left:calc(18px + env(safe-area-inset-left,0));padding-right:calc(18px + env(safe-area-inset-right,0));padding-top:calc(18px + env(safe-area-inset-top,0));padding-bottom:calc(18px + env(safe-area-inset-bottom,0))}

/* V2 Enhanced Features */
.wysiwyg-highlight{background-color:#ffeb3b;padding:0 2px}
.wysiwyg-checklist{list-style:none}
.wysiwyg-checklist li{position:relative;padding-left:24px}
.wysiwyg-checklist li:before{content:'☐';position:absolute;left:0;top:0;font-size:16px;cursor:pointer}
.wysiwyg-checklist li.checked:before{content:'☑'}
.wysiwyg-collapsible{border:1px solid #e2e8f0;border-radius:6px;margin:8px 0}
.wysiwyg-collapsible-header{background:#f8fafc;padding:8px 12px;cursor:pointer;border-bottom:1px solid #e2e8f0;font-weight:500}
.wysiwyg-collapsible-content{padding:12px;display:none}
.wysiwyg-collapsible.open .wysiwyg-collapsible-content{display:block}
.wysiwyg-word-count{position:absolute;bottom:8px;right:12px;font-size:12px;color:#6b7280;background:rgba(255,255,255,0.9);padding:2px 6px;border-radius:4px}
.wysiwyg-find-replace{position:absolute;top:8px;right:8px;background:#fff;border:1px solid #e2e8f0;border-radius:6px;padding:12px;box-shadow:0 4px 12px rgba(0,0,0,0.1);z-index:1000;min-width:320px;display:flex;flex-wrap:wrap;align-items:center;gap:4px}
.wysiwyg-find-replace input{width:140px;padding:6px 8px;border:1px solid #d1d5db;border-radius:4px;font-size:13px}
.wysiwyg-find-replace input:focus{outline:2px solid #3b82f6;outline-offset:1px;border-color:#3b82f6}
.wysiwyg-find-replace button{padding:6px 10px;border:1px solid #d1d5db;border-radius:4px;background:#fff;cursor:pointer;font-size:12px;font-weight:500;transition:all 0.2s}
.wysiwyg-find-replace button:hover{background:#f1f3f4;border-color:#9ca3af}
.wysiwyg-find-replace button:active{background:#e5e7eb}
.wysiwyg-find-replace #close-find{background:#ef4444;color:#fff;border-color:#ef4444;width:24px;height:24px;padding:0;display:flex;align-items:center;justify-content:center;font-size:14px;line-height:1}
.wysiwyg-find-replace #close-find:hover{background:#dc2626}
.wysiwyg-find-replace #find-status{font-size:11px;color:#6b7280;white-space:nowrap}
.wysiwyg-templates-panel{position:absolute;top:45px;left:8px;background:#fff;border:1px solid #e2e8f0;border-radius:6px;padding:8px;box-shadow:0 4px 12px rgba(0,0,0,0.1);z-index:1000;max-width:300px}
.wysiwyg-template-item{padding:8px 12px;cursor:pointer;border-radius:4px;margin:2px 0}
.wysiwyg-template-item:hover{background:#f1f3f4}
.wysiwyg-image-resize{position:absolute;width:8px;height:8px;background:#2196f3;border:1px solid #fff;border-radius:2px;cursor:nw-resize}
.wysiwyg-video-wrapper{position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:6px;margin:8px 0}
.wysiwyg-video-wrapper iframe{position:absolute;top:0;left:0;width:100%;height:100%;border:0}

/* Enhanced table styles */
.wysiwyg-table-advanced{border-collapse:collapse;width:100%;margin:8px 0}
.wysiwyg-table-advanced th,.wysiwyg-table-advanced td{border:1px solid #e2e8f0;padding:8px 12px;text-align:left}
.wysiwyg-table-advanced th{background:#f8fafc;font-weight:600}
.wysiwyg-table-advanced tr:nth-child(even){background:#fafbfc}
.wysiwyg-table-controls{position:absolute;background:#fff;border:1px solid #e2e8f0;border-radius:6px;padding:8px;box-shadow:0 4px 12px rgba(0,0,0,0.1);z-index:1000}
.wysiwyg-table-controls button{padding:4px 8px;margin:2px;border:1px solid #d1d5db;border-radius:4px;background:#fff;cursor:pointer}

/* Enhanced tooltips */
.wysiwyg-toolbar button[title]:hover::after, .wysiwyg-toolbar select[title]:hover::after, .wysiwyg-toolbar input[title]:hover::after {
  content: attr(title);
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: #1f2937;
  color: #f9fafb;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 10000;
  max-width: 250px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  pointer-events: none;
}

.wysiwyg-toolbar button[title]:hover::before, .wysiwyg-toolbar select[title]:hover::before, .wysiwyg-toolbar input[title]:hover::before {
  content: '';
  position: absolute;
  bottom: calc(100% + 2px);
  left: 50%;
  transform: translateX(-50%);
  border: 4px solid transparent;
  border-top-color: #1f2937;
  z-index: 10000;
  pointer-events: none;
}

/* Enhanced dialog tooltips */
.wysiwyg-dialog input[title]:hover::after, .wysiwyg-dialog button[title]:hover::after, .wysiwyg-dialog label[title]:hover::after {
  content: attr(title);
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  background: #1f2937;
  color: #f9fafb;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 10001;
  max-width: 200px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  pointer-events: none;
}

/* Mobile/touch optimizations */
@media (max-width: 640px), (pointer: coarse) {
  .wysiwyg-toolbar{position:sticky;top:calc(env(safe-area-inset-top,0));z-index:1000;flex-wrap:nowrap;overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch;gap:4px;padding:8px 6px}
  .wysiwyg-toolbar button, .wysiwyg-toolbar select, .wysiwyg-toolbar input[type="color"]{min-width:40px;min-height:40px;padding:8px !important}
  .wysiwyg-dialog{inset:env(safe-area-inset-top,0) env(safe-area-inset-right,0) env(safe-area-inset-bottom,0) env(safe-area-inset-left,0);left:auto;top:auto;transform:none;width:auto;max-width:100%;height:auto;max-height:100%;border-radius:0}
  .wysiwyg-find-replace{position:relative;top:auto;right:auto;margin:8px 0}
  .wysiwyg-templates-panel{position:relative;top:auto;left:auto;margin:8px 0;max-width:100%}
  
  /* Hide tooltips on mobile for better touch experience */
  .wysiwyg-toolbar button[title]:hover::after, .wysiwyg-toolbar select[title]:hover::after, .wysiwyg-toolbar input[title]:hover::after,
  .wysiwyg-toolbar button[title]:hover::before, .wysiwyg-toolbar select[title]:hover::before, .wysiwyg-toolbar input[title]:hover::before,
  .wysiwyg-dialog input[title]:hover::after, .wysiwyg-dialog button[title]:hover::after, .wysiwyg-dialog label[title]:hover::after {
    display: none;
  }
}
`;

  function injectCss() {
    if (document.getElementById('wysiwyg-v2-styles')) return;
    const s = document.createElement('style'); 
    s.id = 'wysiwyg-v2-styles'; 
    s.textContent = css; 
    document.head.appendChild(s);
  }

  // Enhanced sanitizer with v2 features support
  function sanitizeHtml(html) {
    const div = document.createElement('div'); 
    div.innerHTML = html;
    
    // Remove unsafe tags
    div.querySelectorAll('script,style,iframe[src*="javascript:"],object,embed,link[rel!="noopener"],meta').forEach(n => n.remove());
    
    // Allow certain video iframes (YouTube, Vimeo, etc.)
    div.querySelectorAll('iframe').forEach(iframe => {
      const src = iframe.src.toLowerCase();
      const allowedDomains = ['youtube.com', 'youtu.be', 'vimeo.com', 'dailymotion.com'];
      const isAllowed = allowedDomains.some(domain => src.includes(domain));
      if (!isAllowed) iframe.remove();
    });
    
    const walker = document.createTreeWalker(div, NodeFilter.SHOW_ELEMENT, null);
    const nodes = []; 
    while (walker.nextNode()) nodes.push(walker.currentNode);
    
    nodes.forEach(el => {
      Array.from(el.attributes || []).forEach(attr => {
        const name = attr.name.toLowerCase();
        const val = (attr.value || '').toLowerCase();
        if (name.startsWith('on') || (name === 'href' && val.startsWith('javascript:'))) {
          el.removeAttribute(attr.name);
        }
      });
      
      // Preserve v2 specific classes
      if (el.className) {
        const preservedClasses = ['wysiwyg-highlight', 'wysiwyg-checklist', 'wysiwyg-collapsible', 'wysiwyg-collapsible-header', 'wysiwyg-collapsible-content', 'wysiwyg-table-advanced'];
        const classes = el.className.split(' ').filter(cls => preservedClasses.includes(cls));
        el.className = classes.join(' ');
      }
    });
    
    return div.innerHTML;
  }

  /* ---- Utilities & API helpers ---- */
  function uid(prefix='u') { 
    return prefix + '-' + Math.random().toString(36).slice(2,9); 
  }

  function execCommand(cmd, value=null) { 
    try { 
      document.execCommand(cmd, false, value); 
    } catch(e) { 
      console.warn('execCommand failed', cmd, e); 
    } 
  }

  // Word count utility
  function getWordCount(text) {
    if (!text || !text.trim()) return { words: 0, characters: 0, charactersNoSpaces: 0 };
    const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    return { words, characters, charactersNoSpaces };
  }

  // Update word count display
  function updateWordCount(instance) {
    if (!instance.options.features.wordCount) return;
    
    const text = instance.editorEl.innerText || '';
    const stats = getWordCount(text);
    
    let wordCountEl = instance.wrapper.querySelector('.wysiwyg-word-count');
    if (!wordCountEl) {
      wordCountEl = document.createElement('div');
      wordCountEl.className = 'wysiwyg-word-count';
      instance.wrapper.appendChild(wordCountEl);
    }
    
    wordCountEl.textContent = `${stats.words} words, ${stats.characters} chars`;
    
    // Add helpful tooltip with detailed statistics
    const readingTime = Math.ceil(stats.words / 200); // Average reading speed
    wordCountEl.title = `Writing Statistics:
• Words: ${stats.words}
• Characters: ${stats.characters}
• Characters (no spaces): ${stats.charactersNoSpaces}
• Estimated reading time: ${readingTime} minute${readingTime !== 1 ? 's' : ''}`;
    
    if (typeof instance.options.onWordCountUpdate === 'function') {
      instance.options.onWordCountUpdate(stats, instance);
    }
  }

  /* ---- Enhanced Toolbar Builder with v2 Features ---- */
  function buildToolbar(toolbarConfig, instance) {
    const bar = document.createElement('div'); 
    bar.className = 'wysiwyg-toolbar';
    instance._buttons = {};

    const addBtnIcon = (name, fallbackLabel, handler, opts={}) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.dataset.cmd = name;
      b.title = opts.title || fallbackLabel || name;
      b.setAttribute('aria-pressed', 'false');
      
      // Store original tooltip for dynamic updates
      b._originalTooltip = opts.title || fallbackLabel || name;
      b._activeTooltip = opts.activeTitle || null;
      
      const icon = (instance && instance.options && instance.options.icons && instance.options.icons[name]) || ICONS_SVG[name];
      if (icon) {
        b.innerHTML = icon;
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
        try { 
          handler(ev); 
        } catch(err){ 
          console.error('toolbar handler error', err); 
        }
        if (instance && typeof updateActiveButtons === 'function') {
          setTimeout(()=>updateActiveButtons(instance), 10);
        }
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

    const addSelect = (optionsList, handler, opts={}) => {
      const sel = document.createElement('select');
      if (opts.title) sel.title = opts.title;
      optionsList.forEach(opt => { 
        const o = document.createElement('option'); 
        o.value = opt.value; 
        o.textContent = opt.label; 
        sel.appendChild(o); 
      });
      sel.addEventListener('change', (e)=>handler(e.target.value));
      bar.appendChild(sel);
      return sel;
    };

    const addColor = (handler, title='Color') => {
      const inp = document.createElement('input'); 
      inp.type='color'; 
      inp.title=title;
      inp.addEventListener('input', (e)=>handler(e.target.value));
      bar.appendChild(inp); 
      return inp;
    };

    toolbarConfig.forEach(item => {
      if (item === '|') { 
        const sep = document.createElement('div'); 
        sep.style.width='8px'; 
        bar.appendChild(sep); 
        return; 
      }

      switch (item) {
        // Basic formatting (enhanced from v1)
        case 'undo': 
          addBtnIcon('undo','Undo', ()=>{ 
            if(instance && typeof instance._undo==='function'){ 
              instance._undo(); 
            } else { 
              execCommand('undo'); 
            } 
          }, {title:'Undo last action (Ctrl/Cmd+Z)'}); 
          break;
        case 'redo': 
          addBtnIcon('redo','Redo', ()=>{ 
            if(instance && typeof instance._redo==='function'){ 
              instance._redo(); 
            } else { 
              execCommand('redo'); 
            } 
          }, {title:'Redo last undone action (Shift+Ctrl/Cmd+Z)'}); 
          break;
        case 'bold': 
          addBtnIcon('bold','Bold', ()=>{ 
            execCommand('bold'); 
            if(instance && instance._saveSnapshot) instance._saveSnapshot(); 
          }, {
            title:'Make selected text bold (Ctrl/Cmd+B)', 
            activeTitle:'Remove bold formatting from selected text (Ctrl/Cmd+B)'
          }); 
          break;
        case 'italic': 
          addBtnIcon('italic','Italic', ()=>{ 
            execCommand('italic'); 
            if(instance && instance._saveSnapshot) instance._saveSnapshot(); 
          }, {
            title:'Make selected text italic (Ctrl/Cmd+I)', 
            activeTitle:'Remove italic formatting from selected text (Ctrl/Cmd+I)'
          }); 
          break;
        case 'underline': 
          addBtnIcon('underline','Underline', ()=>{ 
            execCommand('underline'); 
            if(instance && instance._saveSnapshot) instance._saveSnapshot(); 
          }, {
            title:'Underline selected text (Ctrl/Cmd+U)', 
            activeTitle:'Remove underline from selected text (Ctrl/Cmd+U)'
          }); 
          break;
        case 'strike': 
          addBtnIcon('strike','Strike', ()=>{ 
            execCommand('strikeThrough'); 
            if(instance && instance._saveSnapshot) instance._saveSnapshot(); 
          }, {title:'Strike through selected text'}); 
          break;

        // New v2 text formatting
        case 'highlight': 
          addBtnIcon('highlight','Highlight', ()=>{ 
            wrapSelection('span', 'wysiwyg-highlight', instance); 
          }, {title:'Highlight selected text with yellow background'}); 
          break;
        case 'subscript': 
          addBtnIcon('subscript','Subscript', ()=>{ 
            execCommand('subscript'); 
            if(instance && instance._saveSnapshot) instance._saveSnapshot(); 
          }, {title:'Format as subscript (H₂O, chemical formulas)'}); 
          break;
        case 'superscript': 
          addBtnIcon('superscript','Superscript', ()=>{ 
            execCommand('superscript'); 
            if(instance && instance._saveSnapshot) instance._saveSnapshot(); 
          }, {title:'Format as superscript (E=mc², exponents)'}); 
          break;
        case 'removeFormat': 
          addBtnIcon('removeFormat','Remove format', ()=>{ 
            execCommand('removeFormat'); 
            if(instance && instance._saveSnapshot) instance._saveSnapshot(); 
          }, {title:'Remove all formatting from selected text'}); 
          break;

        // Headings (enhanced with h4-h6)
        case 'h1': addBtnIcon('h1','H1', ()=>{ execCommand('formatBlock','H1'); if(instance && instance._saveSnapshot) instance._saveSnapshot(); }, {title:'Large heading - Main title (H1)'}); break;
        case 'h2': addBtnIcon('h2','H2', ()=>{ execCommand('formatBlock','H2'); if(instance && instance._saveSnapshot) instance._saveSnapshot(); }, {title:'Section heading - Major section (H2)'}); break;
        case 'h3': addBtnIcon('h3','H3', ()=>{ execCommand('formatBlock','H3'); if(instance && instance._saveSnapshot) instance._saveSnapshot(); }, {title:'Subsection heading (H3)'}); break;
        case 'h4': addBtnIcon('h4','H4', ()=>{ execCommand('formatBlock','H4'); if(instance && instance._saveSnapshot) instance._saveSnapshot(); }, {title:'Minor heading (H4)'}); break;
        case 'h5': addBtnIcon('h5','H5', ()=>{ execCommand('formatBlock','H5'); if(instance && instance._saveSnapshot) instance._saveSnapshot(); }, {title:'Small heading (H5)'}); break;
        case 'h6': addBtnIcon('h6','H6', ()=>{ execCommand('formatBlock','H6'); if(instance && instance._saveSnapshot) instance._saveSnapshot(); }, {title:'Smallest heading (H6)'}); break;
        case 'p': addBtnIcon('p','P', ()=>{ execCommand('formatBlock','P'); if(instance && instance._saveSnapshot) instance._saveSnapshot(); }, {title:'Normal paragraph text'}); break;

        // Font controls (enhanced)
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
          ], (v)=>{ 
            if(v){ 
              execCommand('fontName', v); 
              if(instance && instance._saveSnapshot) instance._saveSnapshot(); 
            } 
          }, {title: 'Change font family - Choose from modern and classic fonts'});
          break;

        case 'fontSize':
          addSelect([
            {value:'',label:'Font size'},
            {value:'1',label:'Small'},
            {value:'2',label:'Smaller'},
            {value:'3',label:'Normal'},
            {value:'4',label:'Medium'},
            {value:'5',label:'Large'},
            {value:'6',label:'Larger'},
            {value:'7',label:'Huge'}
          ], (v)=>{ 
            if(v) execCommand('fontSize', v); 
            else execCommand('fontSize', 3); 
            if(instance && instance._saveSnapshot) instance._saveSnapshot();
          }, {title: 'Change font size - From small to huge'});
          break;

        // New v2: Line height
        case 'lineHeight':
          addSelect([
            {value:'',label:'Line height'},
            {value:'1.0',label:'Single'},
            {value:'1.15',label:'1.15'},
            {value:'1.5',label:'1.5'},
            {value:'2.0',label:'Double'},
            {value:'2.5',label:'2.5'},
            {value:'3.0',label:'Triple'}
          ], (v)=>{ 
            if(v) {
              applyLineHeight(v, instance);
            }
          }, {title: 'Adjust line spacing - Single to triple spacing'});
          break;

        case 'fontColor':
          addColor((c)=>{ 
            execCommand('foreColor', c); 
            if(instance && instance._saveSnapshot) instance._saveSnapshot(); 
          }, 'Change text color - Click to open color picker'); 
          break;
        case 'bgColor':
          addColor((c)=>{ 
            execCommand('hiliteColor', c); 
            if(instance && instance._saveSnapshot) instance._saveSnapshot(); 
          }, 'Change background color - Highlight text background'); 
          break;

        // Alignment (enhanced with justify)
        case 'alignLeft': addBtnIcon('alignLeft','Align left', ()=>{ execCommand('justifyLeft'); if(instance && instance._saveSnapshot) instance._saveSnapshot(); }, {title:'Align text to the left margin'}); break;
        case 'alignCenter': addBtnIcon('alignCenter','Align center', ()=>{ execCommand('justifyCenter'); if(instance && instance._saveSnapshot) instance._saveSnapshot(); }, {title:'Center text horizontally'}); break;
        case 'alignRight': addBtnIcon('alignRight','Align right', ()=>{ execCommand('justifyRight'); if(instance && instance._saveSnapshot) instance._saveSnapshot(); }, {title:'Align text to the right margin'}); break;
        case 'alignJustify': addBtnIcon('alignJustify','Justify', ()=>{ execCommand('justifyFull'); if(instance && instance._saveSnapshot) instance._saveSnapshot(); }, {title:'Justify text - align to both margins'}); break;

        // Lists (enhanced with checklist)
        case 'ul': addBtnIcon('ul','Bulleted list', ()=>{ execCommand('insertUnorderedList'); if(instance && instance._saveSnapshot) instance._saveSnapshot(); }, {title:'Create bulleted list - Unordered list with dots'}); break;
        case 'ol': addBtnIcon('ol','Numbered list', ()=>{ execCommand('insertOrderedList'); if(instance && instance._saveSnapshot) instance._saveSnapshot(); }, {title:'Create numbered list - Ordered list with numbers'}); break;
        case 'checklist': addBtnIcon('checklist','Checklist', ()=>{ insertChecklist(instance); }, {title:'Insert interactive checklist - Clickable checkboxes for tasks'}); break;
        case 'indent': addBtnIcon('indent','Indent', ()=>{ execCommand('indent'); if(instance && instance._saveSnapshot) instance._saveSnapshot(); }, {title:'Increase indent - Move text further right'}); break;
        case 'outdent': addBtnIcon('outdent','Outdent', ()=>{ execCommand('outdent'); if(instance && instance._saveSnapshot) instance._saveSnapshot(); }, {title:'Decrease indent - Move text further left'}); break;

        // Media (enhanced with video)
        case 'link': addBtnIcon('link','Link', ()=>openLinkDialog(instance), {title:'Insert hyperlink - Link to websites or pages (Ctrl/Cmd+K)'}); break;
        case 'image': addBtnIcon('image','Image', ()=>openImageDialog(instance), {title:'Insert image - Upload or embed pictures from URL'}); break;
        case 'video': addBtnIcon('video','Video', ()=>openVideoDialog(instance), {title:'Embed video - YouTube, Vimeo, and other platforms'}); break;
        case 'table': addBtnIcon('table','Table', ()=>openAdvancedTableDialog(instance), {title:'Insert table - Custom rows, columns, and styling'}); break;
        case 'hr': addBtnIcon('hr','HR', ()=>{ execCommand('insertHorizontalRule'); if(instance && instance._saveSnapshot) instance._saveSnapshot(); }, {title:'Insert horizontal line - Visual separator'}); break;

        // Content structure
        case 'code': addBtnIcon('code','Code', ()=>insertCode(instance), {title:'Insert code block - Formatted code with syntax highlighting'}); break;
        case 'quote': addBtnIcon('quote','Quote', ()=>{ execCommand('formatBlock','BLOCKQUOTE'); if(instance && instance._saveSnapshot) instance._saveSnapshot(); }, {title:'Format as blockquote - Indented quote text'}); break;
        case 'collapsible': addBtnIcon('collapsible','Collapsible', ()=>insertCollapsible(instance), {title:'Insert collapsible section - Expandable content area'}); break;

        // New v2 tools
        case 'findReplace': addBtnIcon('findReplace','Find & Replace', ()=>toggleFindReplace(instance), {title:'Find and replace text - Search through content (Ctrl/Cmd+F)'}); break;
        case 'wordCount': addBtnIcon('wordCount','Word Count', ()=>toggleWordCount(instance), {title:'Toggle word count display - Show writing statistics'}); break;
        case 'templates': addBtnIcon('templates','Templates', ()=>toggleTemplates(instance), {title:'Insert content template - Pre-made layouts and formats'}); break;
        case 'insertSnippet': addBtnIcon('insertSnippet','Snippet', ()=>toggleSnippets(instance), {title:'Insert code snippet - Quick reusable content blocks'}); break;

        // Standard tools
        case 'toggleSource': addBtnIcon('toggleSource','Source', ()=>toggleSource(instance), {title:'Toggle HTML source view - Switch between visual and code editing'}); break;
        case 'fullscreen': addBtnIcon('fullscreen','Fullscreen', ()=>toggleFullscreen(instance), {title:'Enter fullscreen mode - Distraction-free editing'}); break;

        default:
          addBtnText(item, ()=>execCommand(item), {title:item});
      }
    });

    return bar;
  }

  /* ---- V2 Enhanced Functions ---- */

  // Wrap selection with element and class
  function wrapSelection(tagName, className, instance) {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    if (range.collapsed) return;
    
    const wrapper = document.createElement(tagName);
    if (className) wrapper.className = className;
    
    try {
      range.surroundContents(wrapper);
      if (instance && instance._saveSnapshot) instance._saveSnapshot();
    } catch (e) {
      console.warn('Could not wrap selection:', e);
    }
  }

  // Apply line height to selection
  function applyLineHeight(height, instance) {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    const element = container.nodeType === Node.TEXT_NODE ? container.parentElement : container;
    
    element.style.lineHeight = height;
    if (instance && instance._saveSnapshot) instance._saveSnapshot();
  }

  // Insert checklist
  function insertChecklist(instance) {
    const html = `
      <ul class="wysiwyg-checklist">
        <li>First item</li>
        <li>Second item</li>
        <li>Third item</li>
      </ul>
    `;
    
    execCommand('insertHTML', html);
    if (instance && instance._saveSnapshot) instance._saveSnapshot();
    
    // Add click handlers for checkboxes
    setTimeout(() => {
      const checklists = instance.editorEl.querySelectorAll('.wysiwyg-checklist li');
      checklists.forEach(item => {
        item.addEventListener('click', (e) => {
          if (e.target === item) {
            item.classList.toggle('checked');
            if (instance && instance._saveSnapshot) instance._saveSnapshot();
          }
        });
      });
    }, 100);
  }

  // Insert collapsible section
  function insertCollapsible(instance) {
    const id = uid('collapse');
    const html = `
      <div class="wysiwyg-collapsible" data-id="${id}">
        <div class="wysiwyg-collapsible-header">Click to expand</div>
        <div class="wysiwyg-collapsible-content">
          <p>Collapsible content goes here...</p>
        </div>
      </div>
    `;
    
    execCommand('insertHTML', html);
    if (instance && instance._saveSnapshot) instance._saveSnapshot();
    
    // Add click handler for toggle
    setTimeout(() => {
      const collapsible = instance.editorEl.querySelector(`[data-id="${id}"]`);
      if (collapsible) {
        const header = collapsible.querySelector('.wysiwyg-collapsible-header');
        header.addEventListener('click', () => {
          collapsible.classList.toggle('open');
        });
      }
    }, 100);
  }

  // Insert code block
  function insertCode(instance) {
    const selection = window.getSelection();
    const selectedText = selection.toString();
    
    if (selectedText) {
      execCommand('formatBlock', 'pre');
      const range = selection.getRangeAt(0);
      const pre = range.commonAncestorContainer.closest('pre');
      if (pre) {
        pre.style.background = '#f6f8fa';
        pre.style.padding = '12px';
        pre.style.borderRadius = '6px';
        pre.style.fontFamily = 'monospace';
        pre.style.fontSize = '14px';
        pre.style.overflow = 'auto';
      }
    } else {
      const html = `<pre style="background:#f6f8fa;padding:12px;border-radius:6px;font-family:monospace;font-size:14px;overflow:auto;">// Your code here</pre>`;
      execCommand('insertHTML', html);
    }
    
    if (instance && instance._saveSnapshot) instance._saveSnapshot();
  }

  // Enhanced link dialog
  function openLinkDialog(instance) {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    
    const dialog = document.createElement('div');
    dialog.className = 'wysiwyg-dialog';
    dialog.innerHTML = `
      <h3>Insert Link</h3>
      <div class="row">
        <label>URL:</label>
        <input type="text" id="link-url" placeholder="https://example.com" value="" title="Enter the web address (URL) to link to">
      </div>
      <div class="row">
        <label>Text:</label>
        <input type="text" id="link-text" placeholder="Link text" value="${selectedText}" title="The text that will be displayed as the clickable link">
      </div>
      <div class="row">
        <label title="Check this to open the link in a new browser tab">
          <input type="checkbox" id="link-blank"> Open in new tab
        </label>
      </div>
      <div class="row" style="text-align:right;margin-top:12px;">
        <button type="button" onclick="this.closest('.wysiwyg-dialog').remove()" title="Cancel and close without inserting link">Cancel</button>
        <button type="button" id="insert-link" style="margin-left:8px;" title="Insert the link into your content">Insert</button>
      </div>
    `;
    
    document.body.appendChild(dialog);
    
    const urlInput = dialog.querySelector('#link-url');
    const textInput = dialog.querySelector('#link-text');
    const blankCheckbox = dialog.querySelector('#link-blank');
    
    urlInput.focus();
    
    dialog.querySelector('#insert-link').addEventListener('click', () => {
      const url = urlInput.value.trim();
      const text = textInput.value.trim() || url;
      const target = blankCheckbox.checked ? ' target="_blank" rel="noopener"' : '';
      
      if (url) {
        instance.editorEl.focus();
        if (range) selection.addRange(range);
        
        const html = `<a href="${url}"${target}>${text}</a>`;
        execCommand('insertHTML', html);
        
        if (instance._saveSnapshot) instance._saveSnapshot();
      }
      
      dialog.remove();
    });
    
    // Handle Enter key
    [urlInput, textInput].forEach(input => {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          dialog.querySelector('#insert-link').click();
        }
      });
    });
  }

  // Enhanced image dialog with upload support
  function openImageDialog(instance) {
    const dialog = document.createElement('div');
    dialog.className = 'wysiwyg-dialog';
    dialog.innerHTML = `
      <h3>Insert Image</h3>
      <div class="row">
        <label>Image URL:</label>
        <input type="text" id="img-url" placeholder="https://example.com/image.jpg" title="Enter the web address (URL) of an image, or upload a file below">
      </div>
      <div class="row">
        <label>Alt text:</label>
        <input type="text" id="img-alt" placeholder="Describe the image" title="Alternative text for accessibility - describes the image for screen readers">
      </div>
      <div class="row">
        <label>Upload file:</label>
        <input type="file" id="img-file" accept="image/*" title="Choose an image file from your computer (JPG, PNG, GIF, etc.)">
      </div>
      <div class="row" style="text-align:right;margin-top:12px;">
        <button type="button" onclick="this.closest('.wysiwyg-dialog').remove()" title="Cancel and close without inserting image">Cancel</button>
        <button type="button" id="insert-img" style="margin-left:8px;" title="Insert the image into your content">Insert</button>
      </div>
    `;
    
    document.body.appendChild(dialog);
    
    const urlInput = dialog.querySelector('#img-url');
    const altInput = dialog.querySelector('#img-alt');
    const fileInput = dialog.querySelector('#img-file');
    
    urlInput.focus();
    
    // Handle file upload
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      if (instance.options.uploadHandler) {
        instance.options.uploadHandler(file, (url) => {
          if (url) urlInput.value = url;
        });
      } else if (instance.options.uploadUrl) {
        uploadImage(file, instance, (url) => {
          if (url) urlInput.value = url;
        });
      } else {
        // Create data URL for preview
        const reader = new FileReader();
        reader.onload = (e) => {
          urlInput.value = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
    
    dialog.querySelector('#insert-img').addEventListener('click', () => {
      const url = urlInput.value.trim();
      const alt = altInput.value.trim();
      
      if (url) {
        instance.editorEl.focus();
        const html = `<img src="${url}" alt="${alt}" style="max-width:100%;height:auto;border-radius:4px;">`;
        execCommand('insertHTML', html);
        
        if (instance._saveSnapshot) instance._saveSnapshot();
      }
      
      dialog.remove();
    });
  }

  // Video dialog
  function openVideoDialog(instance) {
    const dialog = document.createElement('div');
    dialog.className = 'wysiwyg-dialog';
    dialog.innerHTML = `
      <h3>Insert Video</h3>
      <div class="row">
        <label>Video URL (YouTube, Vimeo, etc.):</label>
        <input type="text" id="video-url" placeholder="https://www.youtube.com/watch?v=..." title="Paste the URL from YouTube, Vimeo, or other supported video platforms">
      </div>
      <div class="row">
        <label>Width (optional):</label>
        <input type="text" id="video-width" placeholder="560" value="560" title="Video width in pixels (default: 560px)">
      </div>
      <div class="row">
        <label>Height (optional):</label>
        <input type="text" id="video-height" placeholder="315" value="315" title="Video height in pixels (default: 315px)">
      </div>
      <div class="row" style="text-align:right;margin-top:12px;">
        <button type="button" onclick="this.closest('.wysiwyg-dialog').remove()" title="Cancel and close without inserting video">Cancel</button>
        <button type="button" id="insert-video" style="margin-left:8px;" title="Embed the video into your content">Insert</button>
      </div>
    `;
    
    document.body.appendChild(dialog);
    
    const urlInput = dialog.querySelector('#video-url');
    const widthInput = dialog.querySelector('#video-width');
    const heightInput = dialog.querySelector('#video-height');
    
    urlInput.focus();
    
    dialog.querySelector('#insert-video').addEventListener('click', () => {
      const url = urlInput.value.trim();
      const width = widthInput.value.trim() || '560';
      const height = heightInput.value.trim() || '315';
      
      if (url) {
        const embedUrl = convertToEmbedUrl(url);
        if (embedUrl) {
          instance.editorEl.focus();
          const html = `
            <div class="wysiwyg-video-wrapper">
              <iframe src="${embedUrl}" width="${width}" height="${height}" frameborder="0" allowfullscreen></iframe>
            </div>
          `;
          execCommand('insertHTML', html);
          
          if (instance._saveSnapshot) instance._saveSnapshot();
        } else {
          alert('Please enter a valid YouTube, Vimeo, or other supported video URL');
        }
      }
      
      dialog.remove();
    });
  }

  // Convert video URL to embed URL
  function convertToEmbedUrl(url) {
    // YouTube
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }
    
    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    
    // Return original if already an embed URL
    if (url.includes('/embed/') || url.includes('player.')) {
      return url;
    }
    
    return null;
  }

  // Advanced table dialog
  function openAdvancedTableDialog(instance) {
    const dialog = document.createElement('div');
    dialog.className = 'wysiwyg-dialog';
    dialog.innerHTML = `
      <h3>Insert Table</h3>
      <div class="row">
        <label>Rows:</label>
        <input type="number" id="table-rows" min="1" max="50" value="3" title="Number of table rows (1-50)">
      </div>
      <div class="row">
        <label>Columns:</label>
        <input type="number" id="table-cols" min="1" max="20" value="3" title="Number of table columns (1-20)">
      </div>
      <div class="row">
        <label title="Add a header row with bold text and different background">
          <input type="checkbox" id="table-header" checked> Include header row
        </label>
      </div>
      <div class="row">
        <label title="Alternate row colors for better readability">
          <input type="checkbox" id="table-striped"> Striped rows
        </label>
      </div>
      <div class="row" style="text-align:right;margin-top:12px;">
        <button type="button" onclick="this.closest('.wysiwyg-dialog').remove()" title="Cancel and close without inserting table">Cancel</button>
        <button type="button" id="insert-table" style="margin-left:8px;" title="Create and insert the table with your settings">Insert</button>
      </div>
    `;
    
    document.body.appendChild(dialog);
    
    const rowsInput = dialog.querySelector('#table-rows');
    const colsInput = dialog.querySelector('#table-cols');
    const headerCheckbox = dialog.querySelector('#table-header');
    const stripedCheckbox = dialog.querySelector('#table-striped');
    
    rowsInput.focus();
    
    dialog.querySelector('#insert-table').addEventListener('click', () => {
      const rows = parseInt(rowsInput.value) || 3;
      const cols = parseInt(colsInput.value) || 3;
      const hasHeader = headerCheckbox.checked;
      const isStriped = stripedCheckbox.checked;
      
      let tableClass = 'wysiwyg-table-advanced';
      if (isStriped) tableClass += ' striped';
      
      let html = `<table class="${tableClass}">`;
      
      // Header row
      if (hasHeader) {
        html += '<thead><tr>';
        for (let j = 0; j < cols; j++) {
          html += `<th>Header ${j + 1}</th>`;
        }
        html += '</tr></thead>';
      }
      
      // Body rows
      html += '<tbody>';
      const startRow = hasHeader ? 1 : 0;
      const totalRows = hasHeader ? rows : rows;
      
      for (let i = startRow; i < totalRows + startRow; i++) {
        html += '<tr>';
        for (let j = 0; j < cols; j++) {
          html += `<td>Cell ${i + 1},${j + 1}</td>`;
        }
        html += '</tr>';
      }
      html += '</tbody></table>';
      
      instance.editorEl.focus();
      execCommand('insertHTML', html);
      
      if (instance._saveSnapshot) instance._saveSnapshot();
      dialog.remove();
    });
  }

  // Upload image function
  function uploadImage(file, instance, callback) {
    if (!instance.options.uploadUrl) {
      callback(null);
      return;
    }
    
    const formData = new FormData();
    formData.append(instance.options.uploadFieldName || 'image', file);
    
    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && instance.options.onUploadProgress) {
        const percent = (e.loaded / e.total) * 100;
        instance.options.onUploadProgress(percent, instance);
      }
    });
    
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          const url = instance.options.parseUploadResponse(response);
          callback(url);
        } catch (e) {
          console.error('Upload response parse error:', e);
          callback(null);
        }
      } else {
        callback(null);
      }
    });
    
    xhr.addEventListener('error', () => {
      callback(null);
    });
    
    xhr.open('POST', instance.options.uploadUrl);
    
    // Add custom headers
    Object.keys(instance.options.uploadHeaders || {}).forEach(key => {
      xhr.setRequestHeader(key, instance.options.uploadHeaders[key]);
    });
    
    xhr.send(formData);
  }

  // Find & Replace functionality
  function toggleFindReplace(instance) {
    let findPanel = instance.wrapper.querySelector('.wysiwyg-find-replace');
    
    if (findPanel) {
      clearHighlights(instance);
      findPanel.remove();
      return;
    }
    
    findPanel = document.createElement('div');
    findPanel.className = 'wysiwyg-find-replace';
    findPanel.innerHTML = `
      <input type="text" id="find-input" placeholder="Find..." title="Enter text to search for in your content">
      <input type="text" id="replace-input" placeholder="Replace with..." title="Enter replacement text (optional)">
      <button type="button" id="find-next" title="Find next occurrence">Next</button>
      <button type="button" id="find-prev" title="Find previous occurrence">Prev</button>
      <button type="button" id="replace-one" title="Replace current match with new text">Replace</button>
      <button type="button" id="replace-all" title="Replace all matches in the entire document">All</button>
      <button type="button" id="close-find" title="Close find and replace panel">&times;</button>
      <span id="find-status" style="font-size:12px;color:#666;margin-left:8px;"></span>
    `;
    
    instance.wrapper.appendChild(findPanel);
    
    const findInput = findPanel.querySelector('#find-input');
    const replaceInput = findPanel.querySelector('#replace-input');
    const statusEl = findPanel.querySelector('#find-status');
    
    findInput.focus();
    
    // Find and replace state
    let currentMatches = [];
    let currentIndex = -1;
    
    // Clear existing highlights
    function clearHighlights(inst) {
      const highlights = inst.editorEl.querySelectorAll('.wysiwyg-search-highlight');
      highlights.forEach(highlight => {
        const parent = highlight.parentNode;
        parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
        parent.normalize();
      });
    }
    
    // Find text in the editor content (text-based search)
    function findInText(searchText) {
      if (!searchText) return [];
      
      clearHighlights(instance);
      const textContent = instance.editorEl.innerText || instance.editorEl.textContent || '';
      const regex = new RegExp(searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      const matches = [];
      let match;
      
      while ((match = regex.exec(textContent)) !== null) {
        matches.push({
          index: match.index,
          text: match[0],
          length: match[0].length
        });
      }
      
      return matches;
    }
    
    // Highlight all matches
    function highlightAllMatches(searchText) {
      if (!searchText) return [];
      
      clearHighlights(instance);
      
      // Create a tree walker to find all text nodes
      const walker = document.createTreeWalker(
        instance.editorEl,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );
      
      const textNodes = [];
      let node;
      while (node = walker.nextNode()) {
        textNodes.push(node);
      }
      
      const matches = [];
      let globalIndex = 0;
      
      textNodes.forEach(textNode => {
        const text = textNode.textContent;
        const regex = new RegExp(searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        let match;
        let lastIndex = 0;
        const fragments = [];
        
        while ((match = regex.exec(text)) !== null) {
          // Add text before match
          if (match.index > lastIndex) {
            fragments.push(document.createTextNode(text.substring(lastIndex, match.index)));
          }
          
          // Add highlighted match
          const highlight = document.createElement('span');
          highlight.className = 'wysiwyg-search-highlight';
          highlight.style.cssText = 'background: #ffeb3b; color: #000; padding: 1px 2px; border-radius: 2px;';
          highlight.textContent = match[0];
          highlight.dataset.matchIndex = matches.length;
          fragments.push(highlight);
          
          matches.push({
            element: highlight,
            text: match[0],
            globalIndex: globalIndex + match.index
          });
          
          lastIndex = match.index + match[0].length;
        }
        
        // Add remaining text
        if (lastIndex < text.length) {
          fragments.push(document.createTextNode(text.substring(lastIndex)));
        }
        
        // Replace text node with fragments if we found matches
        if (fragments.length > 1) {
          const parent = textNode.parentNode;
          fragments.forEach(fragment => {
            parent.insertBefore(fragment, textNode);
          });
          parent.removeChild(textNode);
        }
        
        globalIndex += text.length;
      });
      
      return matches;
    }
    
    // Update current match highlighting
    function updateCurrentMatch() {
      const highlights = instance.editorEl.querySelectorAll('.wysiwyg-search-highlight');
      highlights.forEach((highlight, index) => {
        if (index === currentIndex) {
          highlight.style.cssText = 'background: #ff9800; color: #fff; padding: 1px 2px; border-radius: 2px; box-shadow: 0 0 3px rgba(255,152,0,0.5);';
          highlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          highlight.style.cssText = 'background: #ffeb3b; color: #000; padding: 1px 2px; border-radius: 2px;';
        }
      });
      
      if (currentMatches.length > 0) {
        statusEl.textContent = `${currentIndex + 1} of ${currentMatches.length}`;
      } else {
        statusEl.textContent = 'No matches found';
      }
    }
    
    // Perform search
    function performSearch() {
      const searchText = findInput.value.trim();
      if (!searchText) {
        clearHighlights(instance);
        currentMatches = [];
        currentIndex = -1;
        statusEl.textContent = '';
        return;
      }
      
      currentMatches = highlightAllMatches(searchText);
      currentIndex = currentMatches.length > 0 ? 0 : -1;
      updateCurrentMatch();
    }
    
    // Replace current match
    function replaceCurrent() {
      if (currentIndex >= 0 && currentIndex < currentMatches.length) {
        const replaceText = replaceInput.value;
        const currentMatch = currentMatches[currentIndex];
        
        if (currentMatch.element && currentMatch.element.parentNode) {
          const textNode = document.createTextNode(replaceText);
          currentMatch.element.parentNode.replaceChild(textNode, currentMatch.element);
          
          if (instance._saveSnapshot) instance._saveSnapshot();
          
          // Re-perform search to update matches
          setTimeout(() => {
            performSearch();
            if (currentIndex >= currentMatches.length) {
              currentIndex = Math.max(0, currentMatches.length - 1);
              updateCurrentMatch();
            }
          }, 10);
        }
      }
    }
    
    // Replace all matches
    function replaceAll() {
      const searchText = findInput.value.trim();
      const replaceText = replaceInput.value;
      
      if (!searchText) return;
      
      let content = instance.editorEl.innerHTML;
      const textContent = instance.editorEl.innerText || instance.editorEl.textContent || '';
      
      // Simple text-based replace for now
      const regex = new RegExp(searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      const matches = (textContent.match(regex) || []).length;
      
      if (matches > 0) {
        // Get plain text, replace, and set back
        const plainText = instance.editorEl.innerText || instance.editorEl.textContent || '';
        const newText = plainText.replace(regex, replaceText);
        
        // Simple approach: replace in text nodes
        clearHighlights(instance);
        const walker = document.createTreeWalker(
          instance.editorEl,
          NodeFilter.SHOW_TEXT,
          null,
          false
        );
        
        const textNodes = [];
        let node;
        while (node = walker.nextNode()) {
          textNodes.push(node);
        }
        
        textNodes.forEach(textNode => {
          if (regex.test(textNode.textContent)) {
            textNode.textContent = textNode.textContent.replace(regex, replaceText);
          }
        });
        
        if (instance._saveSnapshot) instance._saveSnapshot();
        
        statusEl.textContent = `Replaced ${matches} occurrence${matches !== 1 ? 's' : ''}`;
        currentMatches = [];
        currentIndex = -1;
      }
    }
    
    // Event listeners
    findInput.addEventListener('input', performSearch);
    findInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (e.shiftKey) {
          // Find previous
          if (currentMatches.length > 0) {
            currentIndex = currentIndex <= 0 ? currentMatches.length - 1 : currentIndex - 1;
            updateCurrentMatch();
          }
        } else {
          // Find next
          if (currentMatches.length > 0) {
            currentIndex = (currentIndex + 1) % currentMatches.length;
            updateCurrentMatch();
          }
        }
      }
    });
    
    findPanel.querySelector('#find-next').addEventListener('click', () => {
      if (currentMatches.length > 0) {
        currentIndex = (currentIndex + 1) % currentMatches.length;
        updateCurrentMatch();
      } else {
        performSearch();
      }
    });
    
    findPanel.querySelector('#find-prev').addEventListener('click', () => {
      if (currentMatches.length > 0) {
        currentIndex = currentIndex <= 0 ? currentMatches.length - 1 : currentIndex - 1;
        updateCurrentMatch();
      }
    });
    
    findPanel.querySelector('#replace-one').addEventListener('click', replaceCurrent);
    findPanel.querySelector('#replace-all').addEventListener('click', replaceAll);
    
    findPanel.querySelector('#close-find').addEventListener('click', () => {
      clearHighlights(instance);
      findPanel.remove();
    });
  }

  // Toggle word count
  function toggleWordCount(instance) {
    instance.options.features.wordCount = !instance.options.features.wordCount;
    
    if (!instance.options.features.wordCount) {
      const wordCountEl = instance.wrapper.querySelector('.wysiwyg-word-count');
      if (wordCountEl) wordCountEl.remove();
    } else {
      updateWordCount(instance);
    }
  }

  // Templates functionality
  function toggleTemplates(instance) {
    let panel = instance.wrapper.querySelector('.wysiwyg-templates-panel');
    
    if (panel) {
      panel.remove();
      return;
    }
    
    panel = document.createElement('div');
    panel.className = 'wysiwyg-templates-panel';
    
    if (!instance.options.templates || instance.options.templates.length === 0) {
      panel.innerHTML = '<p>No templates available</p>';
    } else {
      panel.innerHTML = '<h4 title="Choose a pre-made template to insert into your content">Templates</h4>';
      instance.options.templates.forEach(template => {
        const item = document.createElement('div');
        item.className = 'wysiwyg-template-item';
        item.textContent = template.name;
        item.title = `Insert "${template.name}" template - ${template.description || 'Pre-formatted content block'}`;
        item.addEventListener('click', () => {
          instance.editorEl.focus();
          execCommand('insertHTML', template.content);
          if (instance._saveSnapshot) instance._saveSnapshot();
          panel.remove();
        });
        panel.appendChild(item);
      });
    }
    
    instance.wrapper.appendChild(panel);
  }

  // Snippets functionality (similar to templates but smaller)
  function toggleSnippets(instance) {
    let panel = instance.wrapper.querySelector('.wysiwyg-snippets-panel');
    
    if (panel) {
      panel.remove();
      return;
    }
    
    panel = document.createElement('div');
    panel.className = 'wysiwyg-templates-panel wysiwyg-snippets-panel';
    
    if (!instance.options.snippets || instance.options.snippets.length === 0) {
      panel.innerHTML = '<p>No snippets available</p>';
    } else {
      panel.innerHTML = '<h4 title="Insert quick reusable content blocks and components">Snippets</h4>';
      instance.options.snippets.forEach(snippet => {
        const item = document.createElement('div');
        item.className = 'wysiwyg-template-item';
        item.textContent = snippet.name;
        item.title = `Insert "${snippet.name}" snippet - ${snippet.description || 'Quick content block'}`;
        item.addEventListener('click', () => {
          instance.editorEl.focus();
          execCommand('insertHTML', snippet.content);
          if (instance._saveSnapshot) instance._saveSnapshot();
          panel.remove();
        });
        panel.appendChild(item);
      });
    }
    
    instance.wrapper.appendChild(panel);
  }

  // Toggle source view
  function toggleSource(instance) {
    if (!instance.sourceEl) {
      instance.sourceEl = document.createElement('textarea');
      instance.sourceEl.className = 'wysiwyg-source wysiwyg-hidden';
      instance.wrapper.appendChild(instance.sourceEl);
    }
    
    if (instance.editorEl.classList.contains('wysiwyg-hidden')) {
      // Switch back to WYSIWYG
      instance.editorEl.innerHTML = instance.sourceEl.value;
      instance.editorEl.classList.remove('wysiwyg-hidden');
      instance.sourceEl.classList.add('wysiwyg-hidden');
      instance.editorEl.focus();
    } else {
      // Switch to source
      instance.sourceEl.value = instance.editorEl.innerHTML;
      instance.editorEl.classList.add('wysiwyg-hidden');
      instance.sourceEl.classList.remove('wysiwyg-hidden');
      instance.sourceEl.focus();
    }
  }

  // Toggle fullscreen
  function toggleFullscreen(instance) {
    if (instance.wrapper.classList.contains('wysiwyg-fullscreen')) {
      instance.wrapper.classList.remove('wysiwyg-fullscreen');
      document.body.style.overflow = '';
    } else {
      instance.wrapper.classList.add('wysiwyg-fullscreen');
      document.body.style.overflow = 'hidden';
    }
  }

  /* ---- Enhanced Undo/Redo System ---- */
  function setupUndoRedo(instance) {
    instance._history = []; 
    instance._historyIndex = -1;
    instance._lastSnapshot = '';

    instance._saveSnapshot = function() {
      const html = instance.editorEl.innerHTML;
      if (html === instance._lastSnapshot) return;
      
      instance._historyIndex++;
      instance._history = instance._history.slice(0, instance._historyIndex);
      instance._history.push(html);
      instance._lastSnapshot = html;
      
      if (instance._history.length > 50) {
        instance._history.shift();
        instance._historyIndex--;
      }
    };

    instance._undo = function() {
      if (instance._historyIndex > 0) {
        instance._historyIndex--;
        instance.editorEl.innerHTML = instance._history[instance._historyIndex];
        instance._lastSnapshot = instance._history[instance._historyIndex];
        instance.editorEl.focus();
      }
    };

    instance._redo = function() {
      if (instance._historyIndex < instance._history.length - 1) {
        instance._historyIndex++;
        instance.editorEl.innerHTML = instance._history[instance._historyIndex];
        instance._lastSnapshot = instance._history[instance._historyIndex];
        instance.editorEl.focus();
      }
    };

    // Save initial state
    setTimeout(() => instance._saveSnapshot(), 100);
  }

  /* ---- Update Active Buttons ---- */
  function updateActiveButtons(instance) {
    if (!instance._buttons) return;
    
    Object.keys(instance._buttons).forEach(cmd => {
      const btn = instance._buttons[cmd];
      if (!btn) return;
      
      let isActive = false;
      
      try {
        switch(cmd) {
          case 'bold': isActive = document.queryCommandState('bold'); break;
          case 'italic': isActive = document.queryCommandState('italic'); break;
          case 'underline': isActive = document.queryCommandState('underline'); break;
          case 'strike': isActive = document.queryCommandState('strikeThrough'); break;
          case 'subscript': isActive = document.queryCommandState('subscript'); break;
          case 'superscript': isActive = document.queryCommandState('superscript'); break;
          case 'ul': isActive = document.queryCommandState('insertUnorderedList'); break;
          case 'ol': isActive = document.queryCommandState('insertOrderedList'); break;
        }
      } catch(e) {}
      
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      if (isActive) {
        btn.classList.add('active');
        // Update tooltip for active state
        if (btn._activeTooltip) {
          btn.title = btn._activeTooltip;
        }
      } else {
        btn.classList.remove('active');
        // Restore original tooltip
        if (btn._originalTooltip) {
          btn.title = btn._originalTooltip;
        }
      }
    });
  }

  /* ---- Main Editor Class ---- */
  class KriaEditorV2 {
    constructor(element, options = {}) {
      this.element = element;
      this.options = Object.assign({}, defaultOptions, options);
      this.wrapper = null;
      this.toolbarEl = null;
      this.editorEl = null;
      this.sourceEl = null;
      this._buttons = {};
      this._isInitialized = false;
      
      this.init();
    }

    init() {
      if (this._isInitialized) return;
      
      injectCss();
      this.buildEditor();
      this.setupEvents();
      setupUndoRedo(this);
      
      if (this.options.autosaveKey) {
        this.loadAutosave();
        this.setupAutosave();
      }

      if (this.options.features.wordCount) {
        updateWordCount(this);
      }

      // Load plugins
      this.options.plugins.forEach(plugin => {
        if (typeof plugin === 'function') {
          plugin(this);
        }
      });

      this._isInitialized = true;
      instancesList.push(this);
    }

    buildEditor() {
      // Create wrapper
      this.wrapper = document.createElement('div');
      this.wrapper.className = 'wysiwyg-wrapper';
      
      // Create toolbar
      this.toolbarEl = buildToolbar(this.options.toolbar, this);
      this.wrapper.appendChild(this.toolbarEl);
      
      // Create editor
      this.editorEl = document.createElement('div');
      this.editorEl.className = 'wysiwyg-editor';
      this.editorEl.contentEditable = true;
      this.editorEl.setAttribute('role', 'textbox');
      this.editorEl.setAttribute('aria-multiline', 'true');
      this.editorEl.setAttribute('aria-label', 'Rich text editor');
      
      // Set initial content
      const initialContent = this.element.value || this.element.innerHTML || '';
      this.editorEl.innerHTML = initialContent;
      
      // Set height
      if (this.options.height) {
        this.editorEl.style.height = this.options.height + 'px';
      }
      
      // Set max height with scroll
      if (this.options.maxHeight) {
        this.editorEl.style.maxHeight = this.options.maxHeight + 'px';
        this.editorEl.style.overflowY = 'auto';
      }
      
      // Add placeholder support
      if (this.options.placeholder && !initialContent) {
        this.editorEl.setAttribute('data-placeholder', this.options.placeholder);
        this.addPlaceholderCSS();
      }
      
      this.wrapper.appendChild(this.editorEl);
      
      // Replace original element
      this.element.style.display = 'none';
      this.element.parentNode.insertBefore(this.wrapper, this.element.nextSibling);
    }

    addPlaceholderCSS() {
      const placeholderCSS = `
        .wysiwyg-editor[data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
          position: absolute;
        }
      `;
      
      let style = document.getElementById('wysiwyg-v2-placeholder');
      if (!style) {
        style = document.createElement('style');
        style.id = 'wysiwyg-v2-placeholder';
        document.head.appendChild(style);
      }
      style.textContent = placeholderCSS;
    }

    setupEvents() {
      // Content change events
      this.editorEl.addEventListener('input', () => {
        this.updateOriginalElement();
        if (this.options.features.wordCount) {
          clearTimeout(wordCountUpdateTimer);
          wordCountUpdateTimer = setTimeout(() => updateWordCount(this), 300);
        }
        if (typeof this.options.onContentChange === 'function') {
          this.options.onContentChange(this.getContent(), this);
        }
      });

      this.editorEl.addEventListener('paste', (e) => {
        if (this.options.sanitize) {
          e.preventDefault();
          const paste = (e.clipboardData || window.clipboardData).getData('text/html') || 
                       (e.clipboardData || window.clipboardData).getData('text/plain');
          const sanitized = sanitizeHtml(paste);
          execCommand('insertHTML', sanitized);
          if (this._saveSnapshot) this._saveSnapshot();
        }
      });

      // Selection change for toolbar updates
      this.editorEl.addEventListener('keyup', () => {
        setTimeout(() => updateActiveButtons(this), 10);
        if (typeof this.options.onSelectionChange === 'function') {
          this.options.onSelectionChange(window.getSelection(), this);
        }
      });

      this.editorEl.addEventListener('mouseup', () => {
        setTimeout(() => updateActiveButtons(this), 10);
        if (typeof this.options.onSelectionChange === 'function') {
          this.options.onSelectionChange(window.getSelection(), this);
        }
      });

      // Keyboard shortcuts
      this.editorEl.addEventListener('keydown', (e) => {
        // Save snapshot on significant changes
        if ((e.key === 'Enter' || e.key === 'Backspace' || e.key === 'Delete') && this._saveSnapshot) {
          setTimeout(() => this._saveSnapshot(), 10);
        }

        // Keyboard shortcuts
        if (e.ctrlKey || e.metaKey) {
          switch(e.key.toLowerCase()) {
            case 'z':
              if (e.shiftKey) {
                e.preventDefault();
                this._redo();
              } else {
                e.preventDefault();
                this._undo();
              }
              break;
            case 'y':
              e.preventDefault();
              this._redo();
              break;
            case 'k':
              e.preventDefault();
              openLinkDialog(this);
              break;
            case 'f':
              e.preventDefault();
              toggleFindReplace(this);
              break;
          }
        }
      });

      // Handle placeholder
      if (this.options.placeholder) {
        const handlePlaceholder = () => {
          if (this.editorEl.innerHTML.trim() === '' || this.editorEl.innerHTML === '<br>') {
            this.editorEl.setAttribute('data-placeholder', this.options.placeholder);
          } else {
            this.editorEl.removeAttribute('data-placeholder');
          }
        };

        this.editorEl.addEventListener('input', handlePlaceholder);
        this.editorEl.addEventListener('focus', handlePlaceholder);
        this.editorEl.addEventListener('blur', handlePlaceholder);
        handlePlaceholder(); // Initial check
      }

      // Image resize support
      if (this.options.features.imageResize) {
        this.setupImageResize();
      }

      // Drag and drop support
      if (this.options.features.dragDrop) {
        this.setupDragDrop();
      }
    }

    setupImageResize() {
      this.editorEl.addEventListener('click', (e) => {
        if (e.target.tagName === 'IMG') {
          this.selectImage(e.target);
        }
      });
    }

    selectImage(img) {
      // Remove existing resize handles
      this.wrapper.querySelectorAll('.wysiwyg-image-resize').forEach(handle => handle.remove());
      
      // Add resize handles
      const rect = img.getBoundingClientRect();
      const wrapperRect = this.wrapper.getBoundingClientRect();
      
      const handle = document.createElement('div');
      handle.className = 'wysiwyg-image-resize';
      handle.style.left = (rect.right - wrapperRect.left - 4) + 'px';
      handle.style.top = (rect.bottom - wrapperRect.top - 4) + 'px';
      
      this.wrapper.appendChild(handle);
      
      // Resize logic would go here
    }

    setupDragDrop() {
      this.editorEl.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
      });

      this.editorEl.addEventListener('drop', (e) => {
        e.preventDefault();
        
        const files = Array.from(e.dataTransfer.files);
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        
        imageFiles.forEach(file => {
          if (this.options.uploadHandler) {
            this.options.uploadHandler(file, (url) => {
              if (url) {
                const html = `<img src="${url}" style="max-width:100%;height:auto;border-radius:4px;">`;
                execCommand('insertHTML', html);
                if (this._saveSnapshot) this._saveSnapshot();
              }
            });
          } else {
            // Create data URL
            const reader = new FileReader();
            reader.onload = (e) => {
              const html = `<img src="${e.target.result}" style="max-width:100%;height:auto;border-radius:4px;">`;
              execCommand('insertHTML', html);
              if (this._saveSnapshot) this._saveSnapshot();
            };
            reader.readAsDataURL(file);
          }
        });
      });
    }

    setupAutosave() {
      let autosaveTimer;
      const autosave = () => {
        clearTimeout(autosaveTimer);
        autosaveTimer = setTimeout(() => {
          localStorage.setItem(this.options.autosaveKey, this.getContent());
        }, 1000);
      };

      this.editorEl.addEventListener('input', autosave);
    }

    loadAutosave() {
      const saved = localStorage.getItem(this.options.autosaveKey);
      if (saved && !this.editorEl.innerHTML.trim()) {
        this.setContent(saved);
      }
    }

    // Public API methods
    getContent() {
      return this.options.sanitize ? sanitizeHtml(this.editorEl.innerHTML) : this.editorEl.innerHTML;
    }

    setContent(html) {
      this.editorEl.innerHTML = this.options.sanitize ? sanitizeHtml(html) : html;
      this.updateOriginalElement();
      if (this._saveSnapshot) this._saveSnapshot();
    }

    getText() {
      return this.editorEl.innerText || this.editorEl.textContent || '';
    }

    updateOriginalElement() {
      const content = this.getContent();
      if (this.element.tagName === 'TEXTAREA' || this.element.tagName === 'INPUT') {
        this.element.value = content;
      } else {
        this.element.innerHTML = content;
      }
    }

    focus() {
      this.editorEl.focus();
    }

    blur() {
      this.editorEl.blur();
    }

    disable() {
      this.editorEl.contentEditable = false;
      this.toolbarEl.style.pointerEvents = 'none';
      this.toolbarEl.style.opacity = '0.5';
    }

    enable() {
      this.editorEl.contentEditable = true;
      this.toolbarEl.style.pointerEvents = '';
      this.toolbarEl.style.opacity = '';
    }

    destroy() {
      // Remove from instances list
      const index = instancesList.indexOf(this);
      if (index > -1) instancesList.splice(index, 1);
      
      // Restore original element
      this.element.style.display = '';
      this.updateOriginalElement();
      
      // Remove wrapper
      if (this.wrapper && this.wrapper.parentNode) {
        this.wrapper.parentNode.removeChild(this.wrapper);
      }
      
      // Clear autosave
      if (this.options.autosaveKey) {
        localStorage.removeItem(this.options.autosaveKey);
      }
    }

    // Plugin support
    addPlugin(plugin) {
      if (typeof plugin === 'function') {
        plugin(this);
      }
    }
  }

  /* ---- Public API ---- */
  const WYSIWYG_V2 = {
    init: function(selector, options = {}) {
      const elements = typeof selector === 'string' ? 
        document.querySelectorAll(selector) : 
        (selector.length !== undefined ? selector : [selector]);
      
      const instances = [];
      Array.from(elements).forEach(el => {
        if (!el.dataset.wysiwygV2) {
          const instance = new KriaEditorV2(el, options);
          el.dataset.wysiwygV2 = 'true';
          instances.push(instance);
        }
      });
      
      return instances.length === 1 ? instances[0] : instances;
    },

    // Utility methods
    sanitize: sanitizeHtml,
    instances: () => instancesList.slice(),
    version: '0.2.0'
  };

  // Aliases for backward compatibility
  const KriaLiteV2 = WYSIWYG_V2;

  // Auto-init if data-wysiwyg-v2 attribute exists
  document.addEventListener('DOMContentLoaded', () => {
    const autoInitElements = document.querySelectorAll('[data-wysiwyg-v2]');
    if (autoInitElements.length > 0) {
      autoInitElements.forEach(el => {
        const options = {};
        
        // Parse data attributes for options
        Object.keys(el.dataset).forEach(key => {
          if (key.startsWith('wysiwyg') && key !== 'wysiwygV2') {
            const optionKey = key.replace('wysiwyg', '').toLowerCase();
            let value = el.dataset[key];
            
            // Parse boolean and numeric values
            if (value === 'true') value = true;
            else if (value === 'false') value = false;
            else if (!isNaN(value)) value = parseFloat(value);
            
            options[optionKey] = value;
          }
        });
        
        WYSIWYG_V2.init(el, options);
      });
    }
  });

  // Export to global scope
  global.WYSIWYG = global.WYSIWYG || {};
  global.WYSIWYG.v2 = WYSIWYG_V2;
  global.KriaLite = global.KriaLite || {};
  global.KriaLite.v2 = KriaLiteV2;

})(typeof window !== 'undefined' ? window : this);