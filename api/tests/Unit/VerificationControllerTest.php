<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Http\Controllers\Auth\VerificationController;

class VerificationControllerTest extends TestCase
{
    public function test_verification_controller_can_be_instantiated()
    {
        $controller = new VerificationController();
        $this->assertInstanceOf(VerificationController::class, $controller);
    }
}