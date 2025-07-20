<?php

namespace App\Http\Controllers;

use App\Models\ChatMessage;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ChatController extends Controller
{
    /**
     * Get chat messages between current user and another user
     */
    public function getMessages(Request $request)
    {
        $request->validate([
            'user_id' => 'required|integer|exists:users,id'
        ]);

        $currentUserId = Auth::id();
        $otherUserId = $request->user_id;

        $messages = ChatMessage::where(function ($query) use ($currentUserId, $otherUserId) {
            $query->where('from_user_id', $currentUserId)
                  ->where('to_user_id', $otherUserId);
        })->orWhere(function ($query) use ($currentUserId, $otherUserId) {
            $query->where('from_user_id', $otherUserId)
                  ->where('to_user_id', $currentUserId);
        })
        ->with(['fromUser:id,name,avatar', 'toUser:id,name,avatar'])
        ->orderBy('created_at', 'asc')
        ->get();

        return response()->json([
            'success' => true,
            'data' => $messages
        ]);
    }

    /**
     * Send a message
     */
    public function sendMessage(Request $request)
    {
        $request->validate([
            'to_user_id' => 'required|integer|exists:users,id',
            'message' => 'required|string|max:1000',
            'type' => 'string|in:text,image,file|default:text'
        ]);

        $message = ChatMessage::create([
            'from_user_id' => Auth::id(),
            'to_user_id' => $request->to_user_id,
            'message' => $request->message,
            'type' => $request->type ?? 'text',
            'read_at' => null
        ]);

        $message->load(['fromUser:id,name,avatar', 'toUser:id,name,avatar']);

        // Broadcast to WebSocket if available
        // event(new MessageSent($message));

        return response()->json([
            'success' => true,
            'data' => $message
        ]);
    }

    /**
     * Get online users
     */
    public function getOnlineUsers()
    {
        $onlineUsers = User::where('id', '!=', Auth::id())
            ->where('last_seen_at', '>=', now()->subMinutes(5))
            ->select('id', 'name', 'avatar', 'last_seen_at')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $onlineUsers
        ]);
    }

    /**
     * Get recent conversations
     */
    public function getRecentConversations()
    {
        $currentUserId = Auth::id();

        $conversations = DB::table('chat_messages as cm1')
            ->select(
                'users.id',
                'users.name',
                'users.avatar',
                'users.last_seen_at',
                DB::raw('(SELECT message FROM chat_messages WHERE 
                    ((from_user_id = cm1.from_user_id AND to_user_id = cm1.to_user_id) OR 
                     (from_user_id = cm1.to_user_id AND to_user_id = cm1.from_user_id))
                    ORDER BY created_at DESC LIMIT 1) as last_message'),
                DB::raw('(SELECT created_at FROM chat_messages WHERE 
                    ((from_user_id = cm1.from_user_id AND to_user_id = cm1.to_user_id) OR 
                     (from_user_id = cm1.to_user_id AND to_user_id = cm1.from_user_id))
                    ORDER BY created_at DESC LIMIT 1) as last_message_time'),
                DB::raw('(SELECT COUNT(*) FROM chat_messages WHERE 
                    from_user_id = users.id AND to_user_id = ? AND read_at IS NULL) as unread_count')
            )
            ->join('users', function ($join) use ($currentUserId) {
                $join->on('users.id', '=', DB::raw("CASE 
                    WHEN cm1.from_user_id = {$currentUserId} THEN cm1.to_user_id 
                    ELSE cm1.from_user_id 
                END"));
            })
            ->where(function ($query) use ($currentUserId) {
                $query->where('cm1.from_user_id', $currentUserId)
                      ->orWhere('cm1.to_user_id', $currentUserId);
            })
            ->groupBy('users.id', 'users.name', 'users.avatar', 'users.last_seen_at')
            ->orderBy('last_message_time', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $conversations
        ]);
    }

    /**
     * Mark messages as read
     */
    public function markAsRead(Request $request)
    {
        $request->validate([
            'user_id' => 'required|integer|exists:users,id'
        ]);

        $currentUserId = Auth::id();
        $otherUserId = $request->user_id;

        ChatMessage::where('from_user_id', $otherUserId)
            ->where('to_user_id', $currentUserId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json([
            'success' => true,
            'message' => 'Messages marked as read'
        ]);
    }

    /**
     * Update user's last seen
     */
    public function updateLastSeen()
    {
        Auth::user()->update(['last_seen_at' => now()]);

        return response()->json([
            'success' => true
        ]);
    }
} 