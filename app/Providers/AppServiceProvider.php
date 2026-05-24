<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Share authenticated user saved in session by AuthenticationController
        // Purpose: To make authenticated user data available globally in all Inertia views without needing to pass it explicitly from each controller method.
        Inertia::share('auth', function () {
            $user = session()->get('authenticated_user');

            return [
                'user' => $user ? (array) $user : null,
            ];
        });
    }
}
