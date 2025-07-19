<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\CloudinaryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class UploadController extends Controller
{
    protected $cloudinaryService;

    public function __construct(CloudinaryService $cloudinaryService)
    {
        $this->cloudinaryService = $cloudinaryService;
    }

    /**
     * Upload event image to Cloudinary
     */
    public function uploadEventImage(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120', // 5MB max
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $file = $request->file('image');
            
            // Upload to Cloudinary
            $result = $this->cloudinaryService->uploadImage($file, 'longhai-events', [
                'transformation' => [
                    'width' => 1200,
                    'height' => 800,
                    'crop' => 'fill',
                    'quality' => 'auto',
                    'fetch_format' => 'auto'
                ]
            ]);

            if (!$result['success']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error uploading to Cloudinary: ' . $result['error']
                ], 500);
            }

            return response()->json([
                'success' => true,
                'message' => 'Image uploaded successfully to Cloudinary',
                'data' => [
                    'url' => $result['url'],
                    'public_id' => $result['public_id'],
                    'width' => $result['width'],
                    'height' => $result['height'],
                    'format' => $result['format'],
                    'bytes' => $result['bytes'],
                    'thumbnail_url' => $this->cloudinaryService->getOptimizedImageUrl($result['public_id'], 'thumbnail'),
                    'small_url' => $this->cloudinaryService->getOptimizedImageUrl($result['public_id'], 'small'),
                    'medium_url' => $this->cloudinaryService->getOptimizedImageUrl($result['public_id'], 'medium'),
                    'large_url' => $this->cloudinaryService->getOptimizedImageUrl($result['public_id'], 'large')
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error uploading image: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Upload artist image to Cloudinary
     */
    public function uploadArtistImage(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $file = $request->file('image');
            
            // Upload to Cloudinary
            $result = $this->cloudinaryService->uploadImage($file, 'longhai-artists', [
                'transformation' => [
                    'width' => 400,
                    'height' => 400,
                    'crop' => 'fill',
                    'quality' => 'auto',
                    'fetch_format' => 'auto'
                ]
            ]);

            if (!$result['success']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error uploading to Cloudinary: ' . $result['error']
                ], 500);
            }

            return response()->json([
                'success' => true,
                'message' => 'Artist image uploaded successfully to Cloudinary',
                'data' => [
                    'url' => $result['url'],
                    'public_id' => $result['public_id'],
                    'width' => $result['width'],
                    'height' => $result['height'],
                    'format' => $result['format'],
                    'bytes' => $result['bytes'],
                    'thumbnail_url' => $this->cloudinaryService->getOptimizedImageUrl($result['public_id'], 'thumbnail'),
                    'small_url' => $this->cloudinaryService->getOptimizedImageUrl($result['public_id'], 'small')
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error uploading artist image: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Upload map image to Cloudinary
     */
    public function uploadMapImage(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $file = $request->file('image');
            
            // Upload to Cloudinary
            $result = $this->cloudinaryService->uploadImage($file, 'longhai-maps', [
                'transformation' => [
                    'width' => 800,
                    'height' => 600,
                    'crop' => 'fill',
                    'quality' => 'auto',
                    'fetch_format' => 'auto'
                ]
            ]);

            if (!$result['success']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error uploading to Cloudinary: ' . $result['error']
                ], 500);
            }

            return response()->json([
                'success' => true,
                'message' => 'Map image uploaded successfully to Cloudinary',
                'data' => [
                    'url' => $result['url'],
                    'public_id' => $result['public_id'],
                    'width' => $result['width'],
                    'height' => $result['height'],
                    'format' => $result['format'],
                    'bytes' => $result['bytes']
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error uploading map image: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete image from Cloudinary
     */
    public function deleteImage(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'public_id' => 'required|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $publicId = $request->public_id;
            
            $result = $this->cloudinaryService->deleteImage($publicId);

            if (!$result['success']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error deleting from Cloudinary: ' . $result['error']
                ], 500);
            }

            return response()->json([
                'success' => true,
                'message' => 'Image deleted successfully from Cloudinary'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting image: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Upload multiple images to Cloudinary
     */
    public function uploadMultipleImages(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'images.*' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
                'folder' => 'string|in:longhai-events,longhai-artists,longhai-maps'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $files = $request->file('images');
            $folder = $request->input('folder', 'longhai-events');
            
            $results = $this->cloudinaryService->uploadMultipleImages($files, $folder);

            $successCount = count(array_filter($results, fn($r) => $r['success']));
            $failedCount = count($results) - $successCount;

            return response()->json([
                'success' => true,
                'message' => "Uploaded {$successCount} images successfully" . ($failedCount > 0 ? ", {$failedCount} failed" : ''),
                'data' => [
                    'results' => $results,
                    'total' => count($results),
                    'success_count' => $successCount,
                    'failed_count' => $failedCount
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error uploading multiple images: ' . $e->getMessage()
            ], 500);
        }
    }
}
