<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AuthController extends Controller
{
    /**
     * Login user with email and password.
     */
    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if (!Auth::attempt($data)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $user = Auth::user();

        // Regenerate session to prevent fixation
        $request->session()->regenerate();

        return response()->json([
            'status' => 200,
            'message' => 'Logged in',
            'user' => $user
        ]);
    }

    /**
     * Logout the authenticated user.
     */
    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['status' => 200, 'message' => 'Logged out']);
    }

    /**
     * Return the authenticated user.
     */
    public function user(Request $request)
    {
        if (!$request->user()) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        return response()->json(['status' => 200, 'user' => $request->user()]);
    }
}
