<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Providers\BroadcastServiceProvider;

class BroadcastServiceProviderTest extends TestCase
{
    public function test_broadcast_service_provider_boots()
    {
        $provider = new BroadcastServiceProvider($this->app);
        $provider->boot();
        $this->assertTrue(true);
    }
}