<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Restaurant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class OrderAnalyticsController extends Controller
{
    public function restaurantTrends(Request $request, $restaurantId)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);
        
        $startDate = $request->start_date;
        $endDate = $request->end_date;
        
        $dailyData = DB::select("
            SELECT 
                dates.date as date,
                COUNT(o.id) as ordersCount,
                COALESCE(SUM(o.order_amount), 0) as revenue,
                COALESCE(AVG(o.order_amount), 0) as avgOrderValue,
                (
                    SELECT hour(order_time)
                    FROM orders 
                    WHERE restaurant_id = ? 
                    AND DATE(order_time) = dates.date
                    GROUP BY hour(order_time)
                    ORDER BY COUNT(*) DESC
                    LIMIT 1
                ) as peakHour
            FROM (
                SELECT DISTINCT DATE(order_time) as date
                FROM orders
                WHERE restaurant_id = ?
                AND order_time BETWEEN ? AND ?
            ) as dates
            LEFT JOIN orders o ON DATE(o.order_time) = dates.date AND o.restaurant_id = ?
            GROUP BY dates.date
            ORDER BY dates.date
        ", [$restaurantId, $restaurantId, $startDate, $endDate, $restaurantId]);
        
        // Convert string values to numbers
        $dailyData = array_map(function($item) {
            return [
                'date' => $item->date,
                'ordersCount' => (int) $item->ordersCount,
                'revenue' => (float) $item->revenue,
                'avgOrderValue' => (float) $item->avgOrderValue,
                'peakHour' => $item->peakHour ? (int) $item->peakHour : null
            ];
        }, $dailyData);
        
        $summary = DB::select("
            SELECT 
                COUNT(*) as totalOrders, 
                COALESCE(SUM(order_amount), 0) as totalRevenue, 
                COALESCE(AVG(order_amount), 0) as avgOrderValue 
            FROM orders 
            WHERE restaurant_id = ?
            AND order_time BETWEEN ? AND ?
        ", [$restaurantId, $startDate, $endDate]);
        
        $summary = $summary[0] ?? [];
        
        // Convert summary values to numbers
        if ($summary) {
            $summary = [
                'totalOrders' => (int) $summary->totalOrders,
                'totalRevenue' => (float) $summary->totalRevenue,
                'avgOrderValue' => (float) $summary->avgOrderValue
            ];
        }
        
        return response()->json([
            'restaurant' => Restaurant::find($restaurantId),
            'trends' => $dailyData,
            'summary' => $summary
        ]);
    }
    
    public function topRestaurants(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);
        
        $startDate = $request->start_date;
        $endDate = $request->end_date; // Fixed: was $request->endDate
        
        $topRestaurants = DB::select("
            SELECT 
                r.id as restaurantId, 
                r.name as restaurantName, 
                r.location as restaurantLocation,  -- Changed: address → location
                COUNT(o.id) as totalOrders,
                COALESCE(SUM(o.order_amount), 0) as totalRevenue, 
                COALESCE(AVG(o.order_amount), 0) as avgOrderValue
            FROM restaurants r
            INNER JOIN orders o ON r.id = o.restaurant_id
            WHERE o.order_time BETWEEN ? AND ?
            GROUP BY r.id, r.name, r.location  -- Changed: address → location
            ORDER BY totalRevenue DESC
            LIMIT 3
        ", [$startDate, $endDate]);
        
        $formattedResults = array_map(function($item) {
            return [
                'restaurant' => [
                    'id' => $item->restaurantId,
                    'name' => $item->restaurantName,
                    'location' => $item->restaurantLocation, // Changed: address → location
                ],
                'total_revenue' => (float) $item->totalRevenue, // Fixed: was $item->total_revenue
                'total_orders' => (int) $item->totalOrders,
                'avg_order_value' => (float) $item->avgOrderValue,
            ];
        }, $topRestaurants);
            
        return response()->json($formattedResults);
    }
    
    public function filteredAnalytics(Request $request)
    {
        $query = "SELECT o.*, r.name as restaurantName, r.location as restaurantLocation  -- Changed: address → location
            FROM orders o
            LEFT JOIN restaurants r ON o.restaurant_id = r.id
            WHERE 1=1
        ";
        
        $params = [];
        
        if ($request->has('start_date') && $request->has('end_date')) {
            $query .= " AND o.order_time BETWEEN ? AND ?";
            $params[] = $request->start_date;
            $params[] = $request->end_date;
        }
        
        if ($request->has('restaurant_id') && $request->restaurant_id) {
            $query .= " AND o.restaurant_id = ?";
            $params[] = $request->restaurant_id;
        }
        
        if ($request->has('min_amount') && $request->min_amount) {
            $query .= " AND o.order_amount >= ?";
            $params[] = $request->min_amount;
        }
        if ($request->has('max_amount') && $request->max_amount) {
            $query .= " AND o.order_amount <= ?";
            $params[] = $request->max_amount;
        }

        if ($request->has('start_hour') && $request->has('end_hour')) {
            $query .= " AND HOUR(o.order_time) BETWEEN ? AND ?";
            $params[] = $request->start_hour;
            $params[] = $request->end_hour;
        }
        
        $query .= " ORDER BY o.order_time DESC";
        
        $countQuery = "SELECT COUNT(*) as total FROM (" . str_replace('o.*, r.name as restaurantName, r.location as restaurantLocation', 'o.id', $query) . ") as countTable";
        $total = DB::select($countQuery, $params)[0]->total;
        
        $perPage = $request->get('per_page', 20);
        $page = $request->get('page', 1);
        $offset = ($page - 1) * $perPage;
        
        $query .= " LIMIT ? OFFSET ?";
        $params[] = $perPage;
        $params[] = $offset;
        
        $results = DB::select($query, $params);
        
        $formattedResults = array_map(function($item) {
            return [
                'id' => $item->id,
                'restaurant_id' => $item->restaurant_id, // Fixed: was restaurantId
                'order_time' => $item->order_time, // Fixed: was orderTime
                'order_amount' => $item->order_amount, // Fixed: was orderAmount
                'restaurant' => [
                    'id' => $item->restaurant_id, // Fixed: was restaurantId
                    'name' => $item->restaurantName,
                    'location' => $item->restaurantLocation, // Changed: address → location
                ]
            ];
        }, $results);
        
        return response()->json([
            'data' => $formattedResults,
            'total' => $total,
            'per_page' => $perPage,
            'current_page' => $page,
            'last_page' => ceil($total / $perPage)
        ]);
    }
}