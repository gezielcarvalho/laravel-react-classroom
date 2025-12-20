<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Laravel\Sanctum\PersonalAccessToken;
use Illuminate\Support\Facades\Cache;

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
            'captcha_token' => 'nullable|string',
            'captcha_answer' => 'nullable|numeric',
        ]);

        // Respect environment toggle: only enforce captcha when enabled
        $captchaEnabled = env('CAPTCHA_ENABLED', false);

        // Simple per-IP rate limiting for login attempts
        $ip = $request->ip();
        $attemptsKey = "login:attempts:{$ip}";
        $attempts = (int) Cache::get($attemptsKey, 0);
        $maxAttempts = 6;
        if ($attempts >= $maxAttempts) {
            return response()->json(['message' => 'Too many login attempts. Try again later.'], 429);
        }

        // If captcha is enabled, validate token+answer
        if ($captchaEnabled) {
            if (empty($data['captcha_token']) || !isset($data['captcha_answer'])) {
                Cache::put($attemptsKey, $attempts + 1, now()->addMinutes(15));
                return response()->json(['message' => 'Captcha required'], 422);
            }

            $entry = Cache::get("captcha:{$data['captcha_token']}");
            if (!$entry) {
                Cache::put($attemptsKey, $attempts + 1, now()->addMinutes(15));
                return response()->json(['message' => 'Captcha expired or invalid'], 422);
            }

            if ((int) $entry['answer'] !== (int) $data['captcha_answer']) {
                // increment attempts and persist
                $entry['tries'] = ($entry['tries'] ?? 0) + 1;
                Cache::put("captcha:{$data['captcha_token']}", $entry, now()->addMinutes(15));
                Cache::put($attemptsKey, $attempts + 1, now()->addMinutes(15));
                return response()->json(['message' => 'Invalid captcha'], 422);
            }

            // success: remove captcha and continue
            Cache::forget("captcha:{$data['captcha_token']}");
        }

        if (!Auth::attempt(['email' => $data['email'], 'password' => $data['password']])) {
            Cache::put($attemptsKey, $attempts + 1, now()->addMinutes(15));
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $user = Auth::user();

        // Regenerate session to prevent fixation if session is available
        if ($request->hasSession()) {
            $request->session()->regenerate();
        }

        // Successful login: reset attempt counter
        Cache::forget($attemptsKey);

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
