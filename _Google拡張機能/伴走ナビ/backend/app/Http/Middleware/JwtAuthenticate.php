<?php

namespace App\Http\Middleware;

use App\Models\User;
use App\Services\JwtService;
use Closure;
use Firebase\JWT\ExpiredException;
use Firebase\JWT\SignatureInvalidException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;
use UnexpectedValueException;

class JwtAuthenticate
{
    public function __construct(private JwtService $jwt) {}

    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if ($token === null || $token === '') {
            return response()->json(['message' => '認証トークンが必要です。'], 401);
        }

        try {
            $userId = $this->jwt->userIdFromToken($token);
            $user = User::query()->find($userId);

            if ($user === null) {
                return response()->json(['message' => 'ユーザーが見つかりません。'], 401);
            }

            Auth::setUser($user);
        } catch (ExpiredException) {
            return response()->json(['message' => 'トークンの有効期限が切れています。'], 401);
        } catch (SignatureInvalidException|UnexpectedValueException|\DomainException) {
            return response()->json(['message' => '無効なトークンです。'], 401);
        }

        return $next($request);
    }
}
