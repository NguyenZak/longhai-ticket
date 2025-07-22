<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Note;
use Illuminate\Support\Facades\Validator;

class NoteController extends Controller
{
    // Lấy danh sách note (có thể filter theo user_id nếu cần)
    public function index(Request $request)
    {
        $query = Note::query();
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }
        $notes = $query->orderByDesc('created_at')->get();
        return response()->json(['success' => true, 'data' => $notes]);
    }

    // Tạo mới note
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'tag' => 'nullable|string|max:255',
            'is_fav' => 'boolean',
            'user_id' => 'nullable|integer',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }
        $note = Note::create($request->all());
        return response()->json(['success' => true, 'data' => $note], 201);
    }

    // Xem chi tiết note
    public function show($id)
    {
        $note = Note::findOrFail($id);
        return response()->json(['success' => true, 'data' => $note]);
    }

    // Cập nhật note
    public function update(Request $request, $id)
    {
        $note = Note::findOrFail($id);
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'tag' => 'nullable|string|max:255',
            'is_fav' => 'boolean',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }
        $note->update($request->all());
        return response()->json(['success' => true, 'data' => $note]);
    }

    // Xoá note
    public function destroy($id)
    {
        $note = Note::findOrFail($id);
        $note->delete();
        return response()->json(['success' => true, 'message' => 'Đã xoá note']);
    }

    // Toggle favorite
    public function toggleFav($id)
    {
        $note = Note::findOrFail($id);
        $note->is_fav = !$note->is_fav;
        $note->save();
        return response()->json(['success' => true, 'data' => $note]);
    }
} 