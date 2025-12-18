<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Http\Middleware\TrustHosts;

class TrustHostsTest extends TestCase
{
    public function test_hosts_method_returns_array()
    {
        $middleware = new \App\Http\Middleware\TrustHosts(app());
        $hosts = $middleware->hosts();
        $this->assertIsArray($hosts);
        $this->assertNotEmpty($hosts);
    }
}