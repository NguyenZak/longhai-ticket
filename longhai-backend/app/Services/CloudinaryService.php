<?php

namespace App\Services;

use Cloudinary\Cloudinary as CloudinarySDK;
use Cloudinary\Api\Upload\UploadApi;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;

class CloudinaryService
{
    protected $cloudinary = null;
    protected $uploadApi = null;
    protected $isConfigured = false;

    public function __construct()
    {
        $cloudName = env('CLOUDINARY_CLOUD_NAME');
        $apiKey = env('CLOUDINARY_KEY');
        $apiSecret = env('CLOUDINARY_SECRET');
        
        if (!$cloudName || !$apiKey || !$apiSecret) {
            Log::error('Cloudinary configuration missing. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_KEY, and CLOUDINARY_SECRET in your .env file.');
            throw new \Exception('Cloudinary is not configured. Please check your .env file.');
        }
        
        try {
            $this->cloudinary = new CloudinarySDK([
                'cloud' => [
                    'cloud_name' => $cloudName,
                    'api_key' => $apiKey,
                    'api_secret' => $apiSecret,
                ],
            ]);
            
            $this->uploadApi = $this->cloudinary->uploadApi();
            $this->isConfigured = true;
            Log::info('Cloudinary initialized successfully with cloud_name: ' . $cloudName);
        } catch (\Exception $e) {
            Log::error('Failed to initialize Cloudinary: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Check if Cloudinary is configured
     */
    public function isConfigured()
    {
        return $this->isConfigured;
    }

    /**
     * Upload image to Cloudinary
     */
    public function uploadImage(UploadedFile $file, $folder = 'longhai-events', $options = [])
    {
        if (!$this->isConfigured) {
            throw new \Exception('Cloudinary is not configured. Please set up your Cloudinary credentials in .env file.');
        }

        try {
            $defaultOptions = [
                'folder' => $folder,
                'resource_type' => 'image'
            ];

            // Chỉ thêm transformation nếu có trong options
            if (!empty($options)) {
                $defaultOptions = array_merge($defaultOptions, $options);
            }

            $result = $this->uploadApi->upload($file->getRealPath(), $defaultOptions);

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
            throw new \Exception('Cloudinary is not configured. Please set up your Cloudinary credentials in .env file.');
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
        if (!$this->isConfigured || !$this->cloudinary) {
            throw new \Exception('Cloudinary is not configured.');
        }

        try {
            if (empty($transformations)) {
                return $this->cloudinary->image($publicId)->toUrl();
            }

            // Convert array to transformation string
            $transformationString = '';
            if (isset($transformations['width'])) {
                $transformationString .= 'w_' . $transformations['width'] . ',';
            }
            if (isset($transformations['height'])) {
                $transformationString .= 'h_' . $transformations['height'] . ',';
            }
            if (isset($transformations['crop'])) {
                $transformationString .= 'c_' . $transformations['crop'] . ',';
            }
            if (isset($transformations['quality'])) {
                $transformationString .= 'q_' . $transformations['quality'] . ',';
            }

            // Remove trailing comma
            $transformationString = rtrim($transformationString, ',');

            return $this->cloudinary->image($publicId)->toUrl($transformationString);

        } catch (\Exception $e) {
            Log::error('Cloudinary URL generation failed: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Upload from URL
     */
    public function uploadFromUrl($url, $folder = 'longhai-events', $options = [])
    {
        if (!$this->isConfigured) {
            throw new \Exception('Cloudinary is not configured. Please set up your Cloudinary credentials in .env file.');
        }

        try {
            $defaultOptions = [
                'folder' => $folder,
                'resource_type' => 'image'
            ];

            // Chỉ thêm transformation nếu có trong options
            if (!empty($options)) {
                $defaultOptions = array_merge($defaultOptions, $options);
            }

            $result = $this->uploadApi->upload($url, $defaultOptions);

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
} 