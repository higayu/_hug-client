<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    private function createUser(string $email = 'test@example.com', string $password = 'password'): User
    {
        return User::create([
            'name' => 'テスト職員',
            'email' => $email,
            'password' => Hash::make($password),
            'role' => 'staff',
        ]);
    }

    public function test_login_returns_jwt_token(): void
    {
        $this->createUser();

        $response = $this->postJson('/api/auth/login', [
            'email' => 'test@example.com',
            'password' => 'password',
        ]);

        $response
            ->assertOk()
            ->assertJsonStructure([
                'access_token',
                'token_type',
                'expires_in',
                'user' => ['user_id', 'name', 'email', 'role'],
            ]);
    }

    public function test_login_fails_with_invalid_credentials(): void
    {
        $this->createUser();

        $response = $this->postJson('/api/auth/login', [
            'email' => 'test@example.com',
            'password' => 'wrong-password',
        ]);

        $response->assertUnauthorized();
    }

    public function test_protected_route_requires_token(): void
    {
        $this->getJson('/api/support_records/_search?pk=child_id&values=1')->assertUnauthorized();
    }

    public function test_me_returns_authenticated_user(): void
    {
        $user = $this->createUser();

        $login = $this->postJson('/api/auth/login', [
            'email' => 'test@example.com',
            'password' => 'password',
        ]);

        $token = $login->json('access_token');

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonFragment([
                'email' => $user->email,
                'name' => $user->name,
            ]);
    }
}
