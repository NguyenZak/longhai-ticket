<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Event;
use App\Models\User;
use App\Commands\CreateBookingCommand;
use App\Queries\GetUserBookingsQuery;
use App\Handlers\CreateBookingHandler;
use App\Events\SeatBookedEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class BookingController extends Controller
{
    protected $createBookingHandler;

    public function __construct(CreateBookingHandler $createBookingHandler)
    {
        $this->createBookingHandler = $createBookingHandler;
    }

    /**
     * Lấy danh sách bookings
     */
    public function index(Request $request)
    {
        try {
            $query = Booking::with(['user', 'event']);

            // Apply filters
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            if ($request->has('event_id')) {
                $query->where('event_id', $request->event_id);
            }

            if ($request->has('user_id')) {
                $query->where('user_id', $request->user_id);
            }

            if ($request->has('date_from')) {
                $query->where('created_at', '>=', $request->date_from);
            }

            if ($request->has('date_to')) {
                $query->where('created_at', '<=', $request->date_to);
            }

            $bookings = $query->latest()->paginate(20);

            return response()->json([
                'success' => true,
                'message' => 'Bookings retrieved successfully',
                'data' => $bookings->items(),
                'pagination' => [
                    'current_page' => $bookings->currentPage(),
                    'last_page' => $bookings->lastPage(),
                    'per_page' => $bookings->perPage(),
                    'total' => $bookings->total(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving bookings: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Tạo booking mới với CQRS
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'event_id' => 'required|exists:events,id',
                'quantity' => 'required|integer|min:1',
                'seats' => 'required|array|min:1',
                'seats.*' => 'exists:seats,id',
                'total_price' => 'required|numeric|min:0',
                'notes' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Create command
            $command = new CreateBookingCommand(
                userId: $request->user()->id,
                eventId: $request->event_id,
                quantity: $request->quantity,
                seats: $request->seats,
                totalPrice: $request->total_price,
                notes: $request->notes
            );

            // Handle command
            $booking = $this->createBookingHandler->handle($command);

            // Broadcast events for real-time updates
            foreach ($request->seats as $seatId) {
                event(new SeatBookedEvent(
                    eventId: $request->event_id,
                    seatId: $seatId,
                    userId: $request->user()->id,
                    bookingId: $booking->id
                ));
            }

            // Log booking creation for analytics
            \Log::info('Booking created', [
                'booking_id' => $booking->id,
                'user_id' => $request->user()->id,
                'event_id' => $request->event_id,
                'quantity' => $request->quantity,
                'total_price' => $request->total_price,
                'seats' => $request->seats,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Booking created successfully',
                'data' => $booking->load(['user', 'event'])
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creating booking: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy chi tiết booking
     */
    public function show($id)
    {
        try {
            $booking = Booking::with(['user', 'event', 'seats'])->findOrFail($id);

            return response()->json([
                'success' => true,
                'message' => 'Booking retrieved successfully',
                'data' => $booking
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving booking: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cập nhật booking
     */
    public function update(Request $request, $id)
    {
        try {
            $booking = Booking::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'status' => 'sometimes|in:pending,confirmed,cancelled',
                'notes' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $booking->update($request->only(['status', 'notes']));

            return response()->json([
                'success' => true,
                'message' => 'Booking updated successfully',
                'data' => $booking->load(['user', 'event'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating booking: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Xóa booking
     */
    public function destroy($id)
    {
        try {
            $booking = Booking::findOrFail($id);
            $booking->delete();

            return response()->json([
                'success' => true,
                'message' => 'Booking deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting booking: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Xác nhận booking
     */
    public function confirmBooking($id)
    {
        try {
            $booking = Booking::findOrFail($id);
            $booking->update(['status' => 'confirmed']);

            return response()->json([
                'success' => true,
                'message' => 'Booking confirmed successfully',
                'data' => $booking->load(['user', 'event'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error confirming booking: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Hủy booking
     */
    public function cancelBooking($id)
    {
        try {
            $booking = Booking::findOrFail($id);
            $booking->update(['status' => 'cancelled']);

            // Release seats
            $booking->seats()->update([
                'status' => 'available',
                'booking_id' => null,
                'booked_at' => null
            ]);

            // Update event available seats
            $event = $booking->event;
            $event->increment('available_seats', $booking->quantity);

            return response()->json([
                'success' => true,
                'message' => 'Booking cancelled successfully',
                'data' => $booking->load(['user', 'event'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error cancelling booking: ' . $e->getMessage()
            ], 500);
        }
    }
}
