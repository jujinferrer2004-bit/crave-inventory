<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Item extends Model
{
    protected $fillable = [
        'name', 'category', 'qty', 'unit', 'low',
        'serial_number', 'barcode', 'supplier',
        'date_of_purchase', 'warranty_date',
    ];

    protected $casts = [
        'date_of_purchase' => 'date',
        'warranty_date' => 'date',
    ];

    public function activityLogs()
    {
        return $this->hasMany(ActivityLog::class);
    }
}
