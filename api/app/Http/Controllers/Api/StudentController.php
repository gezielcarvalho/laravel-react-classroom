<?php

namespace App\Http\Controllers\Api;

use App\Models\Student;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

/**
 * @OA\Tag(
 *     name="Students",
 *     description="Operations about students"
 * )
 *
 * @OA\Schema(
 *     schema="Student",
 *     type="object",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="name", type="string", example="John Doe"),
 *     @OA\Property(property="course", type="string", example="Computer Science"),
 *     @OA\Property(property="email", type="string", format="email", example="john@example.com"),
 *     @OA\Property(property="phone", type="string", example="123456789")
 * )
 *
 * @OA\Schema(
 *     schema="StudentCreate",
 *     type="object",
 *     required={"name"},
 *     @OA\Property(property="name", type="string", example="John Doe"),
 *     @OA\Property(property="course", type="string", example="Computer Science"),
 *     @OA\Property(property="email", type="string", format="email", example="john@example.com"),
 *     @OA\Property(property="phone", type="string", example="123456789")
 * )
 */
class StudentController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    /**
     * @OA\Get(
     *     path="/api/students",
     *     tags={"Students"},
     *     summary="Get list of students",
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="students", type="array", @OA\Items(ref="#/components/schemas/Student"))
     *         )
     *     )
     * )
     */
    public function index()
    {
        return response()->json([
            'status' => 200,
            'students' => Student::all()
        ]);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'course' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
        ]);

        $student = Student::create($data);

        return response()->json([
            'status' => 201,
            'message' => 'Student added successfully',
            'student' => $student
        ], 201);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Student  $student
     * @return \Illuminate\Http\Response
     */
    /**
     * @OA\Get(
     *     path="/api/students/{id}",
     *     tags={"Students"},
     *     summary="Get a single student",
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Successful operation", @OA\JsonContent(ref="#/components/schemas/Student")),
     *     @OA\Response(response=404, description="Not Found")
     * )
     */
    public function show(Student $student)
    {
        return response()->json([
            'status' => 200,
            'student' => $student
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Student  $student
     * @return \Illuminate\Http\Response
     */
    // The `edit` action is not used in API resource controllers; use `show` instead.

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Student  $student
     * @return \Illuminate\Http\Response
     */
    /**
     * @OA\Put(
     *     path="/api/students/{id}",
     *     tags={"Students"},
     *     summary="Update a student",
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(@OA\JsonContent(ref="#/components/schemas/StudentCreate")),
     *     @OA\Response(response=200, description="Student updated", @OA\JsonContent(ref="#/components/schemas/Student")),
     *     @OA\Response(response=404, description="Not Found")
     * )
     */
    public function update(Request $request, Student $student)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'course' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
        ]);

        $student->update($data);

        return response()->json([
            'status' => 200,
            'message' => 'Student updated successfully',
            'student' => $student
        ]);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Student  $student
     * @return \Illuminate\Http\Response
     */
    /**
     * @OA\Delete(
     *     path="/api/students/{id}",
     *     tags={"Students"},
     *     summary="Delete a student",
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Student deleted"),
     *     @OA\Response(response=404, description="Not Found")
     * )
     */
    public function destroy(Student $student)
    {
        $student->delete();

        return response()->json([
            'status' => 200,
            'message' => 'Student deleted successfully'
        ]);
    }
}
