<?php
/**
 * Debug Cloudinary Configuration
 */

require_once __DIR__ . '/longhai-backend/vendor/autoload.php';

// Load Laravel environment
$app = require_once __DIR__ . '/longhai-backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "🔍 Debug Cloudinary Configuration\n";
echo "================================\n\n";

// Check environment variables
echo "Environment Variables:\n";
echo "CLOUDINARY_CLOUD_NAME: " . (env('CLOUDINARY_CLOUD_NAME') ?: 'NOT SET') . "\n";
echo "CLOUDINARY_KEY: " . (env('CLOUDINARY_KEY') ?: 'NOT SET') . "\n";
echo "CLOUDINARY_SECRET: " . (env('CLOUDINARY_SECRET') ? substr(env('CLOUDINARY_SECRET'), 0, 10) . '...' : 'NOT SET') . "\n";
echo "CLOUDINARY_URL: " . (env('CLOUDINARY_URL') ?: 'NOT SET') . "\n\n";

// Check config values
echo "Config Values:\n";
echo "cloudinary.cloud_name: " . (config('cloudinary.cloud_name') ?: 'NOT SET') . "\n";
echo "cloudinary.api_key: " . (config('cloudinary.api_key') ?: 'NOT SET') . "\n";
echo "cloudinary.api_secret: " . (config('cloudinary.api_secret') ? substr(config('cloudinary.api_secret'), 0, 10) . '...' : 'NOT SET') . "\n\n";

// Test direct env access
echo "Direct ENV Access:\n";
echo "CLOUDINARY_CLOUD_NAME: " . ($_ENV['CLOUDINARY_CLOUD_NAME'] ?? 'NOT SET') . "\n";
echo "CLOUDINARY_KEY: " . ($_ENV['CLOUDINARY_KEY'] ?? 'NOT SET') . "\n";
echo "CLOUDINARY_SECRET: " . (isset($_ENV['CLOUDINARY_SECRET']) ? substr($_ENV['CLOUDINARY_SECRET'], 0, 10) . '...' : 'NOT SET') . "\n\n";

// Check .env file content
echo ".env File Content (last 10 lines):\n";
$envContent = file_get_contents(__DIR__ . '/longhai-backend/.env');
$lines = explode("\n", $envContent);
$lastLines = array_slice($lines, -10);
foreach ($lastLines as $line) {
    if (strpos($line, 'CLOUDINARY') !== false) {
        echo $line . "\n";
    }
} 