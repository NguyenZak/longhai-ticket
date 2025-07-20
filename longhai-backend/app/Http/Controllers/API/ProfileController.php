<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    /**
     * Get current user profile
     */
    public function show()
    {
        $user = Auth::user();
        
        return response()->json([
            'success' => true,
            'data' => $user
        ]);
    }

    /**
     * Update current user profile
     */
    public function update(Request $request)
    {
        $user = Auth::user();
        
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'current_password' => 'nullable|string',
            'new_password' => 'nullable|string|min:8|confirmed',
            'new_password_confirmation' => 'nullable|string|min:8'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check current password if changing password
        if ($request->new_password) {
            if (!$request->current_password) {
                return response()->json([
                    'success' => false,
                    'message' => 'Current password is required to change password',
                ], 422);
            }

            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Current password is incorrect',
                ], 422);
            }
        }

        // Handle avatar upload
        $avatarPath = $user->avatar;
        if ($request->hasFile('avatar')) {
            // Delete old avatar if exists
            if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
                Storage::disk('public')->delete($user->avatar);
            }

            $avatar = $request->file('avatar');
            $avatarName = 'avatars/' . time() . '_' . $avatar->getClientOriginalName();
            $avatarPath = $avatar->storeAs('avatars', $avatarName, 'public');
        }

        // Update user data
        $updateData = [
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'address' => $request->address,
        ];

        if ($avatarPath !== $user->avatar) {
            $updateData['avatar'] = $avatarPath;
        }

        if ($request->new_password) {
            $updateData['password'] = Hash::make($request->new_password);
        }

        $user->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'data' => $user->fresh()
        ]);
    }

    /**
     * Change password
     */
    public function changePassword(Request $request)
    {
        $user = Auth::user();
        
        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
            'new_password_confirmation' => 'required|string|min:8'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check current password
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect',
            ], 422);
        }

        // Update password
        $user->update([
            'password' => Hash::make($request->new_password)
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully'
        ]);
    }

    /**
     * Upload avatar
     */
    public function uploadAvatar(Request $request)
    {
        $user = Auth::user();
        
        $validator = Validator::make($request->all(), [
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Delete old avatar if exists
        if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
            Storage::disk('public')->delete($user->avatar);
        }

        // Upload new avatar
        $avatar = $request->file('avatar');
        $avatarName = 'avatars/' . time() . '_' . $avatar->getClientOriginalName();
        $avatarPath = $avatar->storeAs('avatars', $avatarName, 'public');

        $user->update(['avatar' => $avatarPath]);

        return response()->json([
            'success' => true,
            'message' => 'Avatar uploaded successfully',
            'data' => [
                'avatar' => $avatarPath,
                'avatar_url' => Storage::disk('public')->url($avatarPath)
            ]
        ]);
    }

    /**
     * Delete avatar
     */
    public function deleteAvatar()
    {
        $user = Auth::user();

        if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
            Storage::disk('public')->delete($user->avatar);
        }

        $user->update(['avatar' => null]);

        return response()->json([
            'success' => true,
            'message' => 'Avatar deleted successfully'
        ]);
    }

    /**
     * Get user statistics
     */
    public function getStats()
    {
        $user = Auth::user();
        
        $stats = [
            'total_bookings' => $user->bookings()->count(),
            'recent_bookings' => $user->bookings()->where('created_at', '>=', now()->subDays(30))->count(),
            'total_events_attended' => $user->bookings()->distinct('event_id')->count(),
            'member_since' => $user->created_at->format('M Y'),
            'last_login' => $user->last_seen_at ? $user->last_seen_at->format('M d, Y H:i') : 'Never',
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Get user activity
     */
    public function getActivity()
    {
        $user = Auth::user();
        
        $recentBookings = $user->bookings()
            ->with('event:id,title,start_date')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $recentBookings
        ]);
    }
} 