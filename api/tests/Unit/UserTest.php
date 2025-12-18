<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\User;

class UserTest extends TestCase
{
    public function test_display_name_prefers_name()
    {
        $user = User::factory()->make(['name' => 'Jane Doe', 'email' => 'j@example.com']);
        $this->assertEquals('Jane Doe', $user->display_name);
    }

    public function test_display_name_falls_back_to_email()
    {
        $user = User::factory()->make(['name' => null, 'email' => 'j@example.com']);
        $this->assertEquals('j@example.com', $user->display_name);
    }
}