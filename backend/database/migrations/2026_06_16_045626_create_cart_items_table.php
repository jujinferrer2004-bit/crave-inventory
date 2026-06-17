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
        Schema::create('cart_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cart_id')->constrained()->onDelete('cascade');
            $table->foreignId('item_id')->nullable()->constrained()->nullOnDelete();
            $table->string('item_name');
            $table->string('category')->nullable();
            $table->integer('qty');
            $table->string('unit')->default('pcs');
            $table->integer('low')->default(5);
            $table->boolean('is_new')->default(false);
            $table->string('serial_number')->nullable();
            $table->string('barcode')->nullable();
            $table->string('supplier')->nullable();
            $table->date('date_of_purchase')->nullable();
            $table->date('warranty_date')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cart_items');
    }
};
