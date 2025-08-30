<?php

namespace App\Commands;

class CreateBookingCommand
{
    public function __construct(
        public string $userId,
        public string $eventId,
        public int $quantity,
        public array $seats,
        public float $totalPrice,
        public ?string $notes = null
    ) {}
}
