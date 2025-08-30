<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Seat;
use App\Models\Event;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class SeatingController extends Controller
{
    /**
     * Get seats for an event by ID or slug
     */
    public function getSeats(string $eventId): JsonResponse
    {
        try {
            // Check if event exists by ID or slug
            $event = Event::where('id', $eventId)
                         ->orWhere('slug', $eventId)
                         ->first();
            if (!$event) {
                return response()->json([
                    'success' => false,
                    'message' => 'Sự kiện không tồn tại'
                ], 404);
            }

            // Get seats for the event
            $seats = Seat::where('event_id', $event->id)
                ->orderBy('row')
                ->orderBy('column')
                ->get();

            // Transform seats to frontend format
            $transformedSeats = $seats->map(function ($seat) {
                return [
                    'id' => $seat->id,
                    'row' => $seat->row,
                    'column' => $seat->column,
                    'x' => $seat->x,
                    'y' => $seat->y,
                    'width' => $seat->width,
                    'height' => $seat->height,
                    'status' => $seat->status,
                    'price' => $seat->price,
                    'category' => $seat->category,
                    'color' => $seat->color,
                    'ticketType' => $seat->ticket_type,
                    'seatName' => $seat->seat_name,
                    'rowName' => $seat->row_name,
                    'created_at' => $seat->created_at,
                    'updated_at' => $seat->updated_at
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'event' => [
                        'id' => $event->id,
                        'name' => $event->title,
                        'date' => $event->start_date,
                        'venue' => $event->venue
                    ],
                    'seats' => $transformedSeats,
                    'total_seats' => $seats->count(),
                    'available_seats' => $seats->where('status', 'available')->count(),
                    'occupied_seats' => $seats->where('status', 'occupied')->count(),
                    'reserved_seats' => $seats->where('status', 'reserved')->count(),
                    'disabled_seats' => $seats->where('status', 'disabled')->count()
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy dữ liệu ghế: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Save or update seats for an event
     */
    public function saveSeats(Request $request, string $eventId): JsonResponse
    {
        try {
            // Validate request
            $validator = Validator::make($request->all(), [
                'seats' => 'required|array',
                'seats.*.row' => 'required|integer|min:1',
                'seats.*.column' => 'required|integer|min:1',
                'seats.*.x' => 'required|numeric',
                'seats.*.y' => 'required|numeric',
                'seats.*.width' => 'required|numeric|min:1',
                'seats.*.height' => 'required|numeric|min:1',
                'seats.*.status' => 'required|in:available,occupied,reserved,disabled',
                'seats.*.price' => 'nullable|numeric|min:0',
                'seats.*.category' => 'nullable|string|max:100',
                'seats.*.color' => 'nullable|string|max:7',
                'seats.*.ticketType' => 'nullable|string|max:50',
                'seats.*.seatName' => 'nullable|string|max:50',
                'seats.*.rowName' => 'nullable|string|max:100'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dữ liệu không hợp lệ',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Check if event exists
            $event = Event::find($eventId);
            if (!$event) {
                return response()->json([
                    'success' => false,
                    'message' => 'Sự kiện không tồn tại'
                ], 404);
            }

            DB::beginTransaction();

            try {
                // Delete existing seats for this event
                Seat::where('event_id', $eventId)->delete();

                // Create new seats
                $seats = [];
                foreach ($request->seats as $seatData) {
                    $seats[] = [
                        'event_id' => $eventId,
                        'row' => $seatData['row'],
                        'column' => $seatData['column'],
                        'x' => $seatData['x'],
                        'y' => $seatData['y'],
                        'width' => $seatData['width'],
                        'height' => $seatData['height'],
                        'status' => $seatData['status'],
                        'price' => $seatData['price'] ?? null,
                        'category' => $seatData['category'] ?? null,
                        'color' => $seatData['color'] ?? '#4CAF50',
                        'ticket_type' => $seatData['ticketType'] ?? null,
                        'seat_name' => $seatData['seatName'] ?? null,
                        'row_name' => $seatData['rowName'] ?? null,
                        'created_at' => now(),
                        'updated_at' => now()
                    ];
                }

                // Bulk insert seats
                if (!empty($seats)) {
                    Seat::insert($seats);
                }

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => 'Đã lưu sơ đồ ghế thành công',
                    'data' => [
                        'total_seats' => count($seats),
                        'event_id' => $eventId
                    ]
                ]);

            } catch (\Exception $e) {
                DB::rollback();
                throw $e;
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lưu sơ đồ ghế: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a single seat
     */
    public function updateSeat(Request $request, string $eventId, string $seatId): JsonResponse
    {
        try {
            // Validate request
            $validator = Validator::make($request->all(), [
                'row' => 'sometimes|integer|min:1',
                'column' => 'sometimes|integer|min:1',
                'x' => 'sometimes|numeric',
                'y' => 'sometimes|numeric',
                'width' => 'sometimes|numeric|min:1',
                'height' => 'sometimes|numeric|min:1',
                'status' => 'sometimes|in:available,occupied,reserved,disabled',
                'price' => 'nullable|numeric|min:0',
                'category' => 'nullable|string|max:100',
                'color' => 'nullable|string|max:7',
                'ticketType' => 'nullable|string|max:50',
                'seatName' => 'nullable|string|max:50',
                'rowName' => 'nullable|string|max:100'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dữ liệu không hợp lệ',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Find the seat
            $seat = Seat::where('event_id', $eventId)
                ->where('id', $seatId)
                ->first();

            if (!$seat) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ghế không tồn tại'
                ], 404);
            }

            // Update seat
            $updateData = [];
            $allowedFields = [
                'row', 'column', 'x', 'y', 'width', 'height', 'status',
                'price', 'category', 'color'
            ];

            foreach ($allowedFields as $field) {
                if ($request->has($field)) {
                    $updateData[$field] = $request->input($field);
                }
            }

            // Handle special fields
            if ($request->has('ticketType')) {
                $updateData['ticket_type'] = $request->input('ticketType');
            }
            if ($request->has('seatName')) {
                $updateData['seat_name'] = $request->input('seatName');
            }
            if ($request->has('rowName')) {
                $updateData['row_name'] = $request->input('rowName');
            }

            $seat->update($updateData);

            return response()->json([
                'success' => true,
                'message' => 'Đã cập nhật ghế thành công',
                'data' => [
                    'id' => $seat->id,
                    'row' => $seat->row,
                    'column' => $seat->column,
                    'x' => $seat->x,
                    'y' => $seat->y,
                    'width' => $seat->width,
                    'height' => $seat->height,
                    'status' => $seat->status,
                    'price' => $seat->price,
                    'category' => $seat->category,
                    'color' => $seat->color,
                    'ticketType' => $seat->ticket_type,
                    'seatName' => $seat->seat_name,
                    'rowName' => $seat->row_name
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi cập nhật ghế: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a seat
     */
    public function deleteSeat(string $eventId, string $seatId): JsonResponse
    {
        try {
            $seat = Seat::where('event_id', $eventId)
                ->where('id', $seatId)
                ->first();

            if (!$seat) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ghế không tồn tại'
                ], 404);
            }

            $seat->delete();

            return response()->json([
                'success' => true,
                'message' => 'Đã xóa ghế thành công'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi xóa ghế: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get seat statistics for an event
     */
    public function getSeatStats(string $eventId): JsonResponse
    {
        try {
            $event = Event::find($eventId);
            if (!$event) {
                return response()->json([
                    'success' => false,
                    'message' => 'Sự kiện không tồn tại'
                ], 404);
            }

            $stats = Seat::where('event_id', $eventId)
                ->selectRaw('
                    COUNT(*) as total_seats,
                    SUM(CASE WHEN status = "available" THEN 1 ELSE 0 END) as available_seats,
                    SUM(CASE WHEN status = "occupied" THEN 1 ELSE 0 END) as occupied_seats,
                    SUM(CASE WHEN status = "reserved" THEN 1 ELSE 0 END) as reserved_seats,
                    SUM(CASE WHEN status = "disabled" THEN 1 ELSE 0 END) as disabled_seats,
                    AVG(price) as average_price,
                    MIN(price) as min_price,
                    MAX(price) as max_price
                ')
                ->first();

            // Get ticket type distribution
            $ticketTypeStats = Seat::where('event_id', $eventId)
                ->whereNotNull('ticket_type')
                ->selectRaw('ticket_type, COUNT(*) as count, AVG(price) as avg_price')
                ->groupBy('ticket_type')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'event' => [
                        'id' => $event->id,
                        'name' => $event->title
                    ],
                    'statistics' => $stats,
                    'ticket_types' => $ticketTypeStats
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy thống kê: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get available ticket types for an event
     */
    public function getTicketTypes(string $eventId): JsonResponse
    {
        try {
            $event = Event::find($eventId);
            if (!$event) {
                return response()->json([
                    'success' => false,
                    'message' => 'Sự kiện không tồn tại'
                ], 404);
            }

            // Get unique ticket types from seats
            $ticketTypes = Seat::where('event_id', $eventId)
                ->whereNotNull('ticket_type')
                ->selectRaw('
                    ticket_type as id,
                    category as name,
                    AVG(price) as price,
                    color
                ')
                ->groupBy('ticket_type', 'category', 'color')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'event' => [
                        'id' => $event->id,
                        'name' => $event->title
                    ],
                    'ticket_types' => $ticketTypes
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy loại vé: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export seats to JSON
     */
    public function exportSeats(string $eventId): JsonResponse
    {
        try {
            $event = Event::find($eventId);
            if (!$event) {
                return response()->json([
                    'success' => false,
                    'message' => 'Sự kiện không tồn tại'
                ], 404);
            }

            $seats = Seat::where('event_id', $eventId)
                ->orderBy('row')
                ->orderBy('column')
                ->get();

            $exportData = [
                'event' => [
                    'id' => $event->id,
                    'name' => $event->title,
                    'date' => $event->start_date,
                    'venue' => $event->venue
                ],
                'exported_at' => now()->toISOString(),
                'total_seats' => $seats->count(),
                'seats' => $seats->map(function ($seat) {
                    return [
                        'id' => $seat->id,
                        'row' => $seat->row,
                        'column' => $seat->column,
                        'x' => $seat->x,
                        'y' => $seat->y,
                        'width' => $seat->width,
                        'height' => $seat->height,
                        'status' => $seat->status,
                        'price' => $seat->price,
                        'category' => $seat->category,
                        'color' => $seat->color,
                        'ticketType' => $seat->ticket_type,
                        'seatName' => $seat->seat_name,
                        'rowName' => $seat->row_name
                    ];
                })
            ];

            return response()->json([
                'success' => true,
                'data' => $exportData
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi xuất dữ liệu: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lock seats for selection (temporary reservation)
     */
    public function lockSeats(Request $request, string $eventId): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'seat_ids' => 'required|array|min:1|max:10',
                'seat_ids.*' => 'required|exists:seats,id',
                'session_id' => 'required|string|max:255',
                'lock_duration' => 'nullable|integer|min:60|max:1800' // 1-30 minutes
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dữ liệu không hợp lệ',
                    'errors' => $validator->errors()
                ], 422);
            }

            $lockDuration = $request->input('lock_duration', 300); // Default 5 minutes
            $sessionId = $request->input('session_id');

            // Check if seats are available
            $seats = Seat::whereIn('id', $request->seat_ids)
                ->where('event_id', $eventId)
                ->get();

            if ($seats->count() !== count($request->seat_ids)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Một số ghế không tồn tại'
                ], 404);
            }

            $unavailableSeats = $seats->where('status', '!=', 'available');
            if ($unavailableSeats->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Một số ghế đã được đặt hoặc đang được chọn',
                    'unavailable_seats' => $unavailableSeats->pluck('id')->toArray()
                ], 409);
            }

            // Lock seats
            Seat::whereIn('id', $request->seat_ids)->update([
                'status' => 'reserved',
                'locked_by' => $sessionId,
                'locked_at' => now(),
                'lock_expires_at' => now()->addSeconds($lockDuration)
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Đã khóa ghế thành công',
                'data' => [
                    'locked_seats' => $request->seat_ids,
                    'lock_expires_at' => now()->addSeconds($lockDuration)->toISOString(),
                    'lock_duration' => $lockDuration
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi khóa ghế: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Unlock seats
     */
    public function unlockSeats(Request $request, string $eventId): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'seat_ids' => 'required|array|min:1',
                'seat_ids.*' => 'required|exists:seats,id',
                'session_id' => 'required|string|max:255'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dữ liệu không hợp lệ',
                    'errors' => $validator->errors()
                ], 422);
            }

            $sessionId = $request->input('session_id');

            // Unlock seats (only if locked by the same session)
            $unlockedCount = Seat::whereIn('id', $request->seat_ids)
                ->where('event_id', $eventId)
                ->where('locked_by', $sessionId)
                ->where('status', 'reserved')
                ->update([
                    'status' => 'available',
                    'locked_by' => null,
                    'locked_at' => null,
                    'lock_expires_at' => null
                ]);

            return response()->json([
                'success' => true,
                'message' => "Đã mở khóa {$unlockedCount} ghế",
                'data' => [
                    'unlocked_count' => $unlockedCount
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi mở khóa ghế: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Clean up expired locks (should be called by a scheduled job)
     */
    public function cleanupExpiredLocks(): JsonResponse
    {
        try {
            $expiredLocks = Seat::where('status', 'reserved')
                ->where('lock_expires_at', '<', now())
                ->update([
                    'status' => 'available',
                    'locked_by' => null,
                    'locked_at' => null,
                    'lock_expires_at' => null
                ]);

            return response()->json([
                'success' => true,
                'message' => "Đã dọn dẹp {$expiredLocks} khóa hết hạn",
                'data' => [
                    'cleaned_count' => $expiredLocks
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi dọn dẹp khóa: ' . $e->getMessage()
            ], 500);
        }
    }
} 