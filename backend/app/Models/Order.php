<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = ['id', 'restaurant_id', 'order_amount', 'order_time'];
    public $incrementing = false;
    protected $keyType = 'int';

    protected $casts = [
        'order_time' => 'datetime',
        'order_amount' => 'decimal:2',
    ];

    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class);
    }
}