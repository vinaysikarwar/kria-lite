# Kria Lite WYSIWYG Editor v0.2.0 🚀

**Enhanced Edition with Advanced Features & Collaboration Tools**

A powerful, lightweight, and mobile-friendly WYSIWYG editor built with vanilla JavaScript. Version 0.2.0 introduces advanced text formatting, media support, collaboration features, and professional editing tools while maintaining backward compatibility with v0.1.x.

## ✨ What's New in v0.2.0

### 🎨 Enhanced Text Formatting
- **Text Highlighting**: Highlight important text with custom colors
- **Subscript/Superscript**: Perfect for mathematical formulas and citations
- **Line Height Control**: Adjust spacing for better readability
- **Advanced Font Controls**: Enhanced font family and size options

### 📊 Advanced Tables
- **Custom Dimensions**: Choose rows and columns during creation
- **Header Support**: Toggle header rows with enhanced styling
- **Striped Styling**: Professional table appearance options
- **Responsive Design**: Tables work perfectly on mobile devices

### 🎬 Media Enhancement
- **Video Embedding**: Support for YouTube, Vimeo, and other platforms
- **Drag & Drop Images**: Simply drag images into the editor
- **Image Resize**: Drag handles to resize images inline
- **Upload Integration**: Built-in file upload with progress tracking

### 📝 Smart Content
- **Interactive Checklists**: Clickable checkboxes for task management
- **Collapsible Sections**: Organize content with expandable blocks
- **Templates System**: Reusable content templates
- **Code Snippets**: Quick insertion of formatted code blocks

### 🔍 Professional Tools
- **Find & Replace**: Search and replace text with highlighting
- **Word Count**: Real-time statistics (words, characters)
- **Source View**: Toggle between WYSIWYG and HTML source
- **Fullscreen Mode**: Distraction-free editing experience

### 🤝 Collaboration Ready
- **User Management**: Built-in user identification system
- **Comment Hooks**: Integration points for commenting systems
- **Mention Support**: @mention functionality for team collaboration
- **Real-time Hooks**: Event system for live editing features

## 🚀 Quick Start

### Basic Usage

```html
<!DOCTYPE html>
<html>
<head>
    <script src="kria.editor.v2.min.js"></script>
</head>
<body>
    <div id="my-editor">
        <p>Start typing here...</p>
    </div>
    
    <script>
        const editor = WYSIWYG.v2.init('#my-editor', {
            height: 400,
            maxHeight: 750,
            placeholder: 'Start typing...'
        });
    </script>
</body>
</html>
```

### Advanced Configuration

```javascript
const editor = WYSIWYG.v2.init('#advanced-editor', {
    // Core settings
    height: 400,
    maxHeight: 750,
    placeholder: 'Start creating amazing content...',
    
    // Enhanced toolbar with v2 features
    toolbar: [
        'undo', 'redo', '|',
        'bold', 'italic', 'underline', 'strike', 'highlight', 
        'subscript', 'superscript', 'removeFormat', '|',
        'h1', 'h2', 'h3', 'fontFamily', 'fontSize', 'lineHeight', '|',
        'fontColor', 'bgColor', 'alignLeft', 'alignCenter', 'alignRight', '|',
        'ul', 'ol', 'checklist', 'indent', 'outdent', '|',
        'link', 'image', 'video', 'table', 'hr', '|',
        'code', 'quote', 'collapsible', '|',
        'findReplace', 'wordCount', 'templates', 'insertSnippet', '|',
        'toggleSource', 'fullscreen'
    ],
    
    // New v2 features
    features: {
        wordCount: true,
        findReplace: true,
        imageResize: true,
        dragDrop: true,
        tableAdvanced: true,
        spellCheck: false,
        autoComplete: false
    },
    
    // Templates and snippets
    templates: [
        {
            name: 'Meeting Notes',
            content: `
                <h2>📋 Meeting Notes</h2>
                <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                <ul class="wysiwyg-checklist">
                    <li>Action item 1</li>
                    <li>Action item 2</li>
                </ul>
            `
        },
        {
            name: 'Article Template',
            content: '<h1>Article Title</h1><p>Introduction paragraph...</p>'
        }
    ],
    
    snippets: [
        {
            name: 'Tip Box',
            content: '<div style="background:#dbeafe;padding:12px;border-radius:6px;">💡 <strong>Tip:</strong> Your tip here</div>'
        }
    ],
    
    // Collaboration features
    collaboration: {
        enabled: true,
        userId: 'user123',
        userName: 'John Doe',
        onComment: (selection, instance) => {
            // Handle comment creation
        },
        onMention: (query, instance) => {
            // Handle @mentions
        }
    },
    
    // Upload configuration
    uploadUrl: '/api/upload',
    uploadFieldName: 'image',
    uploadHeaders: {
        'Authorization': 'Bearer your-token'
    },
    parseUploadResponse: (response) => response.url,
    
    // Event callbacks
    onWordCountUpdate: (stats, instance) => {
        console.log(`Words: ${stats.words}, Characters: ${stats.characters}`);
    },
    
    onContentChange: (content, instance) => {
        // Auto-save logic
        localStorage.setItem('editor-content', content);
    },
    
    onSelectionChange: (selection, instance) => {
        // Handle selection changes
    }
});
```

## 📋 API Reference

### Initialization

```javascript
// Single element
const editor = WYSIWYG.v2.init('#editor', options);

// Multiple elements
const editors = WYSIWYG.v2.init('.editor-class', options);

// Auto-initialization with data attributes
<div data-wysiwyg-v2 
     data-wysiwyg-height="400" 
     data-wysiwyg-placeholder="Type here...">
</div>
```

