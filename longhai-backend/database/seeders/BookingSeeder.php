<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Booking;
use App\Models\Event;
use App\Models\User;
use App\Models\Ticket;
use Carbon\Carbon;

class BookingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::where('role', 'user')->get();
        $tickets = Ticket::where('status', 'active')->get();
        
        if ($users->isEmpty() || $tickets->isEmpty()) {
            return;
        }
        
        $statuses = ['pending', 'confirmed', 'cancelled', 'completed'];
        
        // Tạo 15 bookings mẫu
        for ($i = 0; $i < 15; $i++) {
            $user = $users->random();
            $ticket = $tickets->random();
            $event = $ticket->event;
            $status = $statuses[array_rand($statuses)];
            $quantity = rand(1, 3);
            
            // Kiểm tra xem ticket có đủ số lượng không
            if ($ticket->available_quantity < $quantity) {
                continue;
            }
            
            // Tính tổng tiền
            $totalAmount = $ticket->price * $quantity;
            
            // Tạo booking
            $booking = Booking::create([
                'user_id' => $user->id,
                'event_id' => $event->id,
                'ticket_id' => $ticket->id,
                'quantity' => $quantity,
                'total_amount' => $totalAmount,
                'status' => $status,
                'notes' => rand(0, 1) ? 'Ghi chú đặt vé mẫu' : null,
            ]);
            
            // Cập nhật số lượng vé khả dụng
            $ticket->available_quantity -= $quantity;
            $ticket->save();
        }
    }
}
