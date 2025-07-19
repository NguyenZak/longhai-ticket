<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ticket extends Model
{
    protected $fillable = [
        'event_id',
        'name',
        'color',
        'prices',
        'quantities',
        'status',
        'description'
    ];

    protected $casts = [
        'prices' => 'array',
        'quantities' => 'array'
    ];

    /**
     * Get the event that owns the ticket.
     */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    /**
     * Get the bookings for this ticket.
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    /**
     * Calculate available quantity
     */
    public function calculateAvailableQuantity()
    {
        $bookedQuantity = $this->bookings()->sum('quantity');
        $totalQuantity = array_sum($this->quantities ?? []);
        return $totalQuantity - $bookedQuantity;
    }

    /**
     * Check if ticket is available
     */
    public function isAvailable(): bool
    {
        return $this->status === 'active' && $this->calculateAvailableQuantity() > 0;
    }

    /**
     * Get status text
     */
    public function getStatusTextAttribute(): string
    {
        $statuses = [
            'active' => 'Hoạt động',
            'inactive' => 'Không hoạt động',
            'sold_out' => 'Hết vé',
            'booked' => 'Đã đặt',
            'cancelled' => 'Đã hủy',
            'preparing' => 'Chuẩn bị'
        ];
        
        return $statuses[$this->status] ?? 'Không xác định';
    }

    /**
     * Get minimum price
     */
    public function getMinPriceAttribute()
    {
        if (empty($this->prices)) {
            return 0;
        }
        return min($this->prices);
    }

    /**
     * Get maximum price
     */
    public function getMaxPriceAttribute()
    {
        if (empty($this->prices)) {
            return 0;
        }
        return max($this->prices);
    }

    /**
     * Get total quantity
     */
    public function getTotalQuantityAttribute()
    {
        if (empty($this->quantities)) {
            return 0;
        }
        return array_sum($this->quantities);
    }

    /**
     * Accessor for backward compatibility - get first price
     */
    public function getPriceAttribute()
    {
        if (empty($this->prices)) {
            return 0;
        }
        return is_array($this->prices) ? $this->prices[0] : json_decode($this->prices, true)[0] ?? 0;
    }

    /**
     * Accessor for backward compatibility - get first quantity
     */
    public function getQuantityAttribute()
    {
        if (empty($this->quantities)) {
            return 0;
        }
        return is_array($this->quantities) ? $this->quantities[0] : json_decode($this->quantities, true)[0] ?? 0;
    }

    /**
     * Accessor for backward compatibility - get available quantity
     */
    public function getAvailableQuantityAttribute()
    {
        return $this->calculateAvailableQuantity();
    }

    /**
     * Accessor for backward compatibility - get ticket_type
     */
    public function getTicketTypeAttribute()
    {
        return $this->name;
    }

    /**
     * Mutator for backward compatibility - set ticket_type
     */
    public function setTicketTypeAttribute($value)
    {
        $this->name = $value;
    }
}
