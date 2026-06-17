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
        Schema::create('items', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('category')->default('Other');
            $table->integer('qty')->default(0);
            $table->string('unit')->default('pcs');
            $table->integer('low')->default(5);
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
        Schema::dropIfExists('items');
    }
};
