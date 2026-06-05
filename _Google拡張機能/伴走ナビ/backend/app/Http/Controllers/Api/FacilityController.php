<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Facility;
use Illuminate\Http\JsonResponse;

class FacilityController extends Controller
{
    public function index(): JsonResponse
    {
        $facilities = Facility::query()
            ->orderBy('facility_id')
            ->get(['facility_id', 'name']);

        return response()->json($facilities);
    }
}
