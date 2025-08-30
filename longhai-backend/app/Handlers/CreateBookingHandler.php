<?php

namespace App\Handlers;

use App\Commands\CreateBookingCommand;
use App\Models\Booking;
use App\Models\Event;
use App\Models\User;
use App\Models\Seat;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CreateBookingHandler
{
    public function handle(CreateBookingCommand $command): Booking
    {
        return DB::transaction(function () use ($command) {
            // Validate event exists and has available seats
            $event = Event::findOrFail($command->eventId);
            
            if ($event->available_seats < $command->quantity) {
                throw new \Exception('Not enough available seats');
            }
            
            // Validate user exists
            $user = User::findOrFail($command->userId);
            
            // Check if seats are available
            $seats = Seat::whereIn('id', $command->seats)
                        ->where('event_id', $command->eventId)
                        ->where('status', 'available')
                        ->get();
            
            if (count($seats) !== count($command->seats)) {
                throw new \Exception('Some seats are not available');
            }
            
            // Create booking
            $booking = Booking::create([
                'user_id' => $command->userId,
                'event_id' => $command->eventId,
                'quantity' => $command->quantity,
                'total_price' => $command->totalPrice,
                'status' => 'pending',
                'notes' => $command->notes,
            ]);
            
            // Update seats status
            Seat::whereIn('id', $command->seats)->update([
                'status' => 'booked',
                'booking_id' => $booking->id,
                'booked_at' => now(),
            ]);
            
            // Update event available seats
            $event->decrement('available_seats', $command->quantity);
            
            // Log booking creation
            Log::info('Booking created', [
                'booking_id' => $booking->id,
                'user_id' => $command->userId,
                'event_id' => $command->eventId,
                'quantity' => $command->quantity,
                'total_price' => $command->totalPrice,
            ]);
            
            return $booking;
        });
    }
}
