# Kria Lite WYSIWYG Editor

<p align="center">
  <img src="assets/logo.svg" alt="Kria Lite logo" width="360" />
</p>

<p align="center">
  <a href="LICENSE"><img alt="License" src="https://img.shields.io/badge/license-MIT-green.svg" /></a>
  <img alt="Size" src="https://img.shields.io/badge/minified%20%2B%20gz-~3–6KB*-informational" />
  <img alt="Vanilla JS" src="https://img.shields.io/badge/vanilla-JS-blue" />
</p>

A tiny, dependency-free WYSIWYG editor in vanilla JavaScript. Fast to load, simple to use, and easy to integrate.

- Zero dependencies
- Image upload with progress (via XHR or custom handler)
- Basic sanitization built in

## Feature overview

- Core
  - Lightweight vanilla JS; no dependencies
  - Toolbar: Bold, Italic, Underline, Strike, Remove format, H1/H2/H3, Paragraph, Align Left/Center/Right, Bulleted/Numbered lists, Indent/Outdent, Link, Image, Table, Horizontal rule, Code block, Quote, Toggle Source (HTML), Fullscreen
  - Keyboard shortcuts: Cmd/Ctrl+B/I/U, Cmd/Ctrl+K (link)
  - Basic HTML sanitization
  - Image upload via `uploadUrl` or custom `uploadHandler` with progress
  - API: `getHTML`, `setHTML`, `getText`, `insertHtml`, `destroy`
  - Optional autosave to localStorage

- Advanced build extras (kria.editor.widget.*)
  - Undo/Redo with custom snapshot history + toolbar buttons; shortcuts Cmd/Ctrl+Z and Shift+Cmd/Ctrl+Z
  - Mobile-friendly UI: sticky/scrollable toolbar on small screens, larger tap targets, safe-area insets
  - Font family dropdown, font size, font and background color pickers
  - Link dialog (restores selection) and Image dialog
  - Paste images from clipboard: instant blob preview, optional upload with URL replacement
  - Table dialog: choose rows and columns before insert
  - Code block insertion, Toggle source (WYSIWYG/HTML), Fullscreen mode
  - Active-state indication for toolbar buttons
  - Overridable icons via `options.icons`
  - Plugin hook: `options.plugins: (instance) => void`
  - Enhanced paste handling (prefer HTML; fallback to plain text → paragraphs)

## Quick start

Include the script and enhance your `<textarea>`

```html
<script src="editor.widget.js"></script>
<textarea class="wysiwyg" style="width:100%;height:300px"></textarea>
<script>
  // Use either alias:
  // KriaLite.init('.wysiwyg');
  WYSIWYG.init('.wysiwyg', {
    // Optional image upload
    uploadUrl: '/wysiwyg/upload.php',
    uploadFieldName: 'image',
    // Optional: map your API response to an URL
    parseUploadResponse: (json) => json && json.url
  });
</script>
```

## Upload endpoint

A sample PHP upload handler is provided at `upload.php`. It stores images under `uploads/images` and returns `{ "url": "/wysiwyg/uploads/images/<filename>" }`.

- Adjust `$publicPathPrefix` if your public path differs
- Set `$maxFileSize` and `$allowedMime` as needed
- For auth, flip `$requireAuthToken` to `true` and implement validation

## API

- `WYSIWYG.init(selectorOrNodeList, options)`
- `KriaLite.init(selectorOrNodeList, options)` (alias)
- `WYSIWYG.sanitizeHtml(html)`

Key options (see `editor.widget.js` for full list):
- `height` (number)
- `toolbar` (array of controls)
- `sanitize` (boolean)
- `uploadUrl`, `uploadFieldName`, `uploadHeaders`
- `uploadHandler(file, { onProgress })` custom uploader returning `{ url }` or string
- `onUploadProgress(percent, loaded, total, imgEl, instance)`
- `parseUploadResponse(json)` -> string URL

## Build and minify

Requires Node.js. This repo ships with a minimal build using UglifyJS.

```bash
npm install
npm run build
```

Outputs:
- Core: `editor.widget.min.js`, `editor.widget.min.js.map`
- Advanced: `kria.editor.widget.min.js`, `kria.editor.widget.min.js.map`

### Advanced build usage

```html
<script src="kria.editor.widget.min.js"></script>
<textarea class="wysiwyg" style="width:100%;height:300px"></textarea>
<script>
  WYSIWYG.init('.wysiwyg', {
    // Optional: customize icons per control
    // icons: { undo: '<svg>...</svg>' },
    // Optional image upload
    uploadUrl: '/wysiwyg/upload.php',
    uploadFieldName: 'image',
    autosaveKey: 'post-42-draft'
  });
</script>
```

## Publish options

- GitHub Releases: tag versions (e.g., v0.1.0) and attach the minified build
- npm: publish the package for easy install (`npm publish`)
- Packagist: submit this repo to Packagist to expose the PHP example via Composer
- CDN: once on npm, unpkg/jsDelivr can serve the minified file directly

## Demo and social links

- Live demo (GitHub Pages): https://vinaysikarwar.github.io/kria-lite/
- Repository: https://github.com/vinaysikarwar/kria-lite
- Issue tracker: https://github.com/vinaysikarwar/kria-lite/issues

Try online:
- StackBlitz (static): https://stackblitz.com/fork/github/vinaysikarwar/kria-lite
- CodeSandbox (import from GitHub): https://codesandbox.io/p/github/vinaysikarwar/kria-lite

GitHub topics (set): `wysiwyg`, `editor`, `vanilla-js`, `rich-text`, `lightweight`, `javascript`

Tip: Add a repo social preview image (Settings → Social preview). A screenshot of the editor or the `assets/logo.svg` on a gradient background works well.

## Demo

The demo is a simple static page using `KriaLite.init()` and no upload backend. To enable uploads in your own app, configure `uploadUrl` as shown above.

## Notes

- Uses `document.execCommand` for editing for broad compatibility.
- Blob image previews are inserted instantly; final URL replaces on upload success.
- Minimal CSS is injected automatically; customize via overrides if needed.

## License

MIT
