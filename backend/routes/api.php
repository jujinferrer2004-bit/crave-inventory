<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ItemController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\ActivityLogController;

// Public
Route::post('/login', [AuthController::class, 'login']);

// Protected
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Items
    Route::get('/items', [ItemController::class, 'index']);
    Route::delete('/items/{id}', [ItemController::class, 'destroy']);

    // Carts
    Route::get('/carts', [CartController::class, 'index']);
    Route::get('/carts/pending', [CartController::class, 'pending']);
    Route::post('/carts', [CartController::class, 'store']);
    Route::post('/carts/{id}/checkout', [CartController::class, 'checkout']);
    Route::post('/carts/{id}/approve', [CartController::class, 'approve']);
    Route::post('/carts/{id}/decline', [CartController::class, 'decline']);
    Route::delete('/carts/{id}', [CartController::class, 'destroy']);

    // Activity Log
    Route::get('/logs', [ActivityLogController::class, 'index']);
    Route::delete('/logs', [ActivityLogController::class, 'clear']);
});