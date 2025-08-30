<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Redis;
use Symfony\Component\HttpFoundation\Response;

class BookingRateLimiter
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $key = 'booking:' . ($user ? $user->id : $request->ip());
        
        $maxAttempts = 10; // 10 bookings per hour
        $decayMinutes = 60;
        
        if (RateLimiter::tooManyAttempts($key, $maxAttempts)) {
            $retryAfter = RateLimiter::availableIn($key);
            
            return response()->json([
                'error' => 'Too many booking attempts. Please try again later.',
                'retry_after' => $retryAfter,
                'max_attempts' => $maxAttempts,
            ], 429);
        }
        
        RateLimiter::hit($key, $decayMinutes * 60);
        
        // Add rate limit headers
        $response = $next($request);
        $response->headers->add([
            'X-RateLimit-Limit' => $maxAttempts,
            'X-RateLimit-Remaining' => RateLimiter::remaining($key, $maxAttempts),
            'X-RateLimit-Reset' => RateLimiter::availableIn($key),
        ]);
        
        return $response;
    }
}
