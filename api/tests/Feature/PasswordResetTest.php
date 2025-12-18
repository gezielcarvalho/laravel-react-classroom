<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use Illuminate\Support\Facades\Notification;
use App\Notifications\ResetPasswordNotification;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_request_password_reset_link()
    {
        Notification::fake();

        $user = User::factory()->create(['email' => 'reset@example.com']);

        $resp = $this->postJson('/api/password/forgot', ['email' => 'reset@example.com']);

        $resp->assertStatus(200);

        Notification::assertSentTo($user, ResetPasswordNotification::class);

        $notification = Notification::sent($user, ResetPasswordNotification::class)->first();
        $mail = $notification->toMail($user);
        $this->assertStringContainsString(env('FRONTEND_URL', 'http://localhost:3000'), $mail->actionUrl);
    }

    public function test_can_reset_password_with_valid_token()
    {
        Notification::fake();
        $user = User::factory()->create(['email' => 'reset2@example.com']);

        $this->postJson('/api/password/forgot', ['email' => 'reset2@example.com']);

        $notification = Notification::sent($user, ResetPasswordNotification::class)->first();
        $this->assertNotNull($notification);
        $token = $notification->token;

        $resp = $this->postJson('/api/password/reset', [
            'email' => 'reset2@example.com',
            'token' => $token,
            'password' => 'newpassword',
            'password_confirmation' => 'newpassword',
        ]);

        $resp->assertStatus(200);
    }
}
