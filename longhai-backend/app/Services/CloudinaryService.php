<?php

namespace App\Services;

use Cloudinary\Cloudinary as CloudinarySDK;
use Cloudinary\Api\Upload\UploadApi;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;

class CloudinaryService
{
    protected $cloudinary;
    protected $uploadApi;
    protected $isConfigured = false;

    public function __construct()
    {
        $cloudName = config('cloudinary.cloud_name');
        $apiKey = config('cloudinary.api_key');
        $apiSecret = config('cloudinary.api_secret');
        
        if (!$cloudName || !$apiKey || !$apiSecret) {
            Log::warning('Cloudinary configuration missing. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file.');
            return;
        }
        
        try {
            $this->cloudinary = new CloudinarySDK([
                'cloud' => [
                    'cloud_name' => $cloudName,
                    'api_key' => $apiKey,
                    'api_secret' => $apiSecret,
                ],
            ]);
            
            $this->uploadApi = new UploadApi();
            $this->isConfigured = true;
        } catch (\Exception $e) {
            Log::error('Failed to initialize Cloudinary: ' . $e->getMessage());
        }
    }

    /**
     * Upload image to Cloudinary
     */
    public function uploadImage(UploadedFile $file, $folder = 'longhai-events', $options = [])
    {
        if (!$this->isConfigured) {
            return [
                'success' => false,
                'error' => 'Cloudinary is not configured. Please set up your Cloudinary credentials in .env file.'
            ];
        }

        try {
            $defaultOptions = [
                'folder' => $folder,
                'resource_type' => 'image',
                'transformation' => [
                    'width' => 800,
                    'height' => 600,
                    'crop' => 'fill',
                    'quality' => 'auto',
                    'fetch_format' => 'auto'
                ]
            ];

            $uploadOptions = array_merge($defaultOptions, $options);

            $result = $this->uploadApi->upload($file->getRealPath(), $uploadOptions);

            return [
                'success' => true,
                'public_id' => $result['public_id'],
                'url' => $result['secure_url'],
                'width' => $result['width'],
                'height' => $result['height'],
                'format' => $result['format'],
                'bytes' => $result['bytes']
            ];

        } catch (\Exception $e) {
            Log::error('Cloudinary upload failed: ' . $e->getMessage());
            
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Upload multiple images
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
     * Delete image from Cloudinary
     */
    public function deleteImage($publicId)
    {
        if (!$this->isConfigured) {
            return [
                'success' => false,
                'error' => 'Cloudinary is not configured. Please set up your Cloudinary credentials in .env file.'
            ];
        }

        try {
            $result = $this->uploadApi->destroy($publicId);
            
            return [
                'success' => true,
                'result' => $result
            ];

        } catch (\Exception $e) {
            Log::error('Cloudinary delete failed: ' . $e->getMessage());
            
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Get image URL with transformations
     */
    public function getImageUrl($publicId, $transformations = [])
    {
        if (!$this->isConfigured) {
            return null;
        }

        try {
            $defaultTransformations = [
                'width' => 800,
                'height' => 600,
                'crop' => 'fill',
                'quality' => 'auto'
            ];

            $finalTransformations = array_merge($defaultTransformations, $transformations);

            return $this->cloudinary->image($publicId)->toUrl($finalTransformations);

        } catch (\Exception $e) {
            Log::error('Cloudinary URL generation failed: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Upload from URL
     */
    public function uploadFromUrl($url, $folder = 'longhai-events', $options = [])
    {
        if (!$this->isConfigured) {
            return [
                'success' => false,
                'error' => 'Cloudinary is not configured. Please set up your Cloudinary credentials in .env file.'
            ];
        }

        try {
            $defaultOptions = [
                'folder' => $folder,
                'resource_type' => 'image',
                'transformation' => [
                    'width' => 800,
                    'height' => 600,
                    'crop' => 'fill',
                    'quality' => 'auto'
                ]
            ];

            $uploadOptions = array_merge($defaultOptions, $options);

            $result = $this->uploadApi->upload($url, $uploadOptions);

            return [
                'success' => true,
                'public_id' => $result['public_id'],
                'url' => $result['secure_url'],
                'width' => $result['width'],
                'height' => $result['height'],
                'format' => $result['format'],
                'bytes' => $result['bytes']
            ];

        } catch (\Exception $e) {
            Log::error('Cloudinary URL upload failed: ' . $e->getMessage());
            
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Get optimized image URL for different sizes
     */
    public function getOptimizedImageUrl($publicId, $size = 'medium')
    {
        $sizes = [
            'thumbnail' => ['width' => 150, 'height' => 150, 'crop' => 'fill'],
            'small' => ['width' => 300, 'height' => 200, 'crop' => 'fill'],
            'medium' => ['width' => 800, 'height' => 600, 'crop' => 'fill'],
            'large' => ['width' => 1200, 'height' => 800, 'crop' => 'fill'],
            'original' => []
        ];

        $transformations = $sizes[$size] ?? $sizes['medium'];

        return $this->getImageUrl($publicId, $transformations);
    }

    /**
     * Check if Cloudinary is configured
     */
    public function isConfigured()
    {
        return $this->isConfigured;
    }
} 