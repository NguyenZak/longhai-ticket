<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    /**
     * Get user notifications
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $perPage = $request->get('per_page', 15);
        
        $notifications = Notification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $notifications
        ]);
    }

    /**
     * Get unread notifications count
     */
    public function getUnreadCount()
    {
        $user = Auth::user();
        $count = Notification::where('user_id', $user->id)
            ->where('read_at', null)
            ->count();

        return response()->json([
            'success' => true,
            'data' => ['count' => $count]
        ]);
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(Request $request)
    {
        $user = Auth::user();
        $notificationId = $request->input('notification_id');

        if ($notificationId) {
            // Mark specific notification as read
            $notification = Notification::where('id', $notificationId)
                ->where('user_id', $user->id)
                ->first();

            if ($notification) {
                $notification->update(['read_at' => now()]);
            }
        } else {
            // Mark all notifications as read
            Notification::where('user_id', $user->id)
                ->where('read_at', null)
                ->update(['read_at' => now()]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Notification marked as read'
        ]);
    }

    /**
     * Delete notification
     */
    public function destroy($id)
    {
        $user = Auth::user();
        $notification = Notification::where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$notification) {
            return response()->json([
                'success' => false,
                'message' => 'Notification not found'
            ], 404);
        }

        $notification->delete();

        return response()->json([
            'success' => true,
            'message' => 'Notification deleted successfully'
        ]);
    }

    /**
     * Clear all notifications
     */
    public function clearAll()
    {
        $user = Auth::user();
        Notification::where('user_id', $user->id)->delete();

        return response()->json([
            'success' => true,
            'message' => 'All notifications cleared'
        ]);
    }

    /**
     * Get notification settings
     */
    public function getSettings()
    {
        $user = Auth::user();
        $settings = $user->notification_settings ?? [
            'email_notifications' => true,
            'push_notifications' => true,
            'booking_notifications' => true,
            'event_notifications' => true,
            'system_notifications' => true
        ];

        return response()->json([
            'success' => true,
            'data' => $settings
        ]);
    }

    /**
     * Update notification settings
     */
    public function updateSettings(Request $request)
    {
        $user = Auth::user();
        
        $validated = $request->validate([
            'email_notifications' => 'boolean',
            'push_notifications' => 'boolean',
            'booking_notifications' => 'boolean',
            'event_notifications' => 'boolean',
            'system_notifications' => 'boolean'
        ]);

        $user->update(['notification_settings' => $validated]);

        return response()->json([
            'success' => true,
            'message' => 'Notification settings updated',
            'data' => $validated
        ]);
    }
} 