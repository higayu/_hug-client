<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SupportRecordController;
use App\Http\Middleware\JwtAuthenticate;
use Illuminate\Support\Facades\Route;

Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware(JwtAuthenticate::class)->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::get('/support_records/_search', [SupportRecordController::class, 'search']);
    Route::post('/support_records/bulk', [SupportRecordController::class, 'bulkStore']);
    Route::post('/support_records', [SupportRecordController::class, 'store']);
});
