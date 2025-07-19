<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create super admin user
        User::create([
            'name' => 'Super Admin',
            'email' => 'superadmin@longhai.com',
            'password' => Hash::make('password'),
            'role' => User::ROLE_SUPER_ADMIN,
            'phone' => '0123456789',
            'address' => 'Long Hải, Vũng Tàu',
            'status' => 'active',
            'permissions' => User::getDefaultPermissionsForRole(User::ROLE_SUPER_ADMIN)
        ]);

        // Create admin user
        User::create([
            'name' => 'Admin',
            'email' => 'admin@longhai.com',
            'password' => Hash::make('password'),
            'role' => User::ROLE_ADMIN,
            'phone' => '0123456789',
            'address' => 'Long Hải, Vũng Tàu',
            'status' => 'active',
            'permissions' => User::getDefaultPermissionsForRole(User::ROLE_ADMIN)
        ]);

        // Create manager user
        User::create([
            'name' => 'Manager',
            'email' => 'manager@longhai.com',
            'password' => Hash::make('password'),
            'role' => User::ROLE_MANAGER,
            'phone' => '0987654321',
            'address' => 'TP. Hồ Chí Minh',
            'status' => 'active',
            'permissions' => User::getDefaultPermissionsForRole(User::ROLE_MANAGER)
        ]);

        // Create test user
        User::create([
            'name' => 'Test User',
            'email' => 'user@longhai.com',
            'password' => Hash::make('password'),
            'role' => User::ROLE_USER,
            'phone' => '0987654321',
            'address' => 'TP. Hồ Chí Minh',
            'status' => 'active',
            'permissions' => User::getDefaultPermissionsForRole(User::ROLE_USER)
        ]);

        // Call other seeders
        $this->call([
            EventSeeder::class,
            BookingSeeder::class,
            ScrumboardSeeder::class,
        ]);
    }
}
