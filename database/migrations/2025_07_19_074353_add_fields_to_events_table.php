<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->string('slug')->nullable()->unique()->after('title');
            $table->text('description')->nullable()->after('slug');
            $table->string('image')->nullable()->after('description');
            $table->string('venue')->nullable()->after('image');
            $table->string('location_detail')->nullable()->after('venue');
            $table->dateTime('start_date')->nullable()->after('location_detail');
            $table->dateTime('end_date')->nullable()->after('start_date');
            $table->string('time')->nullable()->after('end_date');
            $table->integer('total_seats')->nullable()->after('display_status');
            $table->integer('available_seats')->nullable()->after('total_seats');
            $table->double('price')->nullable()->after('available_seats');
            $table->string('price_display')->nullable()->after('price');
            $table->string('map_image')->nullable()->after('price_display');
            $table->text('artists')->nullable()->after('map_image');
            $table->text('ticket_prices')->nullable()->after('artists');
        });
    }

    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn([
                'slug', 'description', 'image', 'venue', 'location_detail',
                'start_date', 'end_date', 'time', 'total_seats', 'available_seats',
                'price', 'price_display', 'map_image', 'artists', 'ticket_prices'
            ]);
        });
    }
}; 