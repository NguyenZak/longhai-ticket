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
        // Fix prices data - ensure all prices are proper JSON arrays
        $tickets = DB::table('tickets')->get();
        
        foreach ($tickets as $ticket) {
            $prices = $ticket->prices;
            $quantities = $ticket->quantities;
            
            // Fix prices
            if (is_string($prices)) {
                // Try to decode JSON string
                $decodedPrices = json_decode($prices, true);
                if (json_last_error() === JSON_ERROR_NONE && is_array($decodedPrices)) {
                    $prices = $decodedPrices;
                } else {
                    // If it's a single number as string, convert to array
                    $prices = [$prices];
                }
            } elseif (!is_array($prices)) {
                // If it's null or other type, set to empty array
                $prices = [];
            }
            
            // Ensure all prices are numbers
            $prices = array_map(function($price) {
                return is_numeric($price) ? (float)$price : 0;
            }, $prices);
            
            // Fix quantities
            if (is_string($quantities)) {
                // Try to decode JSON string
                $decodedQuantities = json_decode($quantities, true);
                if (json_last_error() === JSON_ERROR_NONE && is_array($decodedQuantities)) {
                    $quantities = $decodedQuantities;
                } else {
                    // If it's a single number as string, convert to array
                    $quantities = [$quantities];
                }
            } elseif (!is_array($quantities)) {
                // If it's null or other type, set to empty array
                $quantities = [];
            }
            
            // Ensure all quantities are integers
            $quantities = array_map(function($quantity) {
                return is_numeric($quantity) ? (int)$quantity : 0;
            }, $quantities);
            
            // Update the ticket with proper JSON arrays
            DB::table('tickets')
                ->where('id', $ticket->id)
                ->update([
                    'prices' => json_encode($prices),
                    'quantities' => json_encode($quantities),
                    'updated_at' => now()
                ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No need to reverse this data fix
    }
};
