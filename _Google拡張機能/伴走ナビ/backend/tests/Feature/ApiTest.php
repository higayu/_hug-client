<?php

namespace Tests\Feature;

use App\Models\Facility;
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

    private function createUser(Facility $facility): User
    {
        return User::create([
            'facility_id' => $facility->facility_id,
            'name' => 'テスト職員',
            'email' => 'api-test@example.com',
            'password' => 'password',
            'role' => 'staff',
        ]);
    }

    public function test_facilities_index_returns_facility_list(): void
    {
        $facility = Facility::create(['name' => 'テスト事業所']);
        $user = $this->createUser($facility);

        $response = $this->withHeaders($this->authHeaders($user))
            ->getJson('/api/facilities');

        $response
            ->assertOk()
            ->assertJsonFragment(['name' => 'テスト事業所']);
    }

    public function test_support_records_search_by_child_id(): void
    {
        $facility = Facility::create(['name' => '検索テスト事業所']);
        $user = $this->createUser($facility);

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
        $facility = Facility::create(['name' => '登録テスト事業所']);
        $user = $this->createUser($facility);

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
}
