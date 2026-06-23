<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CartItem extends Model
{
    protected $fillable = [
        'cart_id', 'item_id', 'item_name', 'category',
        'qty', 'unit', 'low', 'is_new',
        'serial_number', 'serial_numbers', 'barcode', 'supplier',
        'date_of_purchase', 'warranty_date',
    ];

    protected $casts = [
        'is_new' => 'boolean',
        'date_of_purchase' => 'date',
        'warranty_date' => 'date',
        'serial_numbers' => 'array',
    ];
}
