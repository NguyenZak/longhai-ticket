<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Event;

class UpdateEventStatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Update old status values to new ones
        Event::where('status', 'inactive')->update(['status' => 'preparing']);
        Event::where('status', 'cancelled')->update(['status' => 'ended']);
        
        // Keep 'active' as 'active'
        
        $this->command->info('Event statuses updated successfully!');
    }
}
