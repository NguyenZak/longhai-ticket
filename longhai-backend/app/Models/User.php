<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    // Role constants
    const ROLE_SUPER_ADMIN = 'super_admin';
    const ROLE_ADMIN = 'admin';
    const ROLE_MANAGER = 'manager';
    const ROLE_USER = 'user';

    // Permission constants
    const PERMISSION_MANAGE_USERS = 'manage_users';
    const PERMISSION_MANAGE_EVENTS = 'manage_events';
    const PERMISSION_MANAGE_TICKETS = 'manage_tickets';
    const PERMISSION_MANAGE_BOOKINGS = 'manage_bookings';
    const PERMISSION_VIEW_DASHBOARD = 'view_dashboard';
    const PERMISSION_VIEW_REPORTS = 'view_reports';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'avatar',
        'phone',
        'address',
        'role',
        'status',
        'permissions',
        'notification_settings'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'permissions' => 'array',
            'notification_settings' => 'array',
        ];
    }

    /**
     * Get the bookings for this user.
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    /**
     * Check if user is super admin
     */
    public function isSuperAdmin(): bool
    {
        return $this->role === self::ROLE_SUPER_ADMIN;
    }

    /**
     * Check if user is admin
     */
    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN || $this->role === self::ROLE_SUPER_ADMIN;
    }

    /**
     * Check if user is manager
     */
    public function isManager(): bool
    {
        return $this->role === self::ROLE_MANAGER || $this->isAdmin();
    }

    /**
     * Check if user is regular user
     */
    public function isUser(): bool
    {
        return $this->role === self::ROLE_USER;
    }

    /**
     * Check if user has specific permission
     */
    public function hasPermission(string $permission): bool
    {
        // Super admin has all permissions
        if ($this->isSuperAdmin()) {
            return true;
        }

        // Check if user has the permission in their permissions array
        $permissions = $this->permissions ?? [];
        return in_array($permission, $permissions);
    }

    /**
     * Check if user has any of the given permissions
     */
    public function hasAnyPermission(array $permissions): bool
    {
        foreach ($permissions as $permission) {
            if ($this->hasPermission($permission)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check if user has all of the given permissions
     */
    public function hasAllPermissions(array $permissions): bool
    {
        foreach ($permissions as $permission) {
            if (!$this->hasPermission($permission)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Get available roles
     */
    public static function getAvailableRoles(): array
    {
        return [
            self::ROLE_SUPER_ADMIN => 'Super Admin',
            self::ROLE_ADMIN => 'Admin',
            self::ROLE_MANAGER => 'Manager',
            self::ROLE_USER => 'User',
        ];
    }

    /**
     * Get available permissions
     */
    public static function getAvailablePermissions(): array
    {
        return [
            self::PERMISSION_MANAGE_USERS => 'Quản lý người dùng',
            self::PERMISSION_MANAGE_EVENTS => 'Quản lý sự kiện',
            self::PERMISSION_MANAGE_TICKETS => 'Quản lý vé',
            self::PERMISSION_MANAGE_BOOKINGS => 'Quản lý đặt vé',
            self::PERMISSION_VIEW_DASHBOARD => 'Xem dashboard',
            self::PERMISSION_VIEW_REPORTS => 'Xem báo cáo',
        ];
    }

    /**
     * Get default permissions for role
     */
    public static function getDefaultPermissionsForRole(string $role): array
    {
        switch ($role) {
            case self::ROLE_SUPER_ADMIN:
                return array_values(self::getAvailablePermissions());
            case self::ROLE_ADMIN:
                return [
                    self::PERMISSION_MANAGE_USERS,
                    self::PERMISSION_MANAGE_EVENTS,
                    self::PERMISSION_MANAGE_TICKETS,
                    self::PERMISSION_MANAGE_BOOKINGS,
                    self::PERMISSION_VIEW_DASHBOARD,
                    self::PERMISSION_VIEW_REPORTS,
                ];
            case self::ROLE_MANAGER:
                return [
                    self::PERMISSION_MANAGE_EVENTS,
                    self::PERMISSION_MANAGE_TICKETS,
                    self::PERMISSION_MANAGE_BOOKINGS,
                    self::PERMISSION_VIEW_DASHBOARD,
                    self::PERMISSION_VIEW_REPORTS,
                ];
            case self::ROLE_USER:
                return [
                    self::PERMISSION_VIEW_DASHBOARD,
                ];
            default:
                return [];
        }
    }

    /**
     * Check if user is active
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Get role display name
     */
    public function getRoleDisplayName(): string
    {
        $roles = self::getAvailableRoles();
        return $roles[$this->role] ?? $this->role;
    }
}
