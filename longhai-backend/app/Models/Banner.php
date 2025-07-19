<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Banner extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'image',
        'mobile_image',
        'link_url',
        'button_text',
        'sort_order',
        'is_active',
        'start_date',
        'end_date',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'start_date' => 'datetime',
        'end_date' => 'datetime',
    ];

    /**
     * Scope để lấy banner đang hoạt động
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true)
                    ->where(function ($q) {
                        $q->whereNull('start_date')
                          ->orWhere('start_date', '<=', now());
                    })
                    ->where(function ($q) {
                        $q->whereNull('end_date')
                          ->orWhere('end_date', '>=', now());
                    });
    }

    /**
     * Scope để sắp xếp theo thứ tự
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order', 'asc');
    }

    /**
     * Lấy URL ảnh an toàn
     */
    public function getImageUrlAttribute()
    {
        if (empty($this->image)) {
            return 'https://res.cloudinary.com/demo/image/upload/sample.jpg';
        }
        return $this->image;
    }

    /**
     * Lấy URL ảnh mobile an toàn
     */
    public function getMobileImageUrlAttribute()
    {
        if (empty($this->mobile_image)) {
            return $this->image_url;
        }
        return $this->mobile_image;
    }
} 