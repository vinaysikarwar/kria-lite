<?php
// upload-image.php
// PHP 7.4+ / 8+
// Simple secure image upload endpoint for the WYSIWYG widget.
// Returns JSON: { "url": "/uploads/images/<filename>" } on success.

declare(strict_types=1);

// ------------------------
// Configuration
// ------------------------
$uploadField = 'image';                 // field name expected from the widget (uploadFieldName)
$uploadDir = __DIR__ . '/uploads/images'; // server directory where files will be saved
$publicPathPrefix = '/wysiwyg/uploads/images'; // URL path prefix where uploaded files are served from
$maxFileSize = 5 * 1024 * 1024;        // 5 MB
$allowedMime = [                       // allowed MIME types
    'image/jpeg' => ['jpg','jpeg'],
    'image/png'  => ['png'],
    'image/gif'  => ['gif'],
    'image/webp' => ['webp']
];
$requireAuthToken = false;             // set true to require a header 'Authorization: Bearer <token>'
$expectedAuthToken = 'my-secret-token';// if $requireAuthToken true validate against this (or validate properly)
// ------------------------

header('Content-Type: application/json; charset=utf-8');
// Optional CORS: adjust to your front-end origin in production
// header('Access-Control-Allow-Origin: https://yourdomain.com');
// header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // for preflight requests (if your widget uses CORS). Adjust allowed headers/methods as required.
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    http_response_code(204);
    exit;
}

// Optional simple auth check
if ($requireAuthToken) {
    $auth = null;
    if (!empty($_SERVER['HTTP_AUTHORIZATION'])) $auth = trim($_SERVER['HTTP_AUTHORIZATION']);
    // some clients send bearer token via 'Authorization: Bearer <token>'
    if (!$auth || stripos($auth, 'Bearer ') !== 0) {
        http_response_code(401);
        echo json_encode(['error' => 'Missing Authorization token']);
        exit;
    }
    $token = substr($auth, 7);
    if ($token !== $expectedAuthToken) {
        http_response_code(403);
        echo json_encode(['error' => 'Invalid token']);
        exit;
    }
}

// check upload present
if (!isset($_FILES[$uploadField])) {
    http_response_code(400);
    echo json_encode(['error' => 'No file uploaded (expected field: ' . $uploadField . ')']);
    exit;
}

$file = $_FILES[$uploadField];

// check basic upload errors
if (!is_uploaded_file($file['tmp_name'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Upload failed or no temp file found']);
    exit;
}
if ($file['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    $msg = 'Upload error code: ' . $file['error'];
    echo json_encode(['error' => $msg]);
    exit;
}

// check file size
if ($file['size'] > $maxFileSize) {
    http_response_code(413); // Payload Too Large
    echo json_encode(['error' => 'File too large. Max size ' . ($maxFileSize/1024/1024) . ' MB']);
    exit;
}

// validate MIME type using finfo
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mime = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!$mime || !array_key_exists($mime, $allowedMime)) {
    http_response_code(415); // Unsupported Media Type
    echo json_encode(['error' => 'Unsupported file type: ' . ($mime ?: 'unknown')]);
    exit;
}

// sanitize and build a unique filename
// use original extension if reliable, otherwise pick from allowedMime map
$origName = basename($file['name']);
$origExt = pathinfo($origName, PATHINFO_EXTENSION);
$origExt = strtolower($origExt);

// prefer the extension from allowedMime list to mitigate spoofing
$ext = in_array($origExt, $allowedMime[$mime]) ? $origExt : $allowedMime[$mime][0];
// build filename: timestamp-random-safe.ext
$baseName = preg_replace('/[^a-z0-9-_]/i', '_', pathinfo($origName, PATHINFO_FILENAME));
if (strlen($baseName) < 1) $baseName = 'img';
$filename = sprintf('%s-%s.%s', time(), bin2hex(random_bytes(6)), $ext);

// ensure upload dir exists
if (!is_dir($uploadDir)) {
    if (!mkdir($uploadDir, 0755, true)) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create upload directory']);
        exit;
    }
}

// move uploaded file to destination
$dest = $uploadDir . '/' . $filename;
if (!move_uploaded_file($file['tmp_name'], $dest)) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to move uploaded file']);
    exit;
}

// optionally set permissions
@chmod($dest, 0644);

// Build public URL to return to client
// If your site uses a base URL or CDN prefix, change this builder accordingly.
$scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'] ?? ($_SERVER['SERVER_NAME'] ?? 'localhost');
$publicUrl = $publicPathPrefix . '/' . $filename;

// If you prefer to return an absolute URL uncomment below:
// $publicUrl = $scheme . '://' . $host . $publicPathPrefix . '/' . $filename;

http_response_code(200);
echo json_encode(['url' => $publicUrl]);
exit;