# Changelog

All notable changes to Kria Lite WYSIWYG Editor will be documented in this file.

## [0.2.0] - 2024-12-28 🚀

### ✨ Major New Features

#### Enhanced Text Formatting
- **NEW**: Text highlighting with custom colors
- **NEW**: Subscript and superscript support (H₂O, E=mc²)
- **NEW**: Line height control for better typography
- **ENHANCED**: Expanded font family options
- **ENHANCED**: Improved font size controls

#### Advanced Table System
- **NEW**: Custom row/column selection during creation
- **NEW**: Header row toggle with enhanced styling
- **NEW**: Striped table styling option
- **NEW**: Advanced table controls and editing
- **ENHANCED**: Mobile-responsive table design

#### Media & Upload Enhancements
- **NEW**: Video embedding (YouTube, Vimeo, Dailymotion)
- **NEW**: Drag & drop image upload
- **NEW**: Image resize handles with drag support
- **NEW**: Upload progress tracking
- **NEW**: Custom upload handlers and endpoints
- **ENHANCED**: Image handling and optimization

#### Smart Content Features
- **NEW**: Interactive checklists with clickable checkboxes
- **NEW**: Collapsible content sections
- **NEW**: Code block insertion with syntax highlighting
- **NEW**: Template system for reusable content
- **NEW**: Snippet system for quick insertions

#### Professional Editing Tools
- **NEW**: Find & Replace functionality with highlighting
- **NEW**: Real-time word count (words, characters)
- **NEW**: Source code view toggle
- **NEW**: Fullscreen editing mode
- **NEW**: Enhanced undo/redo system (50 states)

#### Collaboration Ready
- **NEW**: User identification system
- **NEW**: Comment hooks for integration
- **NEW**: Mention system (@username)
- **NEW**: Real-time editing event hooks
- **NEW**: Collaboration event callbacks

### 🔧 Technical Improvements

#### Mobile & Touch
- **ENHANCED**: Touch-optimized toolbar with larger buttons
- **ENHANCED**: Responsive design for all screen sizes
- **ENHANCED**: Sticky toolbar with safe-area support
- **ENHANCED**: Better gesture support and scrolling

#### Performance & Architecture
- **IMPROVED**: Bundle size optimization (~45KB gzipped)
- **IMPROVED**: Memory usage optimization
- **IMPROVED**: Faster rendering and DOM updates
- **IMPROVED**: Enhanced event handling system
- **NEW**: Plugin architecture for extensibility

#### Developer Experience
- **NEW**: Comprehensive API documentation
- **NEW**: TypeScript-friendly event callbacks
- **NEW**: Enhanced debugging and error handling
- **NEW**: Source maps for development
- **IMPROVED**: Better configuration options

### 🎨 UI/UX Enhancements

#### Visual Design
- **ENHANCED**: Modern toolbar design with better spacing
- **ENHANCED**: Improved button states and hover effects
- **ENHANCED**: Better focus indicators for accessibility
- **NEW**: Dark theme support preparation
- **NEW**: Custom icon support

#### User Experience
- **ENHANCED**: Better placeholder handling
- **ENHANCED**: Improved keyboard shortcuts (Ctrl+K for links, Ctrl+F for find)
- **ENHANCED**: More intuitive dialog interactions
- **NEW**: Context-aware toolbar button states
- **NEW**: Better error messages and user feedback

### 🔒 Security & Stability

#### Security
- **ENHANCED**: Improved HTML sanitization
- **NEW**: Safe video embedding (whitelist approach)
- **NEW**: Upload security with file type validation
- **NEW**: XSS protection enhancements

#### Stability
- **FIXED**: Selection handling edge cases
- **FIXED**: Table insertion reliability
- **IMPROVED**: Cross-browser compatibility
- **IMPROVED**: Error handling and recovery

### 📋 API Changes

#### New APIs
```javascript
// New v2 initialization
WYSIWYG.v2.init(selector, options)

// New configuration options
{
  features: { wordCount, findReplace, imageResize, dragDrop },
  templates: [{ name, content }],
  snippets: [{ name, content }],
  collaboration: { enabled, userId, userName },
  uploadUrl, uploadHeaders, parseUploadResponse
}

// New event callbacks
onWordCountUpdate, onContentChange, onSelectionChange, onUploadProgress
```

#### Backward Compatibility
- ✅ **100% compatible** with v0.1.x APIs
- ✅ All existing `WYSIWYG.init()` calls work unchanged
- ✅ All existing toolbar configurations supported
- ✅ No breaking changes to existing functionality

### 📦 Build System

#### Development
- **NEW**: npm-based build system
- **NEW**: Source map generation
- **NEW**: Watch mode for development
- **NEW**: Local development server

#### Distribution
- **NEW**: Minified build with source maps
- **NEW**: Multiple bundle formats
- **NEW**: Package.json for npm distribution

---

