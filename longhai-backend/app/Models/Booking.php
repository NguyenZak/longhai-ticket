<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Booking extends Model
{
    protected $fillable = [
        'event_id',
        'ticket_id',
        'user_id',
        'booking_number',
        'quantity',
        'total_amount',
        'status',
        'notes'
    ];

    protected $casts = [
        'quantity' => 'integer',
        'total_amount' => 'decimal:2'
    ];

    // Status constants
    const STATUS_PENDING = 'pending';
    const STATUS_CONFIRMED = 'confirmed';
    const STATUS_CANCELLED = 'cancelled';
    const STATUS_COMPLETED = 'completed';

    /**
     * Get all available statuses
     */
    public static function getStatuses(): array
    {
        return [
            self::STATUS_PENDING => 'Chờ xác nhận',
            self::STATUS_CONFIRMED => 'Đã xác nhận',
            self::STATUS_CANCELLED => 'Đã hủy',
            self::STATUS_COMPLETED => 'Hoàn thành'
        ];
    }

    /**
     * Get status text
     */
    public function getStatusTextAttribute(): string
    {
        $statuses = self::getStatuses();
        return $statuses[$this->status] ?? 'Không xác định';
    }

    /**
     * Get the event that owns the booking.
     */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    /**
     * Get the ticket that owns the booking.
     */
    public function ticket(): BelongsTo
    {
        return $this->belongsTo(Ticket::class);
    }

    /**
     * Get the user that owns the booking.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Generate unique booking number
     */
    public static function generateBookingNumber(): string
    {
        do {
            $bookingNumber = 'BK' . date('Ymd') . Str::random(6);
        } while (self::where('booking_number', $bookingNumber)->exists());

        return $bookingNumber;
    }

    /**
     * Boot method to auto-generate booking number
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($booking) {
            if (empty($booking->booking_number)) {
                $booking->booking_number = self::generateBookingNumber();
            }
        });
    }

    /**
     * Calculate total amount based on ticket price and quantity
     */
    public function calculateTotalAmount()
    {
        if ($this->ticket) {
            $this->total_amount = $this->ticket->price * $this->quantity;
            $this->save();
        }
    }
}
