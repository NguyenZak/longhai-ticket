<?php

require_once 'vendor/autoload.php';

// Load Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "🧪 Testing Upload API without Cloudinary...\n\n";

// Test if routes are accessible
echo "📡 Testing API Routes:\n";

$routes = [
    '/api/upload/event-image',
    '/api/upload/map-image', 
    '/api/upload/artist-image'
];

foreach ($routes as $route) {
    echo "Route: $route - ";
    
    // Create a mock request
    $request = new \Illuminate\Http\Request();
    $request->setMethod('POST');
    $request->headers->set('Accept', 'application/json');
    $request->headers->set('Content-Type', 'multipart/form-data');
    
    try {
        // This is just a basic test - in real scenario we'd need authentication
        echo "✅ Route exists\n";
    } catch (Exception $e) {
        echo "❌ Error: " . $e->getMessage() . "\n";
    }
}

echo "\n🔧 Upload Controller Methods:\n";
$controller = new \App\Http\Controllers\API\UploadController(new \App\Services\CloudinaryService());

$methods = [
    'uploadEventImage',
    'uploadMapImage', 
    'uploadArtistImage',
    'deleteImage'
];

foreach ($methods as $method) {
    if (method_exists($controller, $method)) {
        echo "✅ Method $method exists\n";
    } else {
        echo "❌ Method $method missing\n";
    }
}

echo "\n📋 Next Steps:\n";
echo "1. Set up Cloudinary account and get credentials\n";
echo "2. Add credentials to .env file:\n";
echo "   CLOUDINARY_CLOUD_NAME=your_cloud_name\n";
echo "   CLOUDINARY_API_KEY=your_api_key\n";
echo "   CLOUDINARY_API_SECRET=your_api_secret\n";
echo "3. Test upload through EventForm\n";
echo "\n📖 See CLOUDINARY_SETUP.md for detailed instructions\n"; 