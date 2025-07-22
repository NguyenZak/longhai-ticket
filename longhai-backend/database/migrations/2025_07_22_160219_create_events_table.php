<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('venue')->nullable();
            $table->dateTime('start_date')->nullable();
            $table->dateTime('end_date')->nullable();
            $table->text('description')->nullable();
            $table->string('banner')->nullable();
            $table->string('status')->default('draft');
            $table->decimal('min_price', 10, 2)->nullable();
            $table->decimal('max_price', 10, 2)->nullable();
            $table->string('price_range_display')->nullable();
            $table->string('price_display')->nullable();
            $table->json('artists')->nullable();
            $table->json('ticket_prices')->nullable();
            $table->string('slug')->unique();
            $table->string('time')->nullable();
            $table->string('location_detail')->nullable();
            $table->integer('total_seats')->nullable();
            $table->integer('available_seats')->nullable();
            $table->string('image')->nullable();
            $table->string('map_image')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('events');
    }
}; 