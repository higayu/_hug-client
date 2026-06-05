<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CorsMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $origin = $request->headers->get('Origin');
        $allowOrigin = $this->resolveAllowOrigin($origin);

        if ($request->isMethod('OPTIONS')) {
            return response('', 204)
                ->header('Access-Control-Allow-Origin', $allowOrigin)
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization, X-Requested-With')
                ->header('Access-Control-Allow-Credentials', 'true');
        }

        $response = $next($request);
        $response->headers->set('Access-Control-Allow-Origin', $allowOrigin);
        $response->headers->set('Access-Control-Allow-Credentials', 'true');

        return $response;
    }

    private function resolveAllowOrigin(?string $origin): string
    {
        if ($origin === null || $origin === '') {
            return '*';
        }

        if (
            str_starts_with($origin, 'chrome-extension://')
            || str_starts_with($origin, 'http://localhost')
            || str_starts_with($origin, 'http://127.0.0.1')
            || preg_match('#^https?://192\.168\.#', $origin) === 1
        ) {
            return $origin;
        }

        return '*';
    }
}
