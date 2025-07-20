<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Notification;
use App\Models\User;

class NotificationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::all();
        
        if ($users->isEmpty()) {
            $this->command->info('No users found. Please run UserSeeder first.');
            return;
        }

        $sampleNotifications = [
            [
                'title' => 'Chào mừng bạn!',
                'message' => 'Chào mừng bạn đến với hệ thống quản lý vé sự kiện Long Hải.',
                'type' => 'info',
                'data' => ['action' => 'welcome']
            ],
            [
                'title' => 'Sự kiện mới',
                'message' => 'Có sự kiện mới "Hòa nhạc mùa xuân 2025" đã được thêm vào hệ thống.',
                'type' => 'success',
                'data' => ['action' => 'new_event', 'event_id' => 1]
            ],
            [
                'title' => 'Đặt vé thành công',
                'message' => 'Bạn đã đặt vé thành công cho sự kiện "Hòa nhạc mùa xuân 2025".',
                'type' => 'success',
                'data' => ['action' => 'booking_success', 'booking_id' => 1]
            ],
            [
                'title' => 'Nhắc nhở sự kiện',
                'message' => 'Sự kiện "Hòa nhạc mùa xuân 2025" sẽ diễn ra trong 2 ngày tới.',
                'type' => 'warning',
                'data' => ['action' => 'event_reminder', 'event_id' => 1]
            ],
            [
                'title' => 'Cập nhật hệ thống',
                'message' => 'Hệ thống đã được cập nhật với các tính năng mới.',
                'type' => 'info',
                'data' => ['action' => 'system_update']
            ]
        ];

        foreach ($users as $user) {
            // Create 3-5 random notifications for each user
            $userNotifications = collect($sampleNotifications)->random(rand(3, 5));
            
            foreach ($userNotifications as $notification) {
                Notification::create([
                    'user_id' => $user->id,
                    'title' => $notification['title'],
                    'message' => $notification['message'],
                    'type' => $notification['type'],
                    'data' => $notification['data'],
                    'read_at' => rand(0, 1) ? now()->subDays(rand(1, 7)) : null, // Some read, some unread
                    'created_at' => now()->subDays(rand(1, 30))
                ]);
            }
        }

        $this->command->info('Notification data seeded successfully!');
    }
} 