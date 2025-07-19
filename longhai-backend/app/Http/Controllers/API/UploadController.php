<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    /**
     * Upload event image
     */
    public function uploadEventImage(Request $request)
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
            $fileName = 'event_' . time() . '_' . Str::random(10) . '.' . $file->getClientOriginalExtension();
            
            // Store in public/events directory
            $path = $file->storeAs('public/events', $fileName);
            $url = Storage::url($path);
            $fullUrl = url($url); // URL đầy đủ

            return response()->json([
                'success' => true,
                'message' => 'Image uploaded successfully',
                'data' => [
                    'url' => $fullUrl,
                    'filename' => $fileName,
                    'path' => $path
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
     * Upload artist image
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
            $fileName = 'artist_' . time() . '_' . Str::random(10) . '.' . $file->getClientOriginalExtension();
            
            // Store in public/artists directory
            $path = $file->storeAs('public/artists', $fileName);
            $url = Storage::url($path);
            $fullUrl = url($url); // URL đầy đủ

            return response()->json([
                'success' => true,
                'message' => 'Artist image uploaded successfully',
                'data' => [
                    'url' => $fullUrl,
                    'filename' => $fileName,
                    'path' => $path
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
     * Delete uploaded image
     */
    public function deleteImage(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'path' => 'required|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $path = $request->path;
            
            // Remove 'public/' prefix if present
            if (Str::startsWith($path, 'public/')) {
                $path = Str::after($path, 'public/');
            }

            if (Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
                
                return response()->json([
                    'success' => true,
                    'message' => 'Image deleted successfully'
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Image not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting image: ' . $e->getMessage()
            ], 500);
        }
    }
}
