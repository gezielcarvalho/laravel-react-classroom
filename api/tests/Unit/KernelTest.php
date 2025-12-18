<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Console\Kernel;
use Illuminate\Console\Scheduling\Schedule;

class KernelTest extends TestCase
{
    public function test_schedule_method_is_defined()
    {
        $kernel = app(Kernel::class);
        $schedule = app(Schedule::class);

        // Use reflection to call the protected schedule method
        $reflection = new \ReflectionClass($kernel);
        $method = $reflection->getMethod('schedule');
        $method->setAccessible(true);
        $method->invoke($kernel, $schedule);

        // Assert that the method can be called without error
        $this->assertTrue(true);
    }
}