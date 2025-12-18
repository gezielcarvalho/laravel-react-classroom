<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Api\AuthController;
use App\Models\User;
use Mockery;

class AuthControllerTest extends TestCase
{
    public function test_register_creates_user()
    {
        $controller = new AuthController();

        $req = Request::create('/api/register', 'POST', [
            'name' => 'Unit User',
            'email' => 'unit@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $resp = $controller->register($req);

        $this->assertEquals(201, $resp->getStatusCode());
        $this->assertDatabaseHas('users', ['email' => 'unit@example.com']);
    }

    public function test_login_invalid_credentials_returns_401()
    {
        $controller = new AuthController();

        Auth::shouldReceive('attempt')->once()->andReturn(false);

        $req = Request::create('/api/login', 'POST', [
            'email' => 'noone@example.com',
            'password' => 'wrong',
        ]);

        $resp = $controller->login($req);

        $this->assertEquals(401, $resp->getStatusCode());
    }

    public function test_user_returns_unauthenticated_when_no_user()
    {
        $controller = new AuthController();

        $req = Request::create('/api/user', 'GET');
        // Ensure no user resolver is present
        $req->setUserResolver(function () { return null; });

        $resp = $controller->user($req);

        $this->assertEquals(401, $resp->getStatusCode());
    }

    public function test_logout_deletes_current_access_token()
    {
        $controller = new AuthController();

        $user = User::factory()->create();

        // Create a token instance with a delete method we can observe
        $token = new class {
            public $deleted = false;
            public function delete()
            {
                $this->deleted = true;
            }
        };

        // Partial mock of the User to return our token
        $userMock = Mockery::mock($user)->makePartial();
        $userMock->shouldReceive('currentAccessToken')->once()->andReturn($token);

        $req = Request::create('/api/logout', 'POST');
        $req->setUserResolver(function () use ($userMock) { return $userMock; });

        $resp = $controller->logout($req);

        $this->assertEquals(200, $resp->getStatusCode());
        $this->assertTrue($token->deleted);

        Mockery::close();
    }
}
