<?php

namespace Database\Seeders;

use App\Models\Restaurant;
use App\Models\Order;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        // Seed restaurants
        $restaurants = [
            ['id' => 101, 'name' => 'Tandoori Treats', 'location' => 'Bangalore', 'cuisine' => 'North Indian'],
            ['id' => 102, 'name' => 'Sushi Bay', 'location' => 'Mumbai', 'cuisine' => 'Japanese'],
            ['id' => 103, 'name' => 'Pasta Palace', 'location' => 'Delhi', 'cuisine' => 'Italian'],
            ['id' => 104, 'name' => 'Burger Hub', 'location' => 'Hyderabad', 'cuisine' => 'American'],
        ];

        foreach ($restaurants as $restaurant) {
            Restaurant::create($restaurant);
        }

        // Seed orders (using the provided data)
        $orders = json_decode(file_get_contents(database_path('data/orders.json')), true);
        
        foreach ($orders as $order) {
            Order::create([
                'restaurant_id' => $order['restaurant_id'],
                'order_amount' => $order['order_amount'],
                'order_time' => Carbon::parse($order['order_time']),
            ]);
        }
    }
}