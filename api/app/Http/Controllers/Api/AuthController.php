<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Laravel\Sanctum\PersonalAccessToken;

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

        // Regenerate session to prevent fixation if session is available
        if ($request->hasSession()) {
            $request->session()->regenerate();
        }

        return response()->json([
            'status' => 200,
            'message' => 'Logged in',
            'user' => $user
        ]);
    }

    /**
     * Register a new user.
     */
    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ]);

        return response()->json([
            'status' => 201,
            'message' => 'User registered',
            'user' => $user
        ], 201);
    }

    /**
     * Logout the authenticated user.
     */
    public function logout(Request $request)
    {
        // If this request is using token-based auth, try to delete the current access token
        if ($request->user() && method_exists($request->user(), 'currentAccessToken')) {
            $token = $request->user()->currentAccessToken();
            // transient tokens (used by Sanctum for certain flows) do not implement delete()
            if ($token && method_exists($token, 'delete')) {
                $token->delete();
            }
        }

        // Prefer logging out of the session-based 'web' guard when available
        $webGuard = Auth::guard('web');
        if (method_exists($webGuard, 'logout')) {
            $webGuard->logout();
        }

        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        // If token-based auth was used but currentAccessToken isn't available for deletion,
        // try to find and delete the token using Sanctum's findToken helper (handles plain tokens).
        $plainBearer = $request->bearerToken();
        if ($plainBearer) {
            $tokenModel = PersonalAccessToken::findToken($plainBearer);
            if ($tokenModel) {
                $tokenModel->delete();
            }
        }

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
