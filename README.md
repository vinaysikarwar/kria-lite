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

Outputs: `editor.widget.min.js` and `editor.widget.min.js.map`.

## Publish options

- GitHub Releases: tag versions (e.g., v0.1.0) and attach the minified build
- npm: publish the package for easy install (`npm publish`)
- Packagist: submit this repo to Packagist to expose the PHP example via Composer
- CDN: once on npm, unpkg/jsDelivr can serve the minified file directly

## Social/SEO tips

- Add repo topics: `wysiwyg`, `editor`, `vanilla-js`, `rich-text`, `lightweight`, `javascript`
- Add a short description and a banner image (GitHub social preview)
- Write a short demo page and animated GIF in the README
- Consider a simple site or GitHub Pages demo linking to `index.html`

## Notes

- Uses `document.execCommand` for editing for broad compatibility.
- Blob image previews are inserted instantly; final URL replaces on upload success.
- Minimal CSS is injected automatically; customize via overrides if needed.

## License

MIT
