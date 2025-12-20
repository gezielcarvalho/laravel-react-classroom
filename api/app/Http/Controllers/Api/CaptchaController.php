<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class CaptchaController extends Controller
{
    /**
     * Generate a simple math captcha and return token + question.
     */
    public function generate(Request $request)
    {
        $a = random_int(1, 9);
        $b = random_int(1, 9);
        $question = "$a + $b";
        $answer = $a + $b;

        $token = Str::uuid()->toString();

        // Store in cache for 5 minutes
        Cache::put("captcha:{$token}", ['answer' => $answer, 'tries' => 0], now()->addMinutes(5));

        return response()->json(['token' => $token, 'question' => $question]);
    }

    /**
     * Optional: validate endpoint (not required if login validates)
     */
    public function validateCaptcha(Request $request)
    {
        $data = $request->validate([
            'token' => 'required|string',
            'answer' => 'required|numeric',
        ]);

        $entry = Cache::get("captcha:{$data['token']}");
        if (!$entry) {
            return response()->json(['message' => 'Captcha expired or invalid'], 422);
        }

        if ((int)$entry['answer'] === (int)$data['answer']) {
            Cache::forget("captcha:{$data['token']}");
            return response()->json(['valid' => true]);
        }

        // increment tries
        $entry['tries'] = ($entry['tries'] ?? 0) + 1;
        Cache::put("captcha:{$data['token']}", $entry, now()->addMinutes(5));

        return response()->json(['valid' => false], 422);
    }
}
