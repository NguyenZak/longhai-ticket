<?php
/**
 * Test Cloudinary Upload
 * 
 * This script tests the Cloudinary upload functionality
 * Run: php test-cloudinary-upload.php
 */

require_once __DIR__ . '/longhai-backend/vendor/autoload.php';

// Load Laravel environment
$app = require_once __DIR__ . '/longhai-backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Services\CloudinaryService;

echo "☁️ Cloudinary Upload Test\n";
echo "========================\n\n";

try {
    // Test CloudinaryService initialization
    echo "1. Testing CloudinaryService initialization...\n";
    $cloudinaryService = new CloudinaryService();
    
    if ($cloudinaryService->isConfigured()) {
        echo "✅ CloudinaryService initialized successfully\n";
    } else {
        echo "❌ CloudinaryService not configured\n";
        exit(1);
    }
    
    // Test upload from URL
    echo "\n2. Testing upload from URL...\n";
    $demoUrl = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';
    
    $result = $cloudinaryService->uploadFromUrl($demoUrl, 'longhai-test');
    
    if ($result['success']) {
        echo "✅ Upload from URL successful\n";
        echo "   URL: {$result['url']}\n";
        echo "   Public ID: {$result['public_id']}\n";
        echo "   Size: {$result['width']}x{$result['height']}\n";
        echo "   Format: {$result['format']}\n";
        echo "   Bytes: {$result['bytes']}\n";
        
        // Test optimized URLs
        echo "\n3. Testing optimized URLs...\n";
        $thumbnailUrl = $cloudinaryService->getOptimizedImageUrl($result['public_id'], 'thumbnail');
        $smallUrl = $cloudinaryService->getOptimizedImageUrl($result['public_id'], 'small');
        $mediumUrl = $cloudinaryService->getOptimizedImageUrl($result['public_id'], 'medium');
        $largeUrl = $cloudinaryService->getOptimizedImageUrl($result['public_id'], 'large');
        
        echo "✅ Thumbnail URL: $thumbnailUrl\n";
        echo "✅ Small URL: $smallUrl\n";
        echo "✅ Medium URL: $mediumUrl\n";
        echo "✅ Large URL: $largeUrl\n";
        
        // Test delete
        echo "\n4. Testing delete...\n";
        $deleteResult = $cloudinaryService->deleteImage($result['public_id']);
        
        if ($deleteResult['success']) {
            echo "✅ Delete successful\n";
        } else {
            echo "❌ Delete failed: {$deleteResult['error']}\n";
        }
        
    } else {
        echo "❌ Upload from URL failed: {$result['error']}\n";
    }
    
    echo "\n🎉 All tests completed!\n";
    
} catch (Exception $e) {
    echo "💥 Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
    exit(1);
} 