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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();

            $table->unsignedBigInteger('store_id');
            $table->string('name');
            $table->string('brand')->nullable();
            $table->text('description')->nullable();
            $table->unsignedInteger('stock_quantity')->default(0); // less storage space data type
            $table->decimal('cost_price', 10, 2)->default(0.00); // 10 digits total, 2 after decimal
            $table->decimal('selling_price', 10, 2)->default(0.00); // 10 digits total, 2 after decimal
            $table->json('tags')->nullable();
            $table->boolean('is_active')->default(true);

            $table->timestamps();

            $table->foreign('store_id')->references('id')->on('stores')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
