<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_with_valid_credentials_returns_user()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            // factory sets password to 'password' by default hash
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'password',
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure(['status', 'message', 'user' => ['id', 'email', 'name']]);
    }

    public function test_user_endpoint_requires_authentication()
    {
        $response = $this->getJson('/api/user');
        $response->assertStatus(401);
    }

    public function test_register_creates_user_and_returns_201()
    {
        $payload = [
            'name' => 'New User',
            'email' => 'new@example.com',
            'password' => 'securepassword',
            'password_confirmation' => 'securepassword',
        ];

        $response = $this->postJson('/api/register', $payload);

        $response->assertStatus(201);
        $this->assertDatabaseHas('users', ['email' => 'new@example.com']);
        $response->assertJsonStructure(['status', 'message', 'user' => ['id', 'email', 'name']]);
    }

    public function test_logout_clears_session()
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum');

        $response = $this->postJson('/api/logout');
        $response->assertStatus(200);

        // After logout, requests should be unauthorized
        $this->withHeaders([]);
        $response2 = $this->getJson('/api/user');
        $response2->assertStatus(401);
    }
}
