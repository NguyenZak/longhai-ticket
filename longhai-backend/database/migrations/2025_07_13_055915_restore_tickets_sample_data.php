<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Restore sample ticket data with proper prices and quantities
        $sampleData = [
            [
                'id' => 1,
                'prices' => [450000],
                'quantities' => [100]
            ],
            [
                'id' => 2,
                'prices' => [300000],
                'quantities' => [150]
            ],
            [
                'id' => 3,
                'prices' => [150000],
                'quantities' => [200]
            ],
            [
                'id' => 4,
                'prices' => [1125000],
                'quantities' => [50]
            ],
            [
                'id' => 5,
                'prices' => [750000],
                'quantities' => [75]
            ],
            [
                'id' => 6,
                'prices' => [375000],
                'quantities' => [120]
            ],
            [
                'id' => 7,
                'prices' => [300000],
                'quantities' => [100]
            ],
            [
                'id' => 8,
                'prices' => [200000],
                'quantities' => [150]
            ],
            [
                'id' => 9,
                'prices' => [100000],
                'quantities' => [200]
            ],
            [
                'id' => 10,
                'prices' => [300000],
                'quantities' => [100]
            ],
            [
                'id' => 11,
                'prices' => [200000],
                'quantities' => [150]
            ],
            [
                'id' => 12,
                'prices' => [100000],
                'quantities' => [200]
            ],
            [
                'id' => 13,
                'prices' => [825000],
                'quantities' => [60]
            ],
            [
                'id' => 14,
                'prices' => [550000],
                'quantities' => [80]
            ],
            [
                'id' => 15,
                'prices' => [275000],
                'quantities' => [120]
            ]
        ];
        
        foreach ($sampleData as $data) {
            DB::table('tickets')
                ->where('id', $data['id'])
                ->update([
                    'prices' => json_encode($data['prices']),
                    'quantities' => json_encode($data['quantities']),
                    'updated_at' => now()
                ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No need to reverse this data restoration
    }
};
