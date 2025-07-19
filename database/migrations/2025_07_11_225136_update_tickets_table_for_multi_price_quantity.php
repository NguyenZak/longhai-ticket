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
        Schema::table('tickets', function (Blueprint $table) {
            $table->string('name')->after('event_id');
            $table->string('color')->nullable()->after('name');
            $table->json('prices')->nullable()->after('color');
            $table->json('quantities')->nullable()->after('prices');
            $table->string('status')->default('preparing')->after('quantities');
            $table->text('description')->nullable()->after('status');
            // Xoá các trường price, quantity cũ nếu có
            if (Schema::hasColumn('tickets', 'price')) {
                $table->dropColumn('price');
            }
            if (Schema::hasColumn('tickets', 'quantity')) {
                $table->dropColumn('quantity');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->dropColumn(['name', 'color', 'prices', 'quantities', 'status', 'description']);
            // Có thể thêm lại price, quantity nếu cần
            // $table->decimal('price', 12, 2)->nullable();
            // $table->integer('quantity')->nullable();
        });
    }
}; 