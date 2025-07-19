<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BannerController extends Controller
{
    /**
     * Lấy danh sách banner cho trang chủ
     */
    public function index()
    {
        try {
            $banners = Banner::active()->ordered()->get();

            return response()->json([
                'success' => true,
                'message' => 'Banners retrieved successfully',
                'data' => $banners
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving banners: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy tất cả banner (cho admin)
     */
    public function all()
    {
        try {
            $banners = Banner::ordered()->get();

            return response()->json([
                'success' => true,
                'message' => 'All banners retrieved successfully',
                'data' => $banners
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving banners: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Tạo banner mới
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'title' => 'nullable|string|max:255',
                'description' => 'nullable|string',
                'image' => 'required|string',
                'mobile_image' => 'nullable|string',
                'link_url' => 'nullable|url',
                'button_text' => 'nullable|string|max:100',
                'sort_order' => 'integer|min:0',
                'is_active' => 'boolean',
                'start_date' => 'nullable|date',
                'end_date' => 'nullable|date|after:start_date',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $banner = Banner::create($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Banner created successfully',
                'data' => $banner
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creating banner: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cập nhật banner
     */
    public function update(Request $request, $id)
    {
        try {
            $banner = Banner::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'title' => 'nullable|string|max:255',
                'description' => 'nullable|string',
                'image' => 'nullable|string',
                'mobile_image' => 'nullable|string',
                'link_url' => 'nullable|url',
                'button_text' => 'nullable|string|max:100',
                'sort_order' => 'integer|min:0',
                'is_active' => 'boolean',
                'start_date' => 'nullable|date',
                'end_date' => 'nullable|date|after:start_date',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $banner->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Banner updated successfully',
                'data' => $banner
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating banner: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Xóa banner
     */
    public function destroy($id)
    {
        try {
            $banner = Banner::findOrFail($id);
            $banner->delete();

            return response()->json([
                'success' => true,
                'message' => 'Banner deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting banner: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Upload banner image
     */
    public function uploadImage(Request $request)
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
            
            // Upload using Cloudinary service
            $cloudinaryService = app(\App\Services\CloudinaryService::class);
            $result = $cloudinaryService->uploadImage($file, 'longhai-banners', [
                'transformation' => [
                    'width' => 1920,
                    'height' => 800,
                    'crop' => 'fill',
                    'quality' => 'auto',
                    'fetch_format' => 'auto'
                ]
            ]);

            if (!$result['success']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error uploading: ' . $result['error']
                ], 500);
            }

            return response()->json([
                'success' => true,
                'message' => 'Banner image uploaded successfully',
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
                'message' => 'Error uploading banner image: ' . $e->getMessage()
            ], 500);
        }
    }
} 