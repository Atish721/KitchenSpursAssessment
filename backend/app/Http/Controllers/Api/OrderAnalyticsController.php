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
            select 
                dates.date as date,
                count(o.id) as ordersCount,
                coalesce(sum(o.order_amount), 0) as revenue,
                coalesce(avg(o.order_amount), 0) as avgOrderValue,
                (
                    select hour(order_time)
                    from orders 
                    where restaurant_id = ? 
                    and date(order_time) = dates.date
                    group by hour(order_time)
                    order by count(*) desc
                    limit 1
                ) as peakHour
            from (
                select distinct date(order_time) as date
                from orders
                where restaurant_id = ?
                and order_time between ? and ?
            ) as dates
            left join orders o on date(o.order_time) = dates.date and o.restaurant_id = ?
            group by dates.date
            order by dates.date
        ", [$restaurantId, $restaurantId, $startDate, $endDate, $restaurantId]);
        
    
        
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
            select 
                count(*) as totalOrders, 
                coalesce(sum(order_amount), 0) as totalRevenue, 
                coalesce(avg(order_amount), 0) as avgOrderValue 
            from orders 
            where restaurant_id = ?
            and order_time between ? and ?
        ", [$restaurantId, $startDate, $endDate]);
        
        $summary = $summary[0] ?? [];
        
 
        
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
        $endDate = $request->end_date;
        
        $topRestaurants = DB::select("
            select 
                r.id as restaurantId, 
                r.name as restaurantName, 
                r.location as restaurantLocation, 
                COUNT(o.id) as totalOrders,
                coalesce(sum(o.order_amount), 0) as totalRevenue, 
                coalesce(avg(o.order_amount), 0) as avgOrderValue
            from restaurants r
            inner join orders o ON r.id = o.restaurant_id
            where o.order_time between ? and ?
            group by r.id, r.name, r.location
            order by totalRevenue desc
            limit 3
        ", [$startDate, $endDate]);
        
        $formattedResults = array_map(function($item) {
            return [
                'restaurant' => [
                    'id' => $item->restaurantId,
                    'name' => $item->restaurantName,
                    'location' => $item->restaurantLocation,
                ],
                'total_revenue' => (float) $item->totalRevenue, 
                'total_orders' => (int) $item->totalOrders,
                'avg_order_value' => (float) $item->avgOrderValue,
            ];
        }, $topRestaurants);
            
        return response()->json($formattedResults);
    }
    
    public function filteredAnalytics(Request $request)
    {
        $query = "select o.*, r.name as restaurantName, r.location as restaurantLocation
            from orders o
            left join restaurants r on o.restaurant_id = r.id
            where 1=1
        ";
        
        $params = [];
        
        if ($request->has('start_date') && $request->has('end_date')) {
            $query .= " and o.order_time between ? and ?";
            $params[] = $request->start_date;
            $params[] = $request->end_date;
        }
        
        if ($request->has('restaurant_id') && $request->restaurant_id) {
            $query .= " and o.restaurant_id = ?";
            $params[] = $request->restaurant_id;
        }
        
        if ($request->has('min_amount') && $request->min_amount) {
            $query .= " and o.order_amount >= ?";
            $params[] = $request->min_amount;
        }
        if ($request->has('max_amount') && $request->max_amount) {
            $query .= " and o.order_amount <= ?";
            $params[] = $request->max_amount;
        }

        if ($request->has('start_hour') && $request->has('end_hour')) {
            $query .= " and hour(o.order_time) between ? and ?";
            $params[] = $request->start_hour;
            $params[] = $request->end_hour;
        }
        
        $query .= " order by o.order_time desc";
        
        $countQuery = "select count(*) as total from (" . str_replace('o.*, r.name as restaurantName, r.location as restaurantLocation', 'o.id', $query) . ") as countTable";
        $total = DB::select($countQuery, $params)[0]->total;
        
        $perPage = $request->get('per_page', 20);
        $page = $request->get('page', 1);
        $offset = ($page - 1) * $perPage;
        
        $query .= " limit ? offset ?";
        $params[] = $perPage;
        $params[] = $offset;
        
        $results = DB::select($query, $params);
        
        $formattedResults = array_map(function($item) {
            return [
                'id' => $item->id,
                'restaurant_id' => $item->restaurant_id,  
                'order_time' => $item->order_time, 
                'order_amount' => $item->order_amount, 
                'restaurant' => [
                    'id' => $item->restaurant_id, 
                    'name' => $item->restaurantName,
                    'location' => $item->restaurantLocation,
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