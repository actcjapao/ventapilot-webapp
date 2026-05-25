<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AuthenticationMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        $isAuthenticated = session()->has('authenticated_user');
        // trim the leading and trailing slashes
        $path = trim($request->path(), '/');
        $guestPaths = [
            'login',
            'registration',
            'api/login',
            'api/register',
        ];

        if (!$isAuthenticated && !in_array($path, $guestPaths, true)) {
            // Guard for API routes: Return JSON response if the request expects JSON or is an API route
            if ($request->wantsJson() || $request->is('api/*')) {
                return response()->json([
                    'message' => 'Unauthenticated.',
                ], 401);
            }

            return redirect('/login')->with('error', 'Kindly authenticate yourself first.');
        }

        if ($isAuthenticated && in_array($path, ['login', 'registration'], true)) {
            return redirect('/dashboard');
        }

        return $next($request);
    }
}
