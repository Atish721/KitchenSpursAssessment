<?php

use App\Http\Controllers\Api\RestaurantController;
use App\Http\Controllers\Api\OrderAnalyticsController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/restaurants', [RestaurantController::class, 'index']);
Route::get('/restaurants/{id}', [RestaurantController::class, 'show']);

Route::get('/analytics/restaurant/{restaurantId}/trends', [OrderAnalyticsController::class, 'restaurantTrends']);
Route::get('/analytics/top-restaurants', [OrderAnalyticsController::class, 'topRestaurants']);
Route::get('/analytics/filtered', [OrderAnalyticsController::class, 'filteredAnalytics']);