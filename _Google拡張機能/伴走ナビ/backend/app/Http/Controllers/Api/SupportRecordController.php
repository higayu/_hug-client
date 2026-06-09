<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SupportRecord;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SupportRecordController extends Controller
{
    public function search(Request $request): JsonResponse
    {
        $pk = $request->query('pk');
        $values = $request->query('values');

        if ($pk !== 'child_id' || $values === null || $values === '') {
            return response()->json(['error' => 'pk=child_id と values が必要です'], 400);
        }

        $records = SupportRecord::query()
            ->where('child_id', $values)
            ->orderByDesc('target_date')
            ->get();

        return response()->json($records);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'child_id' => ['required', 'integer'],
            'user_id' => ['required', 'integer'],
            'content' => ['required', 'string'],
            'target_date' => ['required', 'date'],
        ]);

        $record = SupportRecord::updateOrCreate(
            [
                'child_id' => $validated['child_id'],
                'target_date' => $validated['target_date'],
            ],
            [
                'user_id' => $validated['user_id'],
                'content' => $validated['content'],
            ]
        );

        return response()->json($record, $record->wasRecentlyCreated ? 201 : 200);
    }
}
