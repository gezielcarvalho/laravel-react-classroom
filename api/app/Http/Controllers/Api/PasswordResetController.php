<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Hash;
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
        ]);

        $user = User::where('email', $data['email'])->first();
        // create a token and send notification with frontend URL
        $token = Password::createToken($user);
        $user->notify(new ResetPasswordNotification($token));

        return response()->json(['status' => 200, 'message' => 'Reset link sent'], 200);
    }

    public function reset(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email|exists:users,email',
            'token' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

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