### Instance Methods

```javascript
// Content management
editor.getContent()           // Get HTML content
editor.setContent(html)       // Set HTML content
editor.getText()             // Get plain text
editor.updateOriginalElement() // Sync with original element

// Editor control
editor.focus()               // Focus editor
editor.blur()                // Blur editor
editor.disable()             // Disable editing
editor.enable()              // Enable editing
editor.destroy()             // Destroy instance

// Plugin system
editor.addPlugin(pluginFunction)
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `height` | number | 360 | Editor height in pixels |
| `maxHeight` | number | 750 | Maximum height with scroll |
| `placeholder` | string | 'Start typing...' | Placeholder text |
| `toolbar` | array | [...] | Toolbar button configuration |
| `features.wordCount` | boolean | true | Enable word count display |
| `features.findReplace` | boolean | true | Enable find & replace |
| `features.imageResize` | boolean | true | Enable image resize handles |
| `features.dragDrop` | boolean | true | Enable drag & drop upload |
| `templates` | array | [] | Content templates |
| `snippets` | array | [] | Quick snippets |
| `collaboration.enabled` | boolean | false | Enable collaboration features |
| `uploadUrl` | string | null | Image upload endpoint |

### Events

```javascript
const editor = WYSIWYG.v2.init('#editor', {
    onContentChange: (content, instance) => {
        // Content changed
    },
    
    onWordCountUpdate: (stats, instance) => {
        // Word count updated
        // stats: { words, characters, charactersNoSpaces }
    },
    
    onSelectionChange: (selection, instance) => {
        // Selection changed
    },
    
    onUploadProgress: (percent, instance) => {
        // Upload progress
    }
});
```

## 🎯 Migration from v0.1.x

Kria Editor v0.2.0 is **100% backward compatible** with v0.1.x. Your existing code will continue to work without any changes:

```javascript
// Your existing v0.1.x code
const editor = WYSIWYG.init('#editor', {
    toolbar: ['bold', 'italic', 'link', 'image']
});

// Still works in v0.2.0! But you can enhance it:
const enhanced = WYSIWYG.v2.init('#editor', {
    toolbar: ['bold', 'italic', 'highlight', 'subscript', 'link', 'video', 'findReplace']
});
```

### Upgrade Benefits

- ✅ **Zero Breaking Changes**: All v0.1.x APIs work unchanged
- ✅ **Enhanced Features**: Access to 15+ new formatting options
- ✅ **Better Performance**: Optimized rendering and memory usage
- ✅ **Mobile First**: Improved touch and responsive design
- ✅ **Professional Tools**: Word count, find/replace, templates

## 🔧 Building from Source

```bash
# Clone the repository
git clone https://github.com/vinaysikarwar/kria-editor.git
cd kria-editor/v2

# Install dependencies
npm install

# Build minified version
npm run build

# Start development server
npm run dev
```

## 📱 Mobile & Touch Support

Version 0.2.0 includes enhanced mobile support:

- **Touch-Optimized Toolbar**: Larger buttons for touch interfaces
- **Responsive Design**: Adapts to screen size automatically
- **Sticky Toolbar**: Stays accessible during scrolling
- **Safe Area Support**: Works with iOS notches and Android navigation
- **Gesture Support**: Pinch to zoom, drag to select

## 🎨 Customization

### Custom Themes

```css
/* Custom theme example */
.wysiwyg-wrapper.dark-theme {
    background: #1e293b;
    color: #e2e8f0;
    border-color: #374151;
}

.wysiwyg-wrapper.dark-theme .wysiwyg-toolbar {
    background: #0f172a;
    border-color: #374151;
}

.wysiwyg-wrapper.dark-theme .wysiwyg-toolbar button:hover {
    background: #374151;
}
```

### Custom Icons

```javascript
const editor = WYSIWYG.v2.init('#editor', {
    icons: {
        bold: '<i class="fas fa-bold"></i>',
        italic: '<i class="fas fa-italic"></i>'
        // ... other custom icons
    }
});
```

### Custom Plugins

```javascript
function myPlugin(instance) {
    // Add custom button
    const button = document.createElement('button');
    button.innerHTML = 'My Feature';
    button.addEventListener('click', () => {
        // Custom functionality
    });
    
    instance.toolbarEl.appendChild(button);
}

const editor = WYSIWYG.v2.init('#editor', {
    plugins: [myPlugin]
});
```

## 🔒 Security

- **HTML Sanitization**: Built-in XSS protection
- **Safe Uploads**: Configurable file type restrictions
- **Content Security**: Removes dangerous scripts and attributes
- **CSRF Protection**: Token-based upload authentication

## 🌐 Browser Support

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ iOS Safari 12+
- ✅ Android Chrome 60+

## 📈 Performance

- **Bundle Size**: ~45KB minified + gzipped
- **Memory Usage**: <2MB typical usage
- **Render Speed**: <16ms for typical operations
- **Mobile Performance**: Optimized for 60fps on mobile

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
git clone https://github.com/vinaysikarwar/kria-editor.git
cd kria-editor/v2
npm install
npm run dev
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with vanilla JavaScript for maximum compatibility
- Inspired by modern editors like Notion and Craft
- Thanks to all contributors and users of v0.1.x

---

**Made with ❤️ by [Vinay Sikarwar](https://github.com/vinaysikarwar)**

[🌟 Star on GitHub](https://github.com/vinaysikarwar/kria-editor) | [📖 Documentation](https://kria-editor.dev) | [🐛 Report Issues](https://github.com/vinaysikarwar/kria-editor/issues)