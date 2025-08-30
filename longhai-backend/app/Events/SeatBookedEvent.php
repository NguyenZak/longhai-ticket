<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SeatBookedEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public string $eventId,
        public string $seatId,
        public string $userId,
        public string $bookingId,
        public string $status = 'booked'
    ) {}

    public function broadcastOn(): array
    {
        return [
            new Channel("event.{$this->eventId}"),
            new PrivateChannel("user.{$this->userId}"),
            new Channel('seats.updates'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'seat.booked';
    }

    public function broadcastWith(): array
    {
        return [
            'event_id' => $this->eventId,
            'seat_id' => $this->seatId,
            'user_id' => $this->userId,
            'booking_id' => $this->bookingId,
            'status' => $this->status,
            'timestamp' => now()->toISOString(),
        ];
    }
}
