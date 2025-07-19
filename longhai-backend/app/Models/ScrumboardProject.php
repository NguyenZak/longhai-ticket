<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ScrumboardProject extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'color',
        'order'
    ];

    protected $casts = [
        'order' => 'integer',
    ];

    public function tasks()
    {
        return $this->hasMany(ScrumboardTask::class, 'project_id')->orderBy('order');
    }

    public function tasksCount()
    {
        return $this->hasMany(ScrumboardTask::class, 'project_id')->count();
    }
}
