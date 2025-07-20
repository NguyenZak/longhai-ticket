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

class ReportController extends Controller
{
    /**
     * Get booking report
     */
    public function getBookingReport(Request $request)
    {
        $startDate = $request->get('start_date', now()->subMonth());
        $endDate = $request->get('end_date', now());
        $status = $request->get('status');

        $query = Booking::whereBetween('created_at', [$startDate, $endDate]);

        if ($status) {
            $query->where('status', $status);
        }

        $bookings = $query->with(['user:id,name,email', 'event:id,title'])
            ->orderBy('created_at', 'desc')
            ->get();

        $summary = [
            'total_bookings' => $bookings->count(),
            'total_revenue' => $bookings->where('status', 'paid')->sum('total_amount'),
            'pending_bookings' => $bookings->where('status', 'pending')->count(),
            'confirmed_bookings' => $bookings->where('status', 'confirmed')->count(),
            'cancelled_bookings' => $bookings->where('status', 'cancelled')->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'bookings' => $bookings,
                'summary' => $summary
            ]
        ]);
    }

    /**
     * Get event report
     */
    public function getEventReport(Request $request)
    {
        $startDate = $request->get('start_date', now()->subYear());
        $endDate = $request->get('end_date', now());

        $events = Event::whereBetween('start_date', [$startDate, $endDate])
            ->withCount('bookings')
            ->withSum('bookings', 'total_amount')
            ->orderBy('start_date', 'desc')
            ->get();

        $summary = [
            'total_events' => $events->count(),
            'total_bookings' => $events->sum('bookings_count'),
            'total_revenue' => $events->sum('bookings_sum_total_amount'),
            'average_bookings_per_event' => $events->avg('bookings_count'),
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'events' => $events,
                'summary' => $summary
            ]
        ]);
    }

    /**
     * Get user report
     */
    public function getUserReport(Request $request)
    {
        $startDate = $request->get('start_date', now()->subYear());
        $endDate = $request->get('end_date', now());

        $users = User::whereBetween('created_at', [$startDate, $endDate])
            ->withCount('bookings')
            ->withSum('bookings', 'total_amount')
            ->orderBy('created_at', 'desc')
            ->get();

        $summary = [
            'total_users' => $users->count(),
            'active_users' => $users->where('last_seen_at', '>=', now()->subDays(30))->count(),
            'total_bookings' => $users->sum('bookings_count'),
            'total_revenue' => $users->sum('bookings_sum_total_amount'),
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'users' => $users,
                'summary' => $summary
            ]
        ]);
    }

    /**
     * Get revenue report
     */
    public function getRevenueReport(Request $request)
    {
        $startDate = $request->get('start_date', now()->subYear());
        $endDate = $request->get('end_date', now());
        $groupBy = $request->get('group_by', 'month'); // day, week, month, year

        $query = Booking::where('status', 'paid')
            ->whereBetween('created_at', [$startDate, $endDate]);

        switch ($groupBy) {
            case 'day':
                $revenue = $query->selectRaw('
                    DATE(created_at) as period,
                    SUM(total_amount) as revenue,
                    COUNT(*) as bookings
                ')
                ->groupBy('period')
                ->orderBy('period')
                ->get();
                break;

            case 'week':
                $revenue = $query->selectRaw('
                    YEARWEEK(created_at) as period,
                    SUM(total_amount) as revenue,
                    COUNT(*) as bookings
                ')
                ->groupBy('period')
                ->orderBy('period')
                ->get();
                break;

            case 'year':
                $revenue = $query->selectRaw('
                    YEAR(created_at) as period,
                    SUM(total_amount) as revenue,
                    COUNT(*) as bookings
                ')
                ->groupBy('period')
                ->orderBy('period')
                ->get();
                break;

            default: // month
                $revenue = $query->selectRaw('
                    DATE_FORMAT(created_at, "%Y-%m") as period,
                    SUM(total_amount) as revenue,
                    COUNT(*) as bookings
                ')
                ->groupBy('period')
                ->orderBy('period')
                ->get();
                break;
        }

        $summary = [
            'total_revenue' => $revenue->sum('revenue'),
            'total_bookings' => $revenue->sum('bookings'),
            'average_revenue' => $revenue->avg('revenue'),
            'peak_period' => $revenue->sortByDesc('revenue')->first(),
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'revenue' => $revenue,
                'summary' => $summary
            ]
        ]);
    }

    /**
     * Get ticket report
     */
    public function getTicketReport(Request $request)
    {
        $startDate = $request->get('start_date', now()->subYear());
        $endDate = $request->get('end_date', now());

        $tickets = Ticket::whereBetween('created_at', [$startDate, $endDate])
            ->with(['event:id,title'])
            ->orderBy('created_at', 'desc')
            ->get();

        $summary = [
            'total_tickets' => $tickets->count(),
            'total_value' => $tickets->sum('price'),
            'average_price' => $tickets->avg('price'),
            'sold_tickets' => $tickets->where('status', 'sold')->count(),
            'available_tickets' => $tickets->where('status', 'available')->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'tickets' => $tickets,
                'summary' => $summary
            ]
        ]);
    }

    /**
     * Export report to CSV
     */
    public function exportReport(Request $request)
    {
        $type = $request->get('type', 'booking'); // booking, event, user, revenue
        $startDate = $request->get('start_date', now()->subMonth());
        $endDate = $request->get('end_date', now());

        switch ($type) {
            case 'booking':
                $data = Booking::whereBetween('created_at', [$startDate, $endDate])
                    ->with(['user:id,name,email', 'event:id,title'])
                    ->get();
                break;

            case 'event':
                $data = Event::whereBetween('start_date', [$startDate, $endDate])
                    ->withCount('bookings')
                    ->get();
                break;

            case 'user':
                $data = User::whereBetween('created_at', [$startDate, $endDate])
                    ->withCount('bookings')
                    ->get();
                break;

            default:
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid report type'
                ], 400);
        }

        // Generate CSV content
        $csvContent = $this->generateCsv($data, $type);

        return response()->json([
            'success' => true,
            'data' => [
                'csv_content' => $csvContent,
                'filename' => "{$type}_report_" . date('Y-m-d') . ".csv"
            ]
        ]);
    }

    /**
     * Generate CSV content
     */
    private function generateCsv($data, $type)
    {
        $headers = [];
        $rows = [];

        switch ($type) {
            case 'booking':
                $headers = ['ID', 'User', 'Event', 'Amount', 'Status', 'Date'];
                foreach ($data as $item) {
                    $rows[] = [
                        $item->id,
                        $item->user->name ?? 'N/A',
                        $item->event->title ?? 'N/A',
                        $item->total_amount,
                        $item->status,
                        $item->created_at->format('Y-m-d H:i:s')
                    ];
                }
                break;

            case 'event':
                $headers = ['ID', 'Title', 'Start Date', 'End Date', 'Bookings', 'Status'];
                foreach ($data as $item) {
                    $rows[] = [
                        $item->id,
                        $item->title,
                        $item->start_date,
                        $item->end_date,
                        $item->bookings_count,
                        $item->status
                    ];
                }
                break;

            case 'user':
                $headers = ['ID', 'Name', 'Email', 'Role', 'Bookings', 'Created Date'];
                foreach ($data as $item) {
                    $rows[] = [
                        $item->id,
                        $item->name,
                        $item->email,
                        $item->role,
                        $item->bookings_count,
                        $item->created_at->format('Y-m-d H:i:s')
                    ];
                }
                break;
        }

        // Create CSV content
        $csv = implode(',', $headers) . "\n";
        foreach ($rows as $row) {
            $csv .= implode(',', array_map(function($field) {
                return '"' . str_replace('"', '""', $field) . '"';
            }, $row)) . "\n";
        }

        return $csv;
    }
} 