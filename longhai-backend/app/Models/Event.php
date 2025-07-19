<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Event extends Model
{
    // Status constants
    const STATUS_PREPARING = 'preparing';
    const STATUS_ACTIVE = 'active';
    const STATUS_ENDED = 'ended';

    protected $fillable = [
        'title',
        'slug',
        'description',
        'venue',
        'location_detail',
        'start_date',
        'end_date',
        'time',
        'status',
        'status_display',
        'display_status', // Thêm dòng này để đồng bộ với frontend
        'total_seats',
        'available_seats',
        'price',
        'price_display',
        'image',
        'map_image',
        'artists',
        'ticket_prices'
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'time' => 'datetime',
        'price' => 'decimal:2',
        'total_seats' => 'integer',
        'available_seats' => 'integer',
        'artists' => 'array',
        'ticket_prices' => 'array'
    ];

    /**
     * Get all available statuses
     */
    public static function getStatuses(): array
    {
        return [
            self::STATUS_PREPARING => 'Chuẩn bị',
            self::STATUS_ACTIVE => 'Đang hoạt động',
            self::STATUS_ENDED => 'Đã kết thúc'
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
     * Get the bookings for this event.
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    /**
     * Get the tickets for this event.
     */
    public function tickets(): HasMany
    {
        return $this->hasMany(Ticket::class);
    }

    /**
     * Calculate available seats
     */
    public function calculateAvailableSeats()
    {
        $bookedSeats = $this->bookings()->sum('quantity');
        $this->available_seats = $this->total_seats - $bookedSeats;
        $this->save();
    }

    /**
     * Check if event is active
     */
    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE;
    }

    /**
     * Check if event has available seats
     */
    public function hasAvailableSeats(): bool
    {
        return $this->available_seats > 0;
    }

    /**
     * Get formatted price
     */
    public function getFormattedPriceAttribute(): string
    {
        return number_format($this->price, 0, ',', '.') . ' VNĐ';
    }
}
