<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ScrumboardTask extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'title',
        'description',
        'tags',
        'priority',
        'assignee',
        'progress',
        'due_date',
        'order',
        'has_image',
        'image_path'
    ];

    protected $casts = [
        'tags' => 'array',
        'progress' => 'integer',
        'order' => 'integer',
        'has_image' => 'boolean',
        'due_date' => 'date',
    ];

    public function project()
    {
        return $this->belongsTo(ScrumboardProject::class, 'project_id');
    }

    public function getFormattedDateAttribute()
    {
        if (!$this->due_date) {
            return null;
        }
        
        $monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return $this->due_date->format('d') . ' ' . $monthNames[$this->due_date->format('n') - 1] . ', ' . $this->due_date->format('Y');
    }
}
