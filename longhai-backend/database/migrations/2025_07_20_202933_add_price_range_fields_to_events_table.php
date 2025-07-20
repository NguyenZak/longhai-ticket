<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->decimal('min_price', 10, 2)->nullable()->after('price_display');
            $table->decimal('max_price', 10, 2)->nullable()->after('min_price');
            $table->string('price_range_display')->nullable()->after('max_price');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn(['min_price', 'max_price', 'price_range_display']);
        });
    }
};
