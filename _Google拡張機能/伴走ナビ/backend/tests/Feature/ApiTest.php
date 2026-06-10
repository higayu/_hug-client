<?php

namespace Tests\Feature;

use App\Models\SupportRecord;
use App\Models\User;
use App\Services\JwtService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiTest extends TestCase
{
    use RefreshDatabase;

    private function authHeaders(User $user): array
    {
        $token = app(JwtService::class)->issue($user);

        return ['Authorization' => 'Bearer '.$token];
    }

    private function createUser(): User
    {
        return User::create([
            'name' => 'テスト職員',
            'email' => 'api-test@example.com',
            'password' => 'password',
            'role' => 'staff',
        ]);
    }

    public function test_support_records_search_by_child_id(): void
    {
        $user = $this->createUser();

        SupportRecord::create([
            'child_id' => 10,
            'user_id' => $user->user_id,
            'content' => 'テスト記録',
            'target_date' => '2026-05-01',
        ]);

        $response = $this->withHeaders($this->authHeaders($user))
            ->getJson('/api/support_records/_search?pk=child_id&values=10');

        $response
            ->assertOk()
            ->assertJsonFragment(['content' => 'テスト記録', 'child_id' => 10]);
    }

    public function test_support_records_store_creates_record(): void
    {
        $user = $this->createUser();

        $response = $this->withHeaders($this->authHeaders($user))
            ->postJson('/api/support_records', [
                'child_id' => 5,
                'user_id' => $user->user_id,
                'content' => '新規記録',
                'target_date' => '2026-06-01',
            ]);

        $response
            ->assertCreated()
            ->assertJsonFragment(['content' => '新規記録', 'child_id' => 5]);

        $this->assertDatabaseHas('support_records', [
            'child_id' => 5,
            'content' => '新規記録',
        ]);
    }

    public function test_support_records_bulk_store_creates_and_updates_records(): void
    {
        $user = $this->createUser();

        SupportRecord::create([
            'child_id' => 10,
            'user_id' => $user->user_id,
            'content' => '既存記録',
            'target_date' => '2026-05-01',
        ]);

        $response = $this->withHeaders($this->authHeaders($user))
            ->postJson('/api/support_records/bulk', [
                'records' => [
                    [
                        'child_id' => 10,
                        'user_id' => $user->user_id,
                        'target_date' => '2026-05-01',
                        'content' => '更新後の記録',
                    ],
                    [
                        'child_id' => 10,
                        'user_id' => $user->user_id,
                        'target_date' => '2026-05-02',
                        'content' => '新規一括記録',
                    ],
                ],
            ]);

        $response
            ->assertCreated()
            ->assertJson([
                'created' => 1,
                'updated' => 1,
                'total' => 2,
            ]);

        $this->assertDatabaseHas('support_records', [
            'child_id' => 10,
            'target_date' => '2026-05-01',
            'content' => '更新後の記録',
        ]);

        $this->assertDatabaseHas('support_records', [
            'child_id' => 10,
            'target_date' => '2026-05-02',
            'content' => '新規一括記録',
        ]);
    }
}
