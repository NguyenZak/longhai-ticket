<?php

require_once 'vendor/autoload.php';

use Cloudinary\Cloudinary as CloudinarySDK;
use Cloudinary\Api\Upload\UploadApi;

// Load Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "🔧 Testing Cloudinary Configuration...\n\n";

// Check environment variables
echo "📋 Environment Variables:\n";
echo "CLOUDINARY_CLOUD_NAME: " . (env('CLOUDINARY_CLOUD_NAME') ?: 'NOT SET') . "\n";
echo "CLOUDINARY_API_KEY: " . (env('CLOUDINARY_API_KEY') ?: 'NOT SET') . "\n";
echo "CLOUDINARY_API_SECRET: " . (env('CLOUDINARY_API_SECRET') ? 'SET' : 'NOT SET') . "\n";
echo "CLOUDINARY_URL: " . (env('CLOUDINARY_URL') ?: 'NOT SET') . "\n\n";

// Check config
echo "⚙️ Config Values:\n";
echo "cloud_name: " . (config('cloudinary.cloud_name') ?: 'NOT SET') . "\n";
echo "api_key: " . (config('cloudinary.api_key') ?: 'NOT SET') . "\n";
echo "api_secret: " . (config('cloudinary.api_secret') ? 'SET' : 'NOT SET') . "\n\n";

// Test Cloudinary connection
try {
    $cloudinary = new CloudinarySDK([
        'cloud' => [
            'cloud_name' => config('cloudinary.cloud_name'),
            'api_key' => config('cloudinary.api_key'),
            'api_secret' => config('cloudinary.api_secret'),
        ],
    ]);
    
    echo "✅ Cloudinary SDK initialized successfully\n";
    
    // Test API connection
    $uploadApi = new UploadApi();
    echo "✅ UploadApi initialized successfully\n";
    
} catch (Exception $e) {
    echo "❌ Error initializing Cloudinary: " . $e->getMessage() . "\n";
}

echo "\n🔍 Test completed.\n"; 