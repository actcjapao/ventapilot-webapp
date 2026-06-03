<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

// ADDED: Import User model
use App\Models\User;

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

        // ==================================================
        // ADDED SECTION START
        // ==================================================
        //
        // If authenticated:
        // 1. Load the latest User record from DB
        // 2. Load subscription together
        // 3. Make the User object available to downstream middleware/controllers
        //
        if ($isAuthenticated) {
            $sessionUser = session('authenticated_user');

            $user = User::with('subscription')
                ->where('uuid', $sessionUser->uuid)
                ->first();

            // User deleted from DB while session still exists
            if (!$user) {
                session()->forget('authenticated_user');

                return redirect('/login')
                    ->with('error', 'User account not found.');
            }

            /**
             * Store authenticated user into request attributes
             * so other middleware/controllers can access it
             * 
             * Upon logout, we don't need to clear this request attribute as $isAuthenticated will be false
             * and the middleware will redirect to login page
             */
            $request->attributes->set(
                'authenticated_user',
                $user
            );
        }
        //
        // ==================================================
        // ADDED SECTION END
        // ==================================================

        if ($isAuthenticated && in_array($path, ['login', 'registration'], true)) {
            return redirect('/dashboard');
        }

        return $next($request);
    }
}
