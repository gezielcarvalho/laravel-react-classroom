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
        $resp = $this->get('/sanctum/csrf-cookie');
        // Extract XSRF token from Set-Cookie header and send it as X-XSRF-TOKEN header
        $csrfCookie = collect($resp->headers->getCookies())->firstWhere('getName', 'XSRF-TOKEN');
        $xsrf = $csrfCookie ? urldecode($csrfCookie->getValue()) : null;

        $response = $this->withHeader('X-XSRF-TOKEN', $xsrf)->postJson('/api/login', [
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

    public function test_csrf_cookie_sets_xsrf_token()
    {
        $resp = $this->get('/sanctum/csrf-cookie');
        $cookies = collect($resp->headers->getCookies());
        $this->assertTrue($cookies->contains(fn($c) => $c->getName() === 'XSRF-TOKEN'));
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
        $resp = $this->get('/sanctum/csrf-cookie');
        $csrfCookie = collect($resp->headers->getCookies())->firstWhere('getName', 'XSRF-TOKEN');
        $xsrf = $csrfCookie ? urldecode($csrfCookie->getValue()) : null;

        $response = $this->withHeader('X-XSRF-TOKEN', $xsrf)->postJson('/api/register', $payload);

        $response->assertStatus(201);
        $this->assertDatabaseHas('users', ['email' => 'new@example.com']);
        $response->assertJsonStructure(['status', 'message', 'user' => ['id', 'email', 'name']]);
    }

    public function test_register_then_login_flow()
    {
        // Handshake for cookie-based CSRF
        $resp = $this->get('/sanctum/csrf-cookie');
        $csrfCookie = collect($resp->headers->getCookies())->firstWhere('getName', 'XSRF-TOKEN');
        $xsrf = $csrfCookie ? urldecode($csrfCookie->getValue()) : null;

        $payload = [
            'name' => 'Flow User',
            'email' => 'flow@example.com',
            'password' => 'flowpassword',
            'password_confirmation' => 'flowpassword',
        ];

        $registerResp = $this->withHeader('X-XSRF-TOKEN', $xsrf)->postJson('/api/register', $payload);
        $registerResp->assertStatus(201);

        // After registration, re-handshake and attempt login
        $resp2 = $this->get('/sanctum/csrf-cookie');
        $csrfCookie2 = collect($resp2->headers->getCookies())->firstWhere('getName', 'XSRF-TOKEN');
        $xsrf2 = $csrfCookie2 ? urldecode($csrfCookie2->getValue()) : null;

        $loginResp = $this->withHeader('X-XSRF-TOKEN', $xsrf2)->postJson('/api/login', [
            'email' => 'flow@example.com',
            'password' => 'flowpassword',
        ]);

        $loginResp->assertStatus(200);
        $loginResp->assertJsonStructure(['status', 'message', 'user' => ['id', 'email', 'name']]);
    }

    public function test_logout_clears_session()
    {
        /** @var \App\Models\User $user */
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum');

        // Ensure CSRF cookie/token present for logout call
        $resp = $this->get('/sanctum/csrf-cookie');
        $csrfCookie = collect($resp->headers->getCookies())->firstWhere('getName', 'XSRF-TOKEN');
        $xsrf = $csrfCookie ? urldecode($csrfCookie->getValue()) : null;

        $response = $this->withHeader('X-XSRF-TOKEN', $xsrf)->postJson('/api/logout');
        $response->assertStatus(200);

        // After logout, requests should be unauthorized
        $this->withHeaders([]);
        $response2 = $this->getJson('/api/user');
        $response2->assertStatus(401);
    }
}
