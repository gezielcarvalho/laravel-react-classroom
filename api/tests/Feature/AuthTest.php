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

        // Perform CSRF cookie handshake required for Sanctum cookie-based auth
        $this->get('/sanctum/csrf-cookie');

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

        // Perform CSRF cookie handshake before register (sanctum cookie flow)
        $this->get('/sanctum/csrf-cookie');

        $response = $this->postJson('/api/register', $payload);

        $response->assertStatus(201);
        $this->assertDatabaseHas('users', ['email' => 'new@example.com']);
        $response->assertJsonStructure(['status', 'message', 'user' => ['id', 'email', 'name']]);
    }

    public function test_register_then_login_flow()
    {
        // Handshake for cookie-based CSRF
        $this->get('/sanctum/csrf-cookie');

        $payload = [
            'name' => 'Flow User',
            'email' => 'flow@example.com',
            'password' => 'flowpassword',
            'password_confirmation' => 'flowpassword',
        ];

        $registerResp = $this->postJson('/api/register', $payload);
        $registerResp->assertStatus(201);

        // After registration, ensure CSRF cookie still valid and attempt login
        $this->get('/sanctum/csrf-cookie');
        $loginResp = $this->postJson('/api/login', [
            'email' => 'flow@example.com',
            'password' => 'flowpassword',
        ]);

        $loginResp->assertStatus(200);
        $loginResp->assertJsonStructure(['status', 'message', 'user' => ['id', 'email', 'name']]);
    }

    public function test_logout_clears_session()
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum');

        // Ensure CSRF cookie/token present for logout call
        $this->get('/sanctum/csrf-cookie');

        $response = $this->postJson('/api/logout');
        $response->assertStatus(200);

        // After logout, requests should be unauthorized
        $this->withHeaders([]);
        $response2 = $this->getJson('/api/user');
        $response2->assertStatus(401);
    }
}
