<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Illuminate\Auth\Events\PasswordReset;
use App\Models\User;
use App\Notifications\ResetPasswordNotification;

class PasswordResetController extends Controller
{
    public function sendResetLink(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email|exists:users,email',
            'captcha_token' => 'nullable|string',
            'captcha_answer' => 'nullable|numeric',
        ]);

        $captchaEnabled = env('CAPTCHA_ENABLED', false);

        $ip = $request->ip();
        $attemptsKey = "password_forgot:attempts:{$ip}";
        $attempts = (int) Cache::get($attemptsKey, 0);
        $maxAttempts = 6;
        if ($attempts >= $maxAttempts) {
            return response()->json(['message' => 'Too many attempts. Try again later.'], 429);
        }

        if ($captchaEnabled) {
            if (empty($data['captcha_token']) || !isset($data['captcha_answer'])) {
                Cache::put($attemptsKey, $attempts + 1, now()->addMinutes(15));
                return response()->json(['message' => 'Captcha required'], 422);
            }
            $entry = Cache::get("captcha:{$data['captcha_token']}");
            if (!$entry || (int)$entry['answer'] !== (int)$data['captcha_answer']) {
                Cache::put($attemptsKey, $attempts + 1, now()->addMinutes(15));
                return response()->json(['message' => 'Invalid captcha'], 422);
            }
            Cache::forget("captcha:{$data['captcha_token']}");
        }

        $user = User::where('email', $data['email'])->first();
        // create a token and send notification with frontend URL
        $token = Password::createToken($user);
        $user->notify(new ResetPasswordNotification($token));

        Cache::forget($attemptsKey);

        return response()->json(['status' => 200, 'message' => 'Reset link sent'], 200);
    }

    public function reset(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email|exists:users,email',
            'token' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
            'captcha_token' => 'nullable|string',
            'captcha_answer' => 'nullable|numeric',
        ]);

        $captchaEnabled = env('CAPTCHA_ENABLED', false);
        $ip = $request->ip();
        $attemptsKey = "password_reset:attempts:{$ip}";
        $attempts = (int) Cache::get($attemptsKey, 0);
        $maxAttempts = 6;
        if ($attempts >= $maxAttempts) {
            return response()->json(['message' => 'Too many attempts. Try again later.'], 429);
        }

        if ($captchaEnabled) {
            if (empty($data['captcha_token']) || !isset($data['captcha_answer'])) {
                Cache::put($attemptsKey, $attempts + 1, now()->addMinutes(15));
                return response()->json(['message' => 'Captcha required'], 422);
            }
            $entry = Cache::get("captcha:{$data['captcha_token']}");
            if (!$entry || (int)$entry['answer'] !== (int)$data['captcha_answer']) {
                Cache::put($attemptsKey, $attempts + 1, now()->addMinutes(15));
                return response()->json(['message' => 'Invalid captcha'], 422);
            }
            Cache::forget("captcha:{$data['captcha_token']}");
        }

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->password = Hash::make($password);
                $user->setRememberToken(Str::random(60));
                $user->save();
                event(new PasswordReset($user));
            }
        );

        if ($status == Password::PASSWORD_RESET) {
            return response()->json(['status' => 200, 'message' => 'Password reset successful'], 200);
        }

        return response()->json(['message' => __($status)], 400);
    }
}
