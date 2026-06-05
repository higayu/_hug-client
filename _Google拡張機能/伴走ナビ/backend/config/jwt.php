<?php

return [
    'secret' => env('JWT_SECRET', env('APP_KEY')),
    'algo' => env('JWT_ALGO', 'HS256'),
    'ttl' => (int) env('JWT_TTL', 480),
];
