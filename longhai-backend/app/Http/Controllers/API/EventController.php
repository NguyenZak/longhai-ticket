<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class EventController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Check if slug parameter is provided
        if ($request->has('slug')) {
            return $this->getBySlug($request);
        }

        $events = Event::orderBy('start_date', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $events
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:events',
            'description' => 'required|string',
            'venue' => 'required|string|max:255',
            'location_detail' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'time' => 'nullable|date_format:H:i',
            'total_seats' => 'required|integer|min:1',
            'price' => 'required|numeric|min:0',
            'price_display' => 'nullable|string|max:255',
            'status' => 'required|in:preparing,active,ended',
            'display_status' => 'nullable|string|max:255',
            'image' => 'nullable|string|max:500',
            'map_image' => 'nullable|string|max:500',
            'artists' => 'nullable|array',
            'artists.*.name' => 'required|string|max:255',
            'artists.*.image' => 'nullable|string|max:500',
            'ticket_prices' => 'nullable|array',
            'ticket_prices.*.name' => 'required|string|max:255',
            'ticket_prices.*.price' => 'required|numeric|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->all();
        $data['available_seats'] = $data['total_seats'];
        
        // Chuẩn hóa start_date và end_date về 'Y-m-d H:i:s'
        if (!empty($data['start_date'])) {
            $start = $data['start_date'];
            if (strlen($start) === 16) { // 'YYYY-MM-DDTHH:mm'
                $start .= ':00';
            }
            $data['start_date'] = \Carbon\Carbon::parse($start)->format('Y-m-d H:i:s');
        }
        if (!empty($data['end_date'])) {
            $end = $data['end_date'];
            if (strlen($end) === 16) {
                $end .= ':00';
            }
            $data['end_date'] = \Carbon\Carbon::parse($end)->format('Y-m-d H:i:s');
        }
        
        // Format price to 2 decimal places
        if (isset($data['price'])) {
            $data['price'] = number_format((float)$data['price'], 2, '.', '');
        }
        
        // Format ticket prices to 2 decimal places
        if (isset($data['ticket_prices']) && is_array($data['ticket_prices'])) {
            foreach ($data['ticket_prices'] as &$ticket) {
                if (isset($ticket['price'])) {
                    $ticket['price'] = number_format((float)$ticket['price'], 2, '.', '');
                }
            }
        }
        
        // Generate slug if not provided
        if (empty($data['slug'])) {
            $data['slug'] = \Str::slug($data['title']);
            // Ensure unique slug
            $counter = 1;
            $originalSlug = $data['slug'];
            while (Event::where('slug', $data['slug'])->exists()) {
                $data['slug'] = $originalSlug . '-' . $counter;
                $counter++;
            }
        }
        
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
    public function show(string $id)
    {
        $event = Event::findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $event
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $event = Event::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:events,slug,' . $id,
            'description' => 'required|string',
            'venue' => 'required|string|max:255',
            'location_detail' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'time' => 'nullable|date_format:H:i',
            'total_seats' => 'required|integer|min:1',
            'price' => 'required|numeric|min:0',
            'price_display' => 'nullable|string|max:255',
            'status' => 'required|in:preparing,active,ended',
            'status_display' => 'nullable|string|max:255',
            'image' => 'nullable|string|max:255',
            'map_image' => 'nullable|string',
            'artists' => 'nullable|array',
            'artists.*.name' => 'required|string|max:255',
            'artists.*.image' => 'nullable|string',
            'ticket_prices' => 'nullable|array',
            'ticket_prices.*.name' => 'required|string|max:255',
            'ticket_prices.*.price' => 'required|numeric|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->all();
        
        if (isset($data['total_seats']) && $data['total_seats'] != $event->total_seats) {
            $bookedSeats = $event->bookings()->sum('quantity');
            $data['available_seats'] = $data['total_seats'] - $bookedSeats;
        }
        
        // Chuẩn hóa start_date và end_date về 'Y-m-d H:i:s' trong update
        if (!empty($data['start_date'])) {
            $start = $data['start_date'];
            if (strlen($start) === 16) {
                $start .= ':00';
            }
            $data['start_date'] = \Carbon\Carbon::parse($start)->format('Y-m-d H:i:s');
        }
        if (!empty($data['end_date'])) {
            $end = $data['end_date'];
            if (strlen($end) === 16) {
                $end .= ':00';
            }
            $data['end_date'] = \Carbon\Carbon::parse($end)->format('Y-m-d H:i:s');
        }
        
        // Format price to 2 decimal places
        if (isset($data['price'])) {
            $data['price'] = number_format((float)$data['price'], 2, '.', '');
        }
        
        // Format ticket prices to 2 decimal places
        if (isset($data['ticket_prices']) && is_array($data['ticket_prices'])) {
            foreach ($data['ticket_prices'] as &$ticket) {
                if (isset($ticket['price'])) {
                    $ticket['price'] = number_format((float)$ticket['price'], 2, '.', '');
                }
            }
        }
        
        // Generate slug if not provided
        if (empty($data['slug'])) {
            $data['slug'] = \Str::slug($data['title']);
            // Ensure unique slug
            $counter = 1;
            $originalSlug = $data['slug'];
            while (Event::where('slug', $data['slug'])->where('id', '!=', $id)->exists()) {
                $data['slug'] = $originalSlug . '-' . $counter;
                $counter++;
            }
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
    public function destroy(string $id)
    {
        $event = Event::findOrFail($id);
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
     * Get event statuses
     */
    public function getStatuses()
    {
        return response()->json([
            'success' => true,
            'data' => Event::getStatuses()
        ]);
    }

    /**
     * Get event by slug
     */
    public function getBySlug(Request $request)
    {
        $slug = $request->query('slug');
        
        if (!$slug) {
            return response()->json([
                'success' => false,
                'message' => 'Slug parameter is required'
            ], 400);
        }

        $event = Event::where('slug', $slug)->first();

        if (!$event) {
            return response()->json([
                'success' => false,
                'message' => 'Event not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $event
        ]);
    }
}
