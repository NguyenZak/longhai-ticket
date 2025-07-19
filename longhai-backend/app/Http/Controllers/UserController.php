<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $users = User::orderBy('created_at', 'desc')->get();
        
        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }

    /**
     * Get available roles and permissions
     */
    public function getRolesAndPermissions()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'roles' => User::getAvailableRoles(),
                'permissions' => User::getAvailablePermissions(),
            ]
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'role' => 'required|in:' . implode(',', array_keys(User::getAvailableRoles())),
            'status' => 'nullable|in:active,inactive',
            'permissions' => 'nullable|array',
            'permissions.*' => 'string|in:' . implode(',', array_keys(User::getAvailablePermissions()))
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Set default permissions based on role if not provided
        $permissions = $request->permissions;
        if (!$permissions) {
            $permissions = User::getDefaultPermissionsForRole($request->role);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'address' => $request->address,
            'role' => $request->role,
            'status' => $request->status ?? 'active',
            'permissions' => $permissions
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User created successfully',
            'data' => $user
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        return response()->json([
            'success' => true,
            'data' => $user
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'role' => 'required|in:' . implode(',', array_keys(User::getAvailableRoles())),
            'status' => 'nullable|in:active,inactive',
            'permissions' => 'nullable|array',
            'permissions.*' => 'string|in:' . implode(',', array_keys(User::getAvailablePermissions()))
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Set default permissions based on role if not provided
        $permissions = $request->permissions;
        if (!$permissions) {
            $permissions = User::getDefaultPermissionsForRole($request->role);
        }

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'address' => $request->address,
            'role' => $request->role,
            'status' => $request->status ?? $user->status,
            'permissions' => $permissions
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User updated successfully',
            'data' => $user
        ]);
    }

    /**
     * Update user password
     */
    public function updatePassword(Request $request, User $user)
    {
        $validator = Validator::make($request->all(), [
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user->update([
            'password' => Hash::make($request->password)
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password updated successfully'
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        // Prevent deleting super admin
        if ($user->isSuperAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete super admin user'
            ], 403);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully'
        ]);
    }

    /**
     * Bulk delete users
     */
    public function bulkDelete(Request $request)
    {
        $ids = $request->input('ids', []);
        if (!is_array($ids) || empty($ids)) {
            return response()->json([
                'success' => false,
                'message' => 'Vui lòng truyền danh sách id người dùng cần xoá.'
            ], 422);
        }

        // Prevent deleting super admin users
        $superAdminIds = User::whereIn('id', $ids)
            ->where('role', User::ROLE_SUPER_ADMIN)
            ->pluck('id')
            ->toArray();

        if (!empty($superAdminIds)) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể xoá super admin users'
            ], 403);
        }

        $deleted = User::whereIn('id', $ids)->delete();
        return response()->json([
            'success' => true,
            'message' => "Đã xoá $deleted người dùng thành công!"
        ]);
    }

    /**
     * Bulk update user status
     */
    public function bulkUpdateStatus(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:users,id',
            'status' => 'required|in:active,inactive'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $updated = User::whereIn('id', $request->ids)
            ->where('role', '!=', User::ROLE_SUPER_ADMIN) // Prevent deactivating super admin
            ->update(['status' => $request->status]);

        return response()->json([
            'success' => true,
            'message' => "Đã cập nhật trạng thái $updated người dùng thành công!"
        ]);
    }
} 