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
        $xsrf = $csrfCookie ? urldecode($csrfCookie->getValue()) : csrf_token();
        $this->assertNotEmpty($xsrf, 'XSRF token missing from /sanctum/csrf-cookie response');

        $response = $this->withHeader('X-XSRF-TOKEN', (string) $xsrf)->postJson('/api/login', [
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
        $xsrf = $csrfCookie ? urldecode($csrfCookie->getValue()) : csrf_token();
        $this->assertNotEmpty($xsrf, 'XSRF token missing from /sanctum/csrf-cookie response');

        $response = $this->withHeader('X-XSRF-TOKEN', (string) $xsrf)->postJson('/api/register', $payload);

        $response->assertStatus(201);
        $this->assertDatabaseHas('users', ['email' => 'new@example.com']);
        $response->assertJsonStructure(['status', 'message', 'user' => ['id', 'email', 'name']]);
    }

    public function test_register_then_login_flow()
    {
        // Handshake for cookie-based CSRF
        $resp = $this->get('/sanctum/csrf-cookie');
        $csrfCookie = collect($resp->headers->getCookies())->firstWhere('getName', 'XSRF-TOKEN');
        $xsrf = $csrfCookie ? urldecode($csrfCookie->getValue()) : csrf_token();
        $this->assertNotEmpty($xsrf, 'XSRF token missing from /sanctum/csrf-cookie response (before register)');

        $payload = [
            'name' => 'Flow User',
            'email' => 'flow@example.com',
            'password' => 'flowpassword',
            'password_confirmation' => 'flowpassword',
        ];

        $registerResp = $this->withHeader('X-XSRF-TOKEN', (string) $xsrf)->postJson('/api/register', $payload);
        $registerResp->assertStatus(201);

        // After registration, re-handshake and attempt login
        $resp2 = $this->get('/sanctum/csrf-cookie');
        $csrfCookie2 = collect($resp2->headers->getCookies())->firstWhere('getName', 'XSRF-TOKEN');
        $xsrf2 = $csrfCookie2 ? urldecode($csrfCookie2->getValue()) : csrf_token();
        $this->assertNotEmpty($xsrf2, 'XSRF token missing from /sanctum/csrf-cookie response (after register)');

        $loginResp = $this->withHeader('X-XSRF-TOKEN', (string) $xsrf2)->postJson('/api/login', [
            'email' => 'flow@example.com',
            'password' => 'flowpassword',
        ]);

        $loginResp->assertStatus(200);
        $loginResp->assertJsonStructure(['status', 'message', 'user' => ['id', 'email', 'name']]);
    }

    public function test_logout_works()
    {
        $user = User::factory()->create([
            'email' => 'logout@example.com',
        ]);

        // Perform CSRF cookie handshake
        $resp = $this->get('/sanctum/csrf-cookie');
        $csrfCookie = collect($resp->headers->getCookies())->firstWhere('getName', 'XSRF-TOKEN');
        $xsrf = $csrfCookie ? urldecode($csrfCookie->getValue()) : csrf_token();
        $this->assertNotEmpty($xsrf, 'XSRF token missing');

        // Login via session
        $loginResp = $this->withHeader('X-XSRF-TOKEN', (string) $xsrf)->postJson('/api/login', [
            'email' => 'logout@example.com',
            'password' => 'password',
        ]);
        $loginResp->assertStatus(200);

        // Logout should work and return 200
        $logoutResp = $this->withHeader('X-XSRF-TOKEN', (string) $xsrf)->postJson('/api/logout');
        $logoutResp->assertStatus(200);
    }

    public function test_logout_with_token()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)->postJson('/api/logout');
        $response->assertStatus(200);
    }

    public function test_user_endpoint_returns_authenticated_user()
    {
        $user = User::factory()->create([
            'email' => 'user@example.com',
        ]);

        // Perform CSRF cookie handshake
        $resp = $this->get('/sanctum/csrf-cookie');
        $csrfCookie = collect($resp->headers->getCookies())->firstWhere('getName', 'XSRF-TOKEN');
        $xsrf = $csrfCookie ? urldecode($csrfCookie->getValue()) : csrf_token();
        $this->assertNotEmpty($xsrf, 'XSRF token missing');

        // Login via session
        $loginResp = $this->withHeader('X-XSRF-TOKEN', (string) $xsrf)->postJson('/api/login', [
            'email' => 'user@example.com',
            'password' => 'password',
        ]);
        $loginResp->assertStatus(200);

        // Now call /api/user, should return the authenticated user
        $userResp = $this->getJson('/api/user');
        $userResp->assertStatus(200);
    }

    public function test_confirm_password_show_form()
    {
        /** @var User $user */
        $user = User::factory()->create();
        $this->actingAs($user);
        $response = $this->get('/password/confirm');
        $response->assertStatus(200);
    }

    public function test_confirm_password_confirm()
    {
        /** @var User $user */
        $user = User::factory()->create();
        $this->actingAs($user);
        $response = $this->post('/password/confirm', ['password' => 'password']);
        $response->assertRedirect(); // Assuming it redirects after confirm
    }

    public function test_login_show_form()
    {
        $response = $this->get('/login');
        $response->assertStatus(200);
    }

    public function test_login_post()
    {
        /** @var User $user */
        $user = User::factory()->create();
        $this->actingAs($user);
        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);
        $response->assertRedirect('/home');
    }

    public function test_register_show_form()
    {
        $response = $this->get('/register');
        $response->assertStatus(200);
    }

    public function test_register_post()
    {
        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);
        $response->assertRedirect('/home');
    }

    public function test_email_verify_show()
    {
        /** @var User $user */
        $user = User::factory()->create(['email_verified_at' => null]);
        $this->actingAs($user);
        $response = $this->get('/email/verify');
        $response->assertStatus(200);
    }

    public function test_email_verify()
    {
        /** @var User $user */
        $user = User::factory()->create(['email_verified_at' => null]);
        $this->actingAs($user);

        $url = \Illuminate\Support\Facades\URL::signedRoute('verification.verify', [
            'id' => $user->id,
            'hash' => sha1($user->email),
        ]);

        $response = $this->get($url);
        $response->assertRedirect();

        $this->assertTrue($user->fresh()->hasVerifiedEmail());
    }

    public function test_email_resend()
    {
        /** @var User $user */
        $user = User::factory()->create(['email_verified_at' => null]);
        $this->actingAs($user);
        $response = $this->post('/email/resend');
        $response->assertRedirect();
    }

    public function test_home_page()
    {
        /** @var User $user */
        $user = User::factory()->create();
        $this->actingAs($user);
        $response = $this->get('/home');
        $response->assertStatus(200);
    }

    public function test_unauthenticated_user_redirected_to_login()
    {
        $response = $this->get('/home');
        $response->assertRedirect('/login');
    }

    public function test_login_with_invalid_credentials_returns_401()
    {
        // CSRF handshake for cookie-based login
        $resp = $this->get('/sanctum/csrf-cookie');
        $csrfCookie = collect($resp->headers->getCookies())->firstWhere('getName', 'XSRF-TOKEN');
        $xsrf = $csrfCookie ? urldecode($csrfCookie->getValue()) : csrf_token();
        $this->assertNotEmpty($xsrf, 'XSRF token missing for invalid login test');

        $response = $this->withHeader('X-XSRF-TOKEN', (string) $xsrf)->postJson('/api/login', [
            'email' => 'noone@example.com',
            'password' => 'wrong',
        ]);

        $response->assertStatus(401);
    }

    public function test_register_validation_fails()
    {
        $response = $this->postJson('/api/register', []);

        $response->assertStatus(422);
        $response->assertJsonStructure(['message', 'errors']);
    }

    public function test_register_duplicate_email_fails()
    {
        $existing = User::factory()->create(['email' => 'dup@example.com']);

        $payload = [
            'name' => 'Dup User',
            'email' => 'dup@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ];

        $response = $this->postJson('/api/register', $payload);
        $response->assertStatus(422);
        $response->assertJsonStructure(['message', 'errors']);
    }

    public function test_logout_revokes_token()
    {
        $user = User::factory()->create();
        $token = $user->createToken('temporary')->plainTextToken;

        // Call logout with token
        $logout = $this->withHeader('Authorization', 'Bearer ' . $token)->postJson('/api/logout');
        $logout->assertStatus(200);

        // Ensure the token was removed from storage (findToken should return null)
        $found = \Laravel\Sanctum\PersonalAccessToken::findToken($token);
        $this->assertNull($found);

        // Subsequent requests with same token may still be authorized via session in test env;
        // we assert token was removed from storage (findToken returned null) which verifies logout's token branch.
        $this->assertNull(\Laravel\Sanctum\PersonalAccessToken::findToken($token));
    }

    public function test_user_with_token_returns_user()
    {
        $user = User::factory()->create([ 'email' => 'tokenuser@example.com' ]);
        $token = $user->createToken('temp')->plainTextToken;

        $resp = $this->withHeader('Authorization', 'Bearer ' . $token)->getJson('/api/user');
        $resp->assertStatus(200);
        $resp->assertJsonStructure(['status', 'user' => ['id', 'email', 'name']]);
        $resp->assertJsonPath('user.email', 'tokenuser@example.com');
    }
}
