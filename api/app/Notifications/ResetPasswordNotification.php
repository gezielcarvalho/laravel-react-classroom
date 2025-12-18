<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\Config;

class ResetPasswordNotification extends Notification
{
    public $token;

    public function __construct($token)
    {
        $this->token = $token;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        // Use FRONTEND_URL env var for the frontend host (fall back to localhost:3000 for dev)
        $frontend = env('FRONTEND_URL', 'http://localhost:3000');
        $url = rtrim($frontend, '/') . '/password/reset?token=' . $this->token . '&email=' . urlencode($notifiable->email);

        return (new MailMessage)
                    ->subject('Reset your password')
                    ->line('You are receiving this email because we received a password reset request for your account.')
                    ->action('Reset Password', $url)
                    ->line('If you did not request a password reset, no further action is required.');
    }
}
