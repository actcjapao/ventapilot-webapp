<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;

use App\Models\User;

class AuthenticationController extends Controller
{
    function loadPage() {
        return inertia('login/Login');
    }

    function login(Request $request) {
        $rules = [
            'email' => 'required|email',
            'password' => 'required|string'
        ];

        $customErrorMessages = [
            'email.required' => 'Email is required.',
            'email.email' => 'Email must be a valid email address.',
            
            'password.required' => 'Password is required.',
            'password.string' => 'Password must be a string.'
        ];

        $request->validate($rules, $customErrorMessages);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            // Return 422 validation error
            return back()
                ->withErrors([
                    'email' => 'Invalid email or password.',
                ])
                ->with('error', 'Invalid email or password.');
        }

        $isValidPassword = Hash::check($request->password, $user->password);

        if (!$isValidPassword) {
            return back()
                ->withErrors([
                    'password' => 'Invalid email or password.',
                ])
                ->with('error', 'Invalid email or password.');
        }

        /**
         * Store only necessary user info in session, avoid storing sensitive info like password
         * Also be used in middleware to check if user is authenticated and to retrieve user info from DB
         */
        $rawTokenObject = [
            'account_id' => $user->account_id
        ];
        $userToken = Hash::make(json_encode($rawTokenObject));
        $authenticatedUser = (object) [
            'token' => $userToken,
            'uuid' => $user->uuid,
        ];

        session()->put('authenticated_user', $authenticatedUser);
        return back()->with('success', 'Logged in successfully.');
    }

    function logout() {
        if (session()->has('authenticated_user')) {
            session()->invalidate();
        }

        return redirect('/login');
    }
}