## [0.1.9] - 2024-12-27

### 🔧 Improvements
- **ENHANCED**: MaxHeight option with default 750px
- **ENHANCED**: Overflow scroll for content exceeding maxHeight
- **FIXED**: Table dialog with proper row/column selection
- **FIXED**: Selection restoration after dialog interactions
- **IMPROVED**: Mobile toolbar positioning and scrolling

### 🎨 Features Added
- **NEW**: Font family dropdown with common fonts
- **NEW**: Table creation dialog with custom dimensions
- **ENHANCED**: Better dialog UX with focus management

---

## [0.1.8] - 2024-12-27

### 🔧 Improvements
- **ENHANCED**: Mobile-responsive toolbar design
- **ENHANCED**: Touch-friendly button sizing
- **ENHANCED**: Safe area support for iOS devices
- **IMPROVED**: Dialog positioning and sizing on mobile

---

## [0.1.7] - 2024-12-27

### 🎨 Features Added
- **NEW**: Comprehensive toolbar with essential formatting options
- **NEW**: Link insertion with URL validation
- **NEW**: Image insertion dialog
- **NEW**: Table creation functionality
- **NEW**: Undo/Redo history system

### 🔧 Improvements
- **ENHANCED**: Better HTML sanitization
- **ENHANCED**: Improved accessibility with ARIA labels
- **IMPROVED**: Cross-browser compatibility

---

## [0.1.0] - 2024-12-26

### 🎉 Initial Release
- **NEW**: Basic WYSIWYG editor functionality
- **NEW**: ContentEditable-based editing
- **NEW**: Simple toolbar with basic formatting
- **NEW**: HTML output and input handling
- **NEW**: Lightweight vanilla JavaScript implementation

---

## Version Comparison

| Feature | v0.1.x | v0.2.0 |
|---------|--------|--------|
| **Core Functionality** |
| Basic formatting (B, I, U) | ✅ | ✅ |
| Headers (H1-H3) | ✅ | ✅ (H1-H6) |
| Lists (UL, OL) | ✅ | ✅ |
| Links | ✅ | ✅ |
| Images | ✅ | ✅ |
| Tables | ✅ Basic | ✅ Advanced |
| Undo/Redo | ✅ Basic | ✅ Enhanced |
| **Advanced Formatting** |
| Text highlighting | ❌ | ✅ |
| Subscript/Superscript | ❌ | ✅ |
| Line height control | ❌ | ✅ |
| Font family selection | ✅ Basic | ✅ Enhanced |
| Color controls | ❌ | ✅ |
| **Content Features** |
| Interactive checklists | ❌ | ✅ |
| Collapsible sections | ❌ | ✅ |
| Code blocks | ❌ | ✅ |
| Video embedding | ❌ | ✅ |
| **Professional Tools** |
| Find & Replace | ❌ | ✅ |
| Word count | ❌ | ✅ |
| Source view | ❌ | ✅ |
| Fullscreen mode | ❌ | ✅ |
| Templates | ❌ | ✅ |
| Snippets | ❌ | ✅ |
| **Collaboration** |
| User system | ❌ | ✅ |
| Comments | ❌ | ✅ Hooks |
| Mentions | ❌ | ✅ |
| Real-time events | ❌ | ✅ |
| **Mobile & Touch** |
| Basic mobile support | ✅ | ✅ |
| Touch-optimized toolbar | ❌ | ✅ |
| Drag & drop | ❌ | ✅ |
| Image resize | ❌ | ✅ |
| **Developer Experience** |
| Plugin system | ❌ | ✅ |
| Event callbacks | Basic | ✅ Enhanced |
| TypeScript support | ❌ | ✅ Ready |
| Build system | ❌ | ✅ |
| **Bundle Size** |
| Minified + gzipped | ~25KB | ~45KB |
| **Browser Support** |
| Modern browsers | ✅ | ✅ |
| IE11 | ⚠️ Partial | ❌ |
| Mobile browsers | ✅ Basic | ✅ Enhanced |

## Migration Path

### For v0.1.x Users

Your existing code will continue to work without any changes:

```javascript
// v0.1.x code - still works in v0.2.0
const editor = WYSIWYG.init('#editor');
```

To access new features, use the v2 API:

```javascript
// Enhanced v0.2.0 features
const editor = WYSIWYG.v2.init('#editor', {
    features: { wordCount: true, findReplace: true },
    templates: [/* your templates */]
});
```

### Recommended Upgrade Steps

1. **Test Compatibility**: Your v0.1.x code should work unchanged
2. **Gradual Enhancement**: Add new features incrementally
3. **User Training**: Introduce users to new capabilities
4. **Backup**: Keep v0.1.x as fallback if needed

---

**Total Features Added in v0.2.0**: 25+ new features and enhancements
**Backward Compatibility**: 100% maintained
**Performance Impact**: <20KB bundle size increase for 10x more features