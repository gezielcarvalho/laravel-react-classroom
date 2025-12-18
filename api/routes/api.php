<?php

use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Use RESTful resource routes for students
Route::apiResource('students', StudentController::class);

Route::middleware('web')->group(function () {
    // Ensure session middleware is present for cookie-based (Sanctum) auth flows
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
});

Route::post('/password/forgot', [\App\Http\Controllers\Api\PasswordResetController::class, 'sendResetLink']);
Route::post('/password/reset', [\App\Http\Controllers\Api\PasswordResetController::class, 'reset']);

Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::get('/user', [AuthController::class, 'user'])->middleware('auth:sanctum');
