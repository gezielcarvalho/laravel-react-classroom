<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Student;

class StudentTest extends TestCase
{
    public function test_full_name_uses_name_if_present()
    {
        $s = new Student(['name' => 'Alpha Beta']);
        $this->assertEquals('Alpha Beta', $s->full_name);
    }

    public function test_full_name_combines_first_and_last()
    {
        $s = new Student(['first_name' => 'Alpha', 'last_name' => 'Beta', 'name' => null]);
        $this->assertEquals('Alpha Beta', $s->full_name);
    }
}