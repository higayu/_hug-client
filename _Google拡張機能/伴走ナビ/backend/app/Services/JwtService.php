<?php

namespace App\Services;

use App\Models\User;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use UnexpectedValueException;

class JwtService
{
    public function issue(User $user): string
    {
        $now = time();
        $ttl = (int) config('jwt.ttl', 480);

        $payload = [
            'iss' => config('app.url'),
            'sub' => $user->user_id,
            'iat' => $now,
            'exp' => $now + ($ttl * 60),
            'email' => $user->email,
        ];

        return JWT::encode($payload, (string) config('jwt.secret'), (string) config('jwt.algo'));
    }

    public function decode(string $token): object
    {
        return JWT::decode($token, new Key((string) config('jwt.secret'), (string) config('jwt.algo')));
    }

    public function userIdFromToken(string $token): int
    {
        $payload = $this->decode($token);

        if (! isset($payload->sub)) {
            throw new UnexpectedValueException('Invalid token payload.');
        }

        return (int) $payload->sub;
    }
}
