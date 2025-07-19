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
        Schema::create('scrumboard_tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('scrumboard_projects')->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->json('tags')->nullable(); // Array of tags
            $table->string('priority')->default('medium'); // high, medium, low
            $table->string('assignee')->nullable();
            $table->integer('progress')->default(0); // 0-100
            $table->date('due_date')->nullable();
            $table->integer('order')->default(0);
            $table->boolean('has_image')->default(false);
            $table->string('image_path')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('scrumboard_tasks');
    }
};
