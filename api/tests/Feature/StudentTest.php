<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Student;

class StudentTest extends TestCase
{
    use RefreshDatabase;

    public function test_index_returns_students()
    {
        Student::create(['name' => 'S1', 'course' => 'C1', 'email' => 's1@example.com', 'phone' => '111']);
        Student::create(['name' => 'S2', 'course' => 'C2', 'email' => 's2@example.com', 'phone' => '222']);

        $resp = $this->getJson('/api/students');

        $resp->assertStatus(200);
        $resp->assertJsonStructure(['status', 'students']);
        $this->assertCount(2, $resp->json('students'));
    }

    public function test_store_creates_student_and_returns_201()
    {
        $payload = ['name' => 'New', 'course' => 'C', 'email' => 'new@example.com', 'phone' => '9'];

        $resp = $this->postJson('/api/students', $payload);

        $resp->assertStatus(201);
        $resp->assertJsonFragment(['message' => 'Student added successfully']);
        $this->assertDatabaseHas('students', ['email' => 'new@example.com']);
    }

    public function test_store_validation_rejects_missing_name()
    {
        $resp = $this->postJson('/api/students', ['course' => 'C']);
        $resp->assertStatus(422);
        $resp->assertJsonValidationErrors(['name']);
    }

    public function test_show_returns_student()
    {
        $s = Student::create(['name' => 'Show', 'course' => 'C', 'email' => 'show@example.com', 'phone' => '3']);

        $resp = $this->getJson('/api/students/' . $s->id);

        $resp->assertStatus(200);
        $resp->assertJsonPath('student.id', $s->id);
    }

    public function test_update_modifies_student()
    {
        $s = Student::create(['name' => 'Before', 'course' => 'C', 'email' => 'b@example.com', 'phone' => '4']);

        $payload = ['name' => 'After', 'course' => 'C2', 'email' => 'after@example.com', 'phone' => '5'];

        $resp = $this->putJson('/api/students/' . $s->id, $payload);

        $resp->assertStatus(200);
        $this->assertDatabaseHas('students', ['id' => $s->id, 'name' => 'After']);
    }

    public function test_update_validation_rejects_missing_name()
    {
        $s = Student::create(['name' => 'B', 'course' => 'C', 'email' => 'b@example.com', 'phone' => '4']);

        $resp = $this->putJson('/api/students/' . $s->id, ['course' => 'X']);
        $resp->assertStatus(422);
        $resp->assertJsonValidationErrors(['name']);
    }

    public function test_destroy_deletes_student()
    {
        $s = Student::create(['name' => 'ToDelete', 'course' => 'C', 'email' => 'd@example.com', 'phone' => '6']);

        $resp = $this->deleteJson('/api/students/' . $s->id);
        $resp->assertStatus(200);
        $this->assertDatabaseMissing('students', ['id' => $s->id]);
    }
}
