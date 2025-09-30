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
            $whereConditions = [];
            $params = [];

       
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $whereConditions[] = "(name like ? or location like ? or cuisine like ?)";
                $params[] = "%{$search}%";
                $params[] = "%{$search}%";
                $params[] = "%{$search}%";
            }
            
         
            if ($request->has('cuisine') && $request->cuisine) {
                $whereConditions[] = "cuisine = ?";
                $params[] = $request->cuisine;
            }
            
        
            if ($request->has('location') && $request->location) {
                $whereConditions[] = "location = ?";
                $params[] = $request->location;
            }

            
            $whereClause = "";
            if (!empty($whereConditions)) {
                $whereClause = " where " . implode(" AND ", $whereConditions);
            }

           
            $sortBy = $request->get('sort_by', 'name');
            $sortOrder = $request->get('sort_order', 'asc');
            $allowedSortColumns = ['name', 'location', 'cuisine'];
            $sortBy = in_array($sortBy, $allowedSortColumns) ? $sortBy : 'name';
            $sortOrder = strtolower($sortOrder) === 'desc' ? 'DESC' : 'ASC';

          
            $perPage = $request->get('per_page', 10);
            $page = $request->get('page', 1);
            $offset = ($page - 1) * $perPage;

           
            $query = "
                select id, name, location, cuisine from restaurants
                {$whereClause}
                order by {$sortBy} {$sortOrder}
                limit ? offset ?
            ";

            $params[] = $perPage;
            $params[] = $offset;

            $restaurants = DB::select($query, $params);
            
           
            $totalResult = DB::select("select FOUND_ROWS() as total");
            $total = $totalResult[0]->total;

          
            $lastPage = ceil($total / $perPage);
            $from = ($page - 1) * $perPage + 1;
            $to = min($page * $perPage, $total);

            return response()->json([
                'success' => true,
                'data' => $restaurants,
                'pagination' => [
                    'current_page' => (int)$page,
                    'per_page' => (int)$perPage,
                    'total' => (int)$total,
                    'last_page' => (int)$lastPage,
                    'from' => (int)$from,
                    'to' => (int)$to,
                ]
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
           
            $restaurantQuery = "select id, name, location, cuisine from restaurants where id = ?";
            $restaurantResult = DB::select($restaurantQuery, [$id]);
            
            if (empty($restaurantResult)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Restaurant not found'
                ], 404);
            }
            
            $restaurant = $restaurantResult[0];
            
       
            $ordersQuery = "select id, order_amount, order_time from orders where restaurant_id = ? order by order_time desc";
            $orders = DB::select($ordersQuery, [$id]);
            
       
            $ordersCount = count($orders);
            $totalRevenue = 0;
            foreach ($orders as $order) {
                $totalRevenue += $order->order_amount;
            }
            
            return response()->json([
                'success' => true,
                'data' => [
                    'restaurant' => $restaurant,
                    'orders' => $orders,
                    'orders_count' => $ordersCount,
                    'total_revenue' => $totalRevenue
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