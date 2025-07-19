<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;

class MockUploadService
{
    /**
     * Mock upload that returns a placeholder URL
     */
    public function uploadImage(UploadedFile $file, $folder = 'longhai-events', $options = [])
    {
        $fileName = $file->getClientOriginalName();
        $fileSize = $file->getSize();
        
        Log::info("Mock upload: {$fileName} ({$fileSize} bytes) to folder: {$folder}");
        
        // Return a placeholder URL
        $placeholderUrl = "https://via.placeholder.com/800x600/cccccc/666666?text=Upload+Disabled";
        
        return [
            'success' => true,
            'public_id' => "mock_{$folder}_" . time(),
            'url' => $placeholderUrl,
            'width' => 800,
            'height' => 600,
            'format' => 'png',
            'bytes' => $fileSize,
            'mock' => true,
            'message' => 'This is a mock upload. Please configure Cloudinary to enable real uploads.'
        ];
    }

    /**
     * Mock delete
     */
    public function deleteImage($publicId)
    {
        Log::info("Mock delete: {$publicId}");
        
        return [
            'success' => true,
            'result' => 'Mock delete successful',
            'mock' => true
        ];
    }

    /**
     * Mock multiple uploads
     */
    public function uploadMultipleImages(array $files, $folder = 'longhai-events', $options = [])
    {
        $results = [];
        
        foreach ($files as $file) {
            $results[] = $this->uploadImage($file, $folder, $options);
        }
        
        return $results;
    }

    /**
     * Mock URL generation
     */
    public function getImageUrl($publicId, $transformations = [])
    {
        return "https://via.placeholder.com/800x600/cccccc/666666?text=Mock+Image";
    }

    /**
     * Mock optimized URL
     */
    public function getOptimizedImageUrl($publicId, $size = 'medium')
    {
        $sizes = [
            'thumbnail' => '150x150',
            'small' => '300x200',
            'medium' => '800x600',
            'large' => '1200x800',
            'original' => '800x600'
        ];

        $dimensions = $sizes[$size] ?? '800x600';
        return "https://via.placeholder.com/{$dimensions}/cccccc/666666?text=Mock+{$size}";
    }

    /**
     * Check if service is configured (always true for mock)
     */
    public function isConfigured()
    {
        return true;
    }
} 