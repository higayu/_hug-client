<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SupportRecord;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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
            'target_date' => ['required', 'date'],
            'child_id' => ['required', 'integer'],
            'user_id' => ['required', 'integer'],
            'user_name' => ['nullable', 'string', 'max:255'],
            'content' => ['required', 'string'],
        ]);

        $record = DB::transaction(function () use ($validated) {
            $this->ensureUserExists(
                userId: (int) $validated['user_id'],
                userName: $validated['user_name'] ?? null,
            );

            return SupportRecord::updateOrCreate(
                [
                    'child_id' => (int) $validated['child_id'],
                    'target_date' => $validated['target_date'],
                ],
                [
                    'user_id' => (int) $validated['user_id'],
                    'content' => $validated['content'],
                ],
            );
        });

        return response()->json($record, $record->wasRecentlyCreated ? 201 : 200);
    }

    public function bulkStore(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'records' => ['required', 'array', 'min:1'],
            'records.*.target_date' => ['required', 'date'],
            'records.*.child_id' => ['required', 'integer'],
            'records.*.user_id' => ['required', 'integer'],
            'records.*.user_name' => ['nullable', 'string', 'max:255'],
            'records.*.content' => ['required', 'string'],
        ]);

        $created = 0;
        $updated = 0;
        $usersCreated = 0;

        DB::transaction(function () use ($validated, &$created, &$updated, &$usersCreated) {
            foreach ($validated['records'] as $item) {
                $user = $this->ensureUserExists(
                    userId: (int) $item['user_id'],
                    userName: $item['user_name'] ?? null,
                );

                if ($user->wasRecentlyCreated) {
                    $usersCreated++;
                }

                $record = SupportRecord::updateOrCreate(
                    [
                        'child_id' => (int) $item['child_id'],
                        'target_date' => $item['target_date'],
                    ],
                    [
                        'user_id' => (int) $item['user_id'],
                        'content' => $item['content'],
                    ],
                );

                if ($record->wasRecentlyCreated) {
                    $created++;
                } else {
                    $updated++;
                }
            }
        });

        return response()->json([
            'created' => $created,
            'updated' => $updated,
            'users_created' => $usersCreated,
            'total' => $created + $updated,
        ], 201);
    }

    private function ensureUserExists(int $userId, ?string $userName = null): User
    {
        return User::firstOrCreate(
            [
                'user_id' => $userId,
            ],
            [
                'name' => $userName ?: ('HUG職員_' . $userId),
                'login_id' => null,
                'hug_password' => null,
                'email' => null,
                'password' => null,
                'role' => 'staff',
            ],
        );
    }
}
