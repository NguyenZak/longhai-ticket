<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ChatMessage;
use App\Models\User;

class ChatSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all users
        $users = User::all();
        
        if ($users->count() < 2) {
            $this->command->info('Need at least 2 users to create chat data');
            return;
        }

        // Create sample chat messages between users
        $sampleMessages = [
            [
                'from_user_id' => $users[0]->id,
                'to_user_id' => $users[1]->id,
                'message' => 'Chào bạn! Có gì mới không?',
                'type' => 'text',
                'created_at' => now()->subHours(2)
            ],
            [
                'from_user_id' => $users[1]->id,
                'to_user_id' => $users[0]->id,
                'message' => 'Chào! Tôi đang làm việc với dự án mới.',
                'type' => 'text',
                'created_at' => now()->subHours(1, 55)
            ],
            [
                'from_user_id' => $users[0]->id,
                'to_user_id' => $users[1]->id,
                'message' => 'Tuyệt vời! Dự án gì vậy?',
                'type' => 'text',
                'created_at' => now()->subHours(1, 50)
            ],
            [
                'from_user_id' => $users[1]->id,
                'to_user_id' => $users[0]->id,
                'message' => 'Dự án quản lý vé sự kiện. Bạn có muốn tham gia không?',
                'type' => 'text',
                'created_at' => now()->subHours(1, 45)
            ],
            [
                'from_user_id' => $users[0]->id,
                'to_user_id' => $users[1]->id,
                'message' => 'Có chứ! Nghe rất thú vị. Khi nào bắt đầu?',
                'type' => 'text',
                'created_at' => now()->subHours(1, 40)
            ]
        ];

        // Create messages for each user pair
        foreach ($users as $i => $user1) {
            foreach ($users as $j => $user2) {
                if ($i >= $j) continue; // Skip same user and avoid duplicates
                
                foreach ($sampleMessages as $messageData) {
                    ChatMessage::create([
                        'from_user_id' => $user1->id,
                        'to_user_id' => $user2->id,
                        'message' => $messageData['message'],
                        'type' => $messageData['type'],
                        'created_at' => $messageData['created_at']->addMinutes(rand(0, 30))
                    ]);
                }
            }
        }

        // Update users' last_seen_at to make some appear online
        foreach ($users as $index => $user) {
            if ($index % 2 == 0) {
                $user->update(['last_seen_at' => now()]); // Online
            } else {
                $user->update(['last_seen_at' => now()->subMinutes(10)]); // Offline
            }
        }

        $this->command->info('Chat data seeded successfully!');
    }
} 