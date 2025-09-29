<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Restaurant extends Model
{
    use HasFactory;

    protected $fillable = ['id', 'name', 'location', 'cuisine'];
    public $incrementing = false;
    protected $keyType = 'int';

    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}