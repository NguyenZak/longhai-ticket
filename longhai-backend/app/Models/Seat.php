<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Seat extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'row',
        'column',
        'x',
        'y',
        'width',
        'height',
        'status',
        'price',
        'category',
        'color',
        'ticket_type',
        'seat_name',
        'row_name'
    ];

    protected $casts = [
        'x' => 'decimal:2',
        'y' => 'decimal:2',
        'width' => 'decimal:2',
        'height' => 'decimal:2',
        'price' => 'decimal:2',
    ];

    /**
     * Get the event that owns the seat.
     */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    /**
     * Get the ticket type for this seat.
     */
    public function ticketType(): BelongsTo
    {
        return $this->belongsTo(Ticket::class, 'ticket_type', 'id');
    }

    /**
     * Scope a query to only include available seats.
     */
    public function scopeAvailable($query)
    {
        return $query->where('status', 'available');
    }

    /**
     * Scope a query to only include occupied seats.
     */
    public function scopeOccupied($query)
    {
        return $query->where('status', 'occupied');
    }

    /**
     * Scope a query to only include reserved seats.
     */
    public function scopeReserved($query)
    {
        return $query->where('status', 'reserved');
    }

    /**
     * Scope a query to only include disabled seats.
     */
    public function scopeDisabled($query)
    {
        return $query->where('status', 'disabled');
    }

    /**
     * Get the seat position as a string (e.g., "A1", "B5").
     */
    public function getPositionAttribute(): string
    {
        $rowLetter = chr(64 + $this->row); // Convert row number to letter (1=A, 2=B, etc.)
        return $rowLetter . $this->column;
    }

    /**
     * Get the display name for the seat.
     */
    public function getDisplayNameAttribute(): string
    {
        return $this->seat_name ?? $this->position;
    }

    /**
     * Get the display name for the row.
     */
    public function getDisplayRowNameAttribute(): string
    {
        return $this->row_name ?? "Hàng {$this->row}";
    }

    /**
     * Check if the seat is bookable.
     */
    public function isBookable(): bool
    {
        return $this->status === 'available';
    }

    /**
     * Check if the seat is occupied.
     */
    public function isOccupied(): bool
    {
        return $this->status === 'occupied';
    }

    /**
     * Check if the seat is reserved.
     */
    public function isReserved(): bool
    {
        return $this->status === 'reserved';
    }

    /**
     * Check if the seat is disabled.
     */
    public function isDisabled(): bool
    {
        return $this->status === 'disabled';
    }

    /**
     * Get the formatted price.
     */
    public function getFormattedPriceAttribute(): string
    {
        if (!$this->price) {
            return 'N/A';
        }
        return number_format($this->price, 0, ',', '.') . 'đ';
    }

    /**
     * Get the seat color with fallback.
     */
    public function getSeatColorAttribute(): string
    {
        return $this->color ?? '#4CAF50';
    }

    /**
     * Get the seat category with fallback.
     */
    public function getSeatCategoryAttribute(): string
    {
        return $this->category ?? 'Thường';
    }

    /**
     * Convert seat to array for frontend.
     */
    public function toFrontendArray(): array
    {
        return [
            'id' => $this->id,
            'row' => $this->row,
            'column' => $this->column,
            'x' => (float) $this->x,
            'y' => (float) $this->y,
            'width' => (float) $this->width,
            'height' => (float) $this->height,
            'status' => $this->status,
            'price' => $this->price ? (float) $this->price : null,
            'category' => $this->category,
            'color' => $this->color,
            'ticketType' => $this->ticket_type,
            'seatName' => $this->seat_name,
            'rowName' => $this->row_name,
            'position' => $this->position,
            'displayName' => $this->display_name,
            'displayRowName' => $this->display_row_name,
            'formattedPrice' => $this->formatted_price,
            'isBookable' => $this->isBookable(),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at
        ];
    }
} 