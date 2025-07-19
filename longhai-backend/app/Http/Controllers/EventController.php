<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class EventController extends Controller
{
    /**
     * Get available statuses
     */
    public function getStatuses()
    {
        return response()->json([
            'success' => true,
            'data' => Event::getStatuses()
        ]);
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $events = Event::orderBy('created_at', 'desc')->get();
        
        return response()->json([
            'success' => true,
            'data' => $events
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'venue' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'total_seats' => 'required|integer|min:1',
            'price' => 'required|numeric|min:0',
            'status' => 'required|in:preparing,active,ended',
            'image' => 'nullable|string',
            'display_status' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->all();
        $data['available_seats'] = $data['total_seats']; // Initially, all seats are available
        
        $event = Event::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Event created successfully',
            'data' => $event
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Event $event)
    {
        return response()->json([
            'success' => true,
            'data' => $event
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Event $event)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'venue' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'total_seats' => 'required|integer|min:1',
            'price' => 'required|numeric|min:0',
            'status' => 'required|in:preparing,active,ended',
            'image' => 'nullable|string',
            'display_status' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->all();
        
        // If total_seats changed, recalculate available_seats
        if (isset($data['total_seats']) && $data['total_seats'] != $event->total_seats) {
            $bookedSeats = $event->bookings()->sum('quantity');
            $data['available_seats'] = $data['total_seats'] - $bookedSeats;
        }
        
        $event->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Event updated successfully',
            'data' => $event
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Event $event)
    {
        $event->delete();

        return response()->json([
            'success' => true,
            'message' => 'Event deleted successfully'
        ]);
    }

    /**
     * Bulk delete events
     */
    public function bulkDelete(Request $request)
    {
        $ids = $request->input('ids', []);
        if (!is_array($ids) || empty($ids)) {
            return response()->json([
                'success' => false,
                'message' => 'Vui lòng truyền danh sách id sự kiện cần xoá.'
            ], 422);
        }
        $deleted = Event::whereIn('id', $ids)->delete();
        return response()->json([
            'success' => true,
            'message' => "Đã xoá $deleted sự kiện thành công!"
        ]);
    }

    /**
     * Upload image for event
     */
    public function uploadImage(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $file = $request->file('image');
            $filename = time() . '_' . $file->getClientOriginalName();
            
            // Store in public/images/events directory
            $path = $file->storeAs('public/images/events', $filename);
            
            // Return the URL
            $url = Storage::url($path);

            return response()->json([
                'success' => true,
                'message' => 'Tải ảnh lên thành công',
                'data' => [
                    'url' => $url,
                    'filename' => $filename
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Tải ảnh lên thất bại',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 