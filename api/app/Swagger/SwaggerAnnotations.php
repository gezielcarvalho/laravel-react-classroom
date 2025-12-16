<?php

namespace App\Swagger;

/**
 * OpenAPI (Swagger) basic information for the API.
 *
 * @OA\Info(
 *     title="Laravel React Classroom API",
 *     version="1.0.0",
 *     description="API documentation for the Laravel React Classroom project",
 * )
 *
 * @OA\Server(
 *     url="http://localhost:8000",
 *     description="Local development server"
 * )
 */
class SwaggerAnnotations
{
	// This class exists only to hold OpenAPI annotations for swagger-php scanning.
}
