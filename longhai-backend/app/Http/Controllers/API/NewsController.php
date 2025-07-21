<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\News;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class NewsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $query = News::with(['creator', 'updater']);

            // Filter by status
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            // Filter by category
            if ($request->has('category')) {
                $query->where('category', $request->category);
            }

            // Filter by featured
            if ($request->has('featured')) {
                $query->where('featured', $request->boolean('featured'));
            }

            // Search
            if ($request->has('search')) {
                $query->search($request->search);
            }

            // Only published news for public API
            if ($request->has('public') && $request->boolean('public')) {
                $query->published();
            }

            // Sort
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Pagination
            $perPage = $request->get('per_page', 10);
            $news = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $news,
                'message' => 'Tin tức được tải thành công'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:255',
                'slug' => 'nullable|string|max:255|unique:news,slug',
                'excerpt' => 'required|string|max:500',
                'content' => 'required|string',
                'image' => 'nullable|string',
                'author' => 'required|string|max:255',
                'category' => 'required|string|max:255',
                'tags' => 'nullable|array',
                'tags.*' => 'string|max:100',
                'read_time' => 'nullable|integer|min:1|max:60',
                'featured' => 'nullable|boolean',
                'published_at' => 'nullable|date',
                'status' => 'nullable|in:draft,published,archived',
                'meta_title' => 'nullable|string|max:255',
                'meta_description' => 'nullable|string|max:500',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dữ liệu không hợp lệ',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $validator->validated();
            $data['created_by'] = Auth::id();
            $data['updated_by'] = Auth::id();

            // Auto-generate slug if not provided
            if (empty($data['slug'])) {
                $data['slug'] = Str::slug($data['title']);
            }

            // Set default values
            $data['read_time'] = $data['read_time'] ?? 5;
            $data['featured'] = $data['featured'] ?? false;
            $data['status'] = $data['status'] ?? 'draft';

            $news = News::create($data);

            return response()->json([
                'success' => true,
                'data' => $news->load(['creator', 'updater']),
                'message' => 'Tin tức được tạo thành công'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        try {
            $news = News::with(['creator', 'updater'])->find($id);

            if (!$news) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy tin tức'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $news,
                'message' => 'Tin tức được tải thành công'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource by slug.
     */
    public function showBySlug($slug)
    {
        try {
            $news = News::with(['creator', 'updater'])
                       ->where('slug', $slug)
                       ->published()
                       ->first();

            if (!$news) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy tin tức'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $news,
                'message' => 'Tin tức được tải thành công'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        try {
            $news = News::find($id);

            if (!$news) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy tin tức'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'title' => 'sometimes|required|string|max:255',
                'slug' => 'nullable|string|max:255|unique:news,slug,' . $id,
                'excerpt' => 'sometimes|required|string|max:500',
                'content' => 'sometimes|required|string',
                'image' => 'nullable|string',
                'author' => 'sometimes|required|string|max:255',
                'category' => 'sometimes|required|string|max:255',
                'tags' => 'nullable|array',
                'tags.*' => 'string|max:100',
                'read_time' => 'nullable|integer|min:1|max:60',
                'featured' => 'nullable|boolean',
                'published_at' => 'nullable|date',
                'status' => 'nullable|in:draft,published,archived',
                'meta_title' => 'nullable|string|max:255',
                'meta_description' => 'nullable|string|max:500',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dữ liệu không hợp lệ',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $validator->validated();
            $data['updated_by'] = Auth::id();

            $news->update($data);

            return response()->json([
                'success' => true,
                'data' => $news->load(['creator', 'updater']),
                'message' => 'Tin tức được cập nhật thành công'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        try {
            $news = News::find($id);

            if (!$news) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy tin tức'
                ], 404);
            }

            $news->delete();

            return response()->json([
                'success' => true,
                'message' => 'Tin tức đã được xóa thành công'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle featured status
     */
    public function toggleFeatured($id)
    {
        try {
            $news = News::find($id);

            if (!$news) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy tin tức'
                ], 404);
            }

            $news->toggleFeatured();

            return response()->json([
                'success' => true,
                'data' => $news->load(['creator', 'updater']),
                'message' => 'Trạng thái nổi bật đã được cập nhật'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Publish news
     */
    public function publish($id)
    {
        try {
            $news = News::find($id);

            if (!$news) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy tin tức'
                ], 404);
            }

            $news->publish();

            return response()->json([
                'success' => true,
                'data' => $news->load(['creator', 'updater']),
                'message' => 'Tin tức đã được xuất bản'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Archive news
     */
    public function archive($id)
    {
        try {
            $news = News::find($id);

            if (!$news) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy tin tức'
                ], 404);
            }

            $news->archive();

            return response()->json([
                'success' => true,
                'data' => $news->load(['creator', 'updater']),
                'message' => 'Tin tức đã được lưu trữ'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Duplicate news
     */
    public function duplicate($id)
    {
        try {
            $news = News::find($id);

            if (!$news) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy tin tức'
                ], 404);
            }

            $duplicatedNews = $news->duplicate();

            return response()->json([
                'success' => true,
                'data' => $duplicatedNews->load(['creator', 'updater']),
                'message' => 'Tin tức đã được sao chép thành công'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get categories
     */
    public function categories()
    {
        try {
            $categories = News::select('category')
                             ->distinct()
                             ->whereNotNull('category')
                             ->pluck('category');

            return response()->json([
                'success' => true,
                'data' => $categories,
                'message' => 'Danh sách danh mục được tải thành công'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get featured news for homepage
     */
    public function featured()
    {
        try {
            $news = News::with(['creator'])
                       ->published()
                       ->featured()
                       ->orderBy('published_at', 'desc')
                       ->limit(3)
                       ->get();

            return response()->json([
                'success' => true,
                'data' => $news,
                'message' => 'Tin tức nổi bật được tải thành công'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage()
            ], 500);
        }
    }
} 