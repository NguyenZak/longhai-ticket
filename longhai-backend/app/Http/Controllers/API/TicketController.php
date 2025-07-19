<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TicketController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $tickets = Ticket::with('event')->orderBy('created_at', 'desc')->get();
        
        return response()->json([
            'success' => true,
            'data' => $tickets
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
            'name' => 'required|string|max:255',
            'price' => 'nullable|numeric|min:0',
            'prices' => 'nullable|array',
            'prices.*' => 'numeric|min:0',
            'quantity' => 'nullable|integer|min:1',
            'quantities' => 'nullable|array',
            'quantities.*' => 'integer|min:1',
            'status' => 'required|in:active,inactive,sold_out,preparing',
            'description' => 'nullable|string',
            'color' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Handle both old and new structure
        $ticketData = [
            'event_id' => $request->event_id,
            'name' => $request->name,
            'status' => $request->status,
            'description' => $request->description,
            'color' => $request->color
        ];

        // Handle prices
        if ($request->has('prices') && is_array($request->prices)) {
            $ticketData['prices'] = $request->prices;
        } elseif ($request->has('price')) {
            $ticketData['prices'] = [$request->price];
        }

        // Handle quantities
        if ($request->has('quantities') && is_array($request->quantities)) {
            $ticketData['quantities'] = $request->quantities;
        } elseif ($request->has('quantity')) {
            $ticketData['quantities'] = [$request->quantity];
        }

        $ticket = Ticket::create($ticketData);

        return response()->json([
            'success' => true,
            'message' => 'Ticket created successfully',
            'data' => $ticket->load('event')
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $ticket = Ticket::with('event')->findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $ticket
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
        $ticket = Ticket::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'event_id' => 'required|exists:events,id',
            'name' => 'required|string|max:255',
            'price' => 'nullable|numeric|min:0',
            'prices' => 'nullable|array',
            'prices.*' => 'numeric|min:0',
            'quantity' => 'nullable|integer|min:1',
            'quantities' => 'nullable|array',
            'quantities.*' => 'integer|min:1',
            'status' => 'required|in:active,inactive,sold_out,preparing',
            'description' => 'nullable|string',
            'color' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Handle both old and new structure
        $ticketData = [
            'event_id' => $request->event_id,
            'name' => $request->name,
            'status' => $request->status,
            'description' => $request->description,
            'color' => $request->color
        ];

        // Handle prices
        if ($request->has('prices') && is_array($request->prices)) {
            $ticketData['prices'] = $request->prices;
        } elseif ($request->has('price')) {
            $ticketData['prices'] = [$request->price];
        }

        // Handle quantities
        if ($request->has('quantities') && is_array($request->quantities)) {
            $ticketData['quantities'] = $request->quantities;
        } elseif ($request->has('quantity')) {
            $ticketData['quantities'] = [$request->quantity];
        }

        $ticket->update($ticketData);

        return response()->json([
            'success' => true,
            'message' => 'Ticket updated successfully',
            'data' => $ticket->load('event')
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $ticket = Ticket::findOrFail($id);
        $ticket->delete();

        return response()->json([
            'success' => true,
            'message' => 'Ticket deleted successfully'
        ]);
    }

    /**
     * Bulk delete tickets
     */
    public function bulkDelete(Request $request)
    {
        $ids = $request->input('ids', []);
        if (!is_array($ids) || empty($ids)) {
            return response()->json([
                'success' => false,
                'message' => 'Vui lòng truyền danh sách id vé cần xoá.'
            ], 422);
        }
        
        $deleted = Ticket::whereIn('id', $ids)->delete();
        
        return response()->json([
            'success' => true,
            'message' => "Đã xoá $deleted vé thành công!"
        ]);
    }

    /**
     * Get ticket types for seating system
     */
    public function getTicketTypes()
    {
        $tickets = Ticket::select('id', 'name', 'prices', 'color')
            ->where('status', 'active')
            ->get()
            ->map(function ($ticket) {
                return [
                    'id' => $ticket->id,
                    'name' => $ticket->name,
                    'price' => is_array($ticket->prices) ? $ticket->prices[0] : $ticket->prices,
                    'color' => $ticket->color ?: '#4CAF50'
                ];
            });

        return response()->json([
            'success' => true,
            'types' => $tickets
        ]);
    }
}
