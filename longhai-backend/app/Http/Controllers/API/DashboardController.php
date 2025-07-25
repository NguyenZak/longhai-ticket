<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Booking;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics
     */
    public function getStats()
    {
        $today = now()->startOfDay();
        $monthStart = now()->startOfMonth();

        $ticketsSoldToday = \App\Models\Booking::where('status', 'paid')
            ->whereDate('created_at', $today)
            ->count();

        $revenueToday = \App\Models\Booking::where('status', 'paid')
            ->whereDate('created_at', $today)
            ->sum('total_amount');

        $newCustomersToday = \App\Models\User::whereDate('created_at', $today)->count();

        $revenueMonth = \App\Models\Booking::where('status', 'paid')
            ->where('created_at', '>=', $monthStart)
            ->sum('total_amount');

        // Nếu có bảng log truy cập website, ví dụ: visits
        $visitsToday = class_exists('App\\Models\\Visit') ? \App\Models\Visit::whereDate('created_at', $today)->count() : null;
        $visitsMonth = class_exists('App\\Models\\Visit') ? \App\Models\Visit::where('created_at', '>=', $monthStart)->count() : null;

        $stats = [
            'tickets_sold_today' => $ticketsSoldToday,
            'revenue_today' => $revenueToday,
            'new_customers_today' => $newCustomersToday,
            'revenue_month' => $revenueMonth,
            'visits_today' => $visitsToday,
            'visits_month' => $visitsMonth,
            // Các số liệu tổng quan khác
            'total_events' => Event::count(),
            'total_bookings' => Booking::count(),
            'total_tickets' => Ticket::count(),
            'total_users' => User::count(),
            'revenue' => Booking::where('status', 'paid')->sum('total_amount'),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Get recent activities
     */
    public function getRecentActivities()
    {
        $activities = [];

        // Recent bookings
        $recentBookings = Booking::with(['user:id,name', 'event:id,title'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        foreach ($recentBookings as $booking) {
            $activities[] = [
                'type' => 'booking',
                'title' => 'Đặt vé mới',
                'description' => "{$booking->user->name} đã đặt vé cho {$booking->event->title}",
                'time' => $booking->created_at->diffForHumans(),
                'data' => $booking
            ];
        }

        // Recent events
        $recentEvents = Event::orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        foreach ($recentEvents as $event) {
            $activities[] = [
                'type' => 'event',
                'title' => 'Sự kiện mới',
                'description' => "Sự kiện {$event->title} đã được tạo",
                'time' => $event->created_at->diffForHumans(),
                'data' => $event
            ];
        }

        // Sort by time
        usort($activities, function ($a, $b) {
            return strtotime($b['data']->created_at) - strtotime($a['data']->created_at);
        });

        return response()->json([
            'success' => true,
            'data' => array_slice($activities, 0, 15)
        ]);
    }

    /**
     * Get revenue chart data
     */
    public function getRevenueChart()
    {
        $revenueData = Booking::where('status', 'paid')
            ->where('created_at', '>=', now()->subMonths(6))
            ->selectRaw('DATE(created_at) as date, SUM(total_amount) as revenue')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $revenueData
        ]);
    }

    /**
     * Get booking chart data
     */
    public function getBookingChart()
    {
        $bookingData = Booking::where('created_at', '>=', now()->subMonths(6))
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $bookingData
        ]);
    }

    /**
     * Get top events
     */
    public function getTopEvents()
    {
        $topEvents = Event::withCount('bookings')
            ->orderBy('bookings_count', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $topEvents
        ]);
    }

    /**
     * Get upcoming events
     */
    public function getUpcomingEvents()
    {
        $upcomingEvents = Event::where('start_date', '>', now())
            ->orderBy('start_date')
            ->limit(5)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $upcomingEvents
        ]);
    }

    /**
     * Get user growth chart
     */
    public function getUserGrowthChart()
    {
        $userGrowth = User::where('created_at', '>=', now()->subMonths(6))
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $userGrowth
        ]);
    }

    /**
     * Get event statistics by month
     */
    public function getEventStats()
    {
        $eventStats = Event::where('created_at', '>=', now()->subMonths(6))
            ->selectRaw('MONTH(created_at) as month, COUNT(*) as count')
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $eventStats
        ]);
    }
}
