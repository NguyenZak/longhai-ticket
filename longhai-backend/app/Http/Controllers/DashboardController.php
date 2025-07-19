<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Booking;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics
     */
    public function index()
    {
        $totalEvents = Event::count();
        $activeEvents = Event::where('status', 'active')->count();
        $totalBookings = Booking::count();
        $totalRevenue = Booking::sum('total_amount');
        $totalUsers = User::count();
        $totalTickets = Ticket::count();

        return response()->json([
            'success' => true,
            'data' => [
                'total_events' => $totalEvents,
                'active_events' => $activeEvents,
                'total_bookings' => $totalBookings,
                'total_revenue' => $totalRevenue,
                'total_users' => $totalUsers,
                'total_tickets' => $totalTickets
            ]
        ]);
    }
}
