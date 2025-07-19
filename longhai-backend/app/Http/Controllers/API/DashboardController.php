<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Booking;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Lấy thống kê tổng quan cho dashboard
     */
    public function statistics()
    {
        try {
            // Thống kê tổng quan
            $totalEvents = Event::count();
            $totalBookings = Booking::count();
            $totalTickets = Ticket::count();
            $totalUsers = User::count();
            
            // Thống kê doanh thu
            $totalRevenue = Booking::where('status', 'confirmed')
                ->sum('total_amount');
            
            // Thống kê theo tháng (6 tháng gần nhất)
            $monthlyStats = Booking::selectRaw('
                DATE_FORMAT(created_at, "%Y-%m") as month,
                COUNT(*) as total_bookings,
                SUM(total_amount) as revenue
            ')
            ->where('created_at', '>=', now()->subMonths(6))
            ->groupBy('month')
            ->orderBy('month')
            ->get();
            
            // Sự kiện sắp diễn ra (7 ngày tới)
            $upcomingEvents = Event::where('start_date', '>=', now())
                ->where('start_date', '<=', now()->addDays(7))
                ->where('status', 'active')
                ->orderBy('start_date')
                ->limit(5)
                ->get();
                
            // Đặt vé gần đây
            $recentBookings = Booking::with(['user', 'event'])
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get();
                
            // Top sự kiện được đặt nhiều nhất
            $topEvents = Event::withCount('bookings')
                ->orderBy('bookings_count', 'desc')
                ->limit(5)
                ->get();
                
            // Thống kê trạng thái đặt vé
            $bookingStatusStats = Booking::selectRaw('
                status,
                COUNT(*) as count
            ')
            ->groupBy('status')
            ->get();
            
            // Thống kê trạng thái sự kiện
            $eventStatusStats = Event::selectRaw('
                status,
                COUNT(*) as count
            ')
            ->groupBy('status')
            ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'overview' => [
                        'total_events' => $totalEvents,
                        'total_bookings' => $totalBookings,
                        'total_tickets' => $totalTickets,
                        'total_users' => $totalUsers,
                        'total_revenue' => $totalRevenue,
                    ],
                    'monthly_stats' => $monthlyStats,
                    'upcoming_events' => $upcomingEvents,
                    'recent_bookings' => $recentBookings,
                    'top_events' => $topEvents,
                    'booking_status_stats' => $bookingStatusStats,
                    'event_status_stats' => $eventStatusStats,
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi lấy thống kê',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Lấy biểu đồ doanh thu theo thời gian
     */
    public function revenueChart(Request $request)
    {
        $period = $request->get('period', 'month'); // month, week, year
        
        try {
            $query = Booking::where('status', 'confirmed');
            
            switch ($period) {
                case 'week':
                    $data = $query->selectRaw('
                        DATE(created_at) as date,
                        SUM(total_amount) as revenue,
                        COUNT(*) as bookings
                    ')
                    ->where('created_at', '>=', now()->subWeeks(4))
                    ->groupBy('date')
                    ->orderBy('date')
                    ->get();
                    break;
                    
                case 'year':
                    $data = $query->selectRaw('
                        DATE_FORMAT(created_at, "%Y-%m") as month,
                        SUM(total_amount) as revenue,
                        COUNT(*) as bookings
                    ')
                    ->where('created_at', '>=', now()->subYear())
                    ->groupBy('month')
                    ->orderBy('month')
                    ->get();
                    break;
                    
                default: // month
                    $data = $query->selectRaw('
                        DATE_FORMAT(created_at, "%Y-%m-%d") as date,
                        SUM(total_amount) as revenue,
                        COUNT(*) as bookings
                    ')
                    ->where('created_at', '>=', now()->subMonth())
                    ->groupBy('date')
                    ->orderBy('date')
                    ->get();
                    break;
            }
            
            return response()->json([
                'success' => true,
                'data' => $data
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi lấy dữ liệu biểu đồ',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
