<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Carbon\Carbon;

class News extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'slug',
        'excerpt',
        'content',
        'image',
        'author',
        'category',
        'tags',
        'read_time',
        'featured',
        'published_at',
        'status',
        'meta_title',
        'meta_description',
        'created_by',
        'updated_by'
    ];

    protected $casts = [
        'tags' => 'array',
        'featured' => 'boolean',
        'published_at' => 'datetime',
        'read_time' => 'integer'
    ];

    protected $dates = [
        'published_at',
        'created_at',
        'updated_at',
        'deleted_at'
    ];

    // Relationships
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    // Scopes
    public function scopePublished($query)
    {
        return $query->where('status', 'published')
                    ->where('published_at', '<=', now());
    }

    public function scopeFeatured($query)
    {
        return $query->where('featured', true);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopeSearch($query, $search)
    {
        return $query->where(function($q) use ($search) {
            $q->where('title', 'like', "%{$search}%")
              ->orWhere('excerpt', 'like', "%{$search}%")
              ->orWhere('content', 'like', "%{$search}%")
              ->orWhereJsonContains('tags', $search);
        });
    }

    // Accessors
    public function getFormattedPublishedAtAttribute()
    {
        return $this->published_at ? $this->published_at->format('d/m/Y H:i') : null;
    }

    public function getFormattedCreatedAtAttribute()
    {
        return $this->created_at->format('d/m/Y H:i');
    }

    public function getFormattedUpdatedAtAttribute()
    {
        return $this->updated_at->format('d/m/Y H:i');
    }

    public function getStatusTextAttribute()
    {
        return [
            'draft' => 'Bản nháp',
            'published' => 'Đã xuất bản',
            'archived' => 'Đã lưu trữ'
        ][$this->status] ?? $this->status;
    }

    public function getCategoryTextAttribute()
    {
        return [
            'Sự kiện' => 'Sự kiện',
            'Nghệ sĩ' => 'Nghệ sĩ',
            'Thông báo' => 'Thông báo',
            'Behind the scenes' => 'Behind the scenes',
            'Phỏng vấn' => 'Phỏng vấn',
            'Công nghệ' => 'Công nghệ'
        ][$this->category] ?? $this->category;
    }

    // Mutators
    public function setSlugAttribute($value)
    {
        if (empty($value)) {
            $this->attributes['slug'] = \Str::slug($this->title);
        } else {
            $this->attributes['slug'] = \Str::slug($value);
        }
    }

    public function setTagsAttribute($value)
    {
        if (is_string($value)) {
            $this->attributes['tags'] = json_encode(array_filter(array_map('trim', explode(',', $value))));
        } else {
            $this->attributes['tags'] = json_encode($value);
        }
    }

    // Methods
    public function isPublished()
    {
        return $this->status === 'published' && $this->published_at <= now();
    }

    public function isDraft()
    {
        return $this->status === 'draft';
    }

    public function isArchived()
    {
        return $this->status === 'archived';
    }

    public function toggleFeatured()
    {
        $this->featured = !$this->featured;
        return $this->save();
    }

    public function publish()
    {
        $this->status = 'published';
        $this->published_at = now();
        return $this->save();
    }

    public function archive()
    {
        $this->status = 'archived';
        return $this->save();
    }

    public function duplicate()
    {
        $newNews = $this->replicate();
        $newNews->title = $this->title . ' (Bản sao)';
        $newNews->slug = $this->slug . '-copy';
        $newNews->status = 'draft';
        $newNews->featured = false;
        $newNews->published_at = null;
        $newNews->save();

        return $newNews;
    }
} 