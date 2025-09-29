<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Restaurant;
use Illuminate\Http\Request;

class RestarurantController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('per_page',10);
        $page = $request->get('page',1);
        $offset = ($page-1) * $perPage;

        $params = [];
        $where = 'where 1=1';

        if($request->search)
        {
            $search = "%{$request->search}%";
            $where .=" and (name like ? or location like ? or cuisine like ?)";
             array_push($params, $search, $search, $search);
        }

        if($request->cuisine)
        {
            $where .= ' and cuisine = ? ';
            $params[] = $request->cuisine;
        }

        if($request->location)
        {
            $where .= ' and location = ? ';
            $params[] = $request->location;
        }


        $sortBy = in_array($request->sort_by,['name','location', 'cuisine']) ? $request->sort_by : 'name';

        $sortOrder = $request->sort_order == 'desc' ? 'desc' : 'asc';

        $sql = "select name, location, cuisine, count(*) over() as totalCount from restaurants {$where} order by {$sortBy} {$sortOrder} limit ? offset ? ";
        $params[] = $perPage;
        $params[] = $offset;


        $results = DB::select($sql,$params);

        if(empty($results))
        {
            return $this->paginatedResponse([],0,$page,$perPage);
        }

        $total = $results[0]->totalCount;

        $data = array_map(function($item)
        {
            unset($item->totalCount);
            return item;
        },$results);


        return $this->paginatedResponse($data,$total,$page,$perPage);

    }

    public function show($id)
    {
        $result = DB::select('select name, location, cuisine from restaurants where id = ? ',[$id]);

        if(empty($result))
        {
            abort(404);
        }

        $restaurant = $result[0];

        $restaurant->orders = DB::select('select id, restaurant_id,order_amount,order_time  from orders where restaurant_id = ? ', [$id]);

        return $restaurant;
    }

     private function paginatedResponse($data, $total, $page, $perPage)
    {
        return [
            'data' => $data,
            'current_page' => $page,
            'last_page' => ceil($total / $perPage),
            'per_page' => $perPage,
            'total' => $total,
        ];
    }
}
