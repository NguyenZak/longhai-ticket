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
        Schema::create('events', function (Blueprint $table) {
            $table->increments('id');
            $table->string('title');
            $table->string('slug')->nullable()->unique();
            $table->text('description')->nullable();
            $table->string('image')->nullable();
            $table->string('venue')->nullable();
            $table->string('location_detail')->nullable();
            $table->dateTime('start_date')->nullable();
            $table->dateTime('end_date')->nullable();
            $table->string('time')->nullable();
            $table->string('status')->default('preparing');
            $table->string('display_status')->nullable();
            $table->integer('total_seats')->nullable();
            $table->integer('available_seats')->nullable();
            $table->double('price')->nullable();
            $table->string('price_display')->nullable();
            $table->string('map_image')->nullable();
            $table->text('artists')->nullable();
            $table->text('ticket_prices')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('events');
    }
}; 