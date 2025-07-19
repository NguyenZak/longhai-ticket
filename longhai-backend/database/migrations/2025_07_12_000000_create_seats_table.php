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
        Schema::create('seats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('events')->onDelete('cascade');
            $table->integer('row');
            $table->integer('column');
            $table->decimal('x', 10, 2); // X position on canvas
            $table->decimal('y', 10, 2); // Y position on canvas
            $table->decimal('width', 8, 2); // Seat width
            $table->decimal('height', 8, 2); // Seat height
            $table->enum('status', ['available', 'occupied', 'reserved', 'disabled'])->default('available');
            $table->decimal('price', 10, 2)->nullable(); // Seat price
            $table->string('category', 100)->nullable(); // Seat category (VIP, Premium, etc.)
            $table->string('color', 7)->default('#4CAF50'); // Seat color in hex format
            $table->string('ticket_type', 50)->nullable(); // Associated ticket type
            $table->string('seat_name', 50)->nullable(); // Custom seat name
            $table->string('row_name', 100)->nullable(); // Custom row name
            $table->timestamps();

            // Indexes for better performance
            $table->index(['event_id', 'row', 'column']);
            $table->index(['event_id', 'status']);
            $table->index(['event_id', 'ticket_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('seats');
    }
}; 