<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Event;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BookingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $bookings = Booking::with(['event', 'ticket', 'user'])->orderBy('created_at', 'desc')->get();
        
        return response()->json([
            'success' => true,
            'data' => $bookings
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
            'event_id' => 'required|exists:events,id',
            'ticket_id' => 'required|exists:tickets,id',
            'user_id' => 'required|exists:users,id',
            'quantity' => 'required|integer|min:1',
            'total_amount' => 'required|numeric|min:0',
            'status' => 'required|in:pending,confirmed,cancelled,completed',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check if ticket has enough available quantity
        $ticket = Ticket::find($request->ticket_id);
        if ($ticket->available_quantity < $request->quantity) {
            return response()->json([
                'success' => false,
                'message' => 'Không đủ vé khả dụng cho số lượng yêu cầu'
            ], 422);
        }

        $booking = Booking::create($request->all());

        // Update ticket available quantity
        $ticket->available_quantity -= $request->quantity;
        $ticket->save();

        return response()->json([
            'success' => true,
            'message' => 'Booking created successfully',
            'data' => $booking->load(['event', 'ticket', 'user'])
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $booking = Booking::with(['event', 'ticket', 'user'])->findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $booking
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
        $booking = Booking::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'event_id' => 'required|exists:events,id',
            'ticket_id' => 'required|exists:tickets,id',
            'user_id' => 'required|exists:users,id',
            'quantity' => 'required|integer|min:1',
            'total_amount' => 'required|numeric|min:0',
            'status' => 'required|in:pending,confirmed,cancelled,completed',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Handle quantity changes
        if ($request->quantity != $booking->quantity) {
            $ticket = Ticket::find($request->ticket_id);
            $quantityDiff = $request->quantity - $booking->quantity;
            
            if ($quantityDiff > 0 && $ticket->available_quantity < $quantityDiff) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không đủ vé khả dụng cho số lượng yêu cầu'
                ], 422);
            }
            
            $ticket->available_quantity -= $quantityDiff;
            $ticket->save();
        }

        $booking->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Booking updated successfully',
            'data' => $booking->load(['event', 'ticket', 'user'])
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $booking = Booking::findOrFail($id);
        
        // Restore ticket quantity
        $ticket = $booking->ticket;
        if ($ticket) {
            $ticket->available_quantity += $booking->quantity;
            $ticket->save();
        }
        
        $booking->delete();

        return response()->json([
            'success' => true,
            'message' => 'Booking deleted successfully'
        ]);
    }

    /**
     * Bulk delete bookings
     */
    public function bulkDelete(Request $request)
    {
        $ids = $request->input('ids', []);
        if (!is_array($ids) || empty($ids)) {
            return response()->json([
                'success' => false,
                'message' => 'Vui lòng truyền danh sách id đặt vé cần xoá.'
            ], 422);
        }
        
        $bookings = Booking::whereIn('id', $ids)->get();
        
        // Restore ticket quantities
        foreach ($bookings as $booking) {
            $ticket = $booking->ticket;
            if ($ticket) {
                $ticket->available_quantity += $booking->quantity;
                $ticket->save();
            }
        }
        
        $deleted = Booking::whereIn('id', $ids)->delete();
        
        return response()->json([
            'success' => true,
            'message' => "Đã xoá $deleted đặt vé thành công!"
        ]);
    }
}
