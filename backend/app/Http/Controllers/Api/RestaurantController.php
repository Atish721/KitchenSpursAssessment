<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RestaurantController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = DB::table('restaurants')
                ->select('id', 'name', 'location', 'cuisine');
            
            // Search
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('location', 'like', "%{$search}%")
                      ->orWhere('cuisine', 'like', "%{$search}%");
                });
            }
            
            // Filter by cuisine
            if ($request->has('cuisine') && $request->cuisine) {
                $query->where('cuisine', $request->cuisine);
            }
            
            // Filter by location
            if ($request->has('location') && $request->location) {
                $query->where('location', $request->location);
            }
            
            // Sorting
            $sortBy = $request->get('sort_by', 'name');
            $sortOrder = $request->get('sort_order', 'asc');
            $query->orderBy($sortBy, $sortOrder);
            
            $restaurants = $query->get();
            
            return response()->json([
                'success' => true,
                'data' => $restaurants,
                'total' => $restaurants->count()
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch restaurants',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    public function show($id)
    {
        try {
            $restaurant = DB::table('restaurants')->where('id', $id)->first();
            
            if (!$restaurant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Restaurant not found'
                ], 404);
            }
            
            // Get orders for this restaurant
            $orders = DB::table('orders')
                ->where('restaurant_id', $id)
                ->select('id', 'order_amount', 'order_time')
                ->get();
            
            return response()->json([
                'success' => true,
                'data' => [
                    'restaurant' => $restaurant,
                    'orders' => $orders,
                    'orders_count' => $orders->count(),
                    'total_revenue' => $orders->sum('order_amount')
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch restaurant',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}