# Swagger (OpenAPI) Installation Plan (L5-Swagger)

This document describes how to install and configure L5-Swagger in the Laravel `api/` app, including examples for annotating controllers and generating docs. The instructions include WSL and Docker commands so you can run them on your system.

---

## 🎯 Goal

Add OpenAPI/Swagger documentation to the API so developers can view interactive API docs (Swagger UI), export JSON/YAML spec, and keep specs in source control.

## ✅ Prerequisites

- Laravel app present in `api/`
- PHP and Composer available (in WSL or via Docker)
- `php artisan` available (or runnable via Docker `api` service)
- Write permissions to project files and `storage/`

---

## 1) Install L5-Swagger (composer package)

### Option A — WSL (if PHP & Composer are installed in WSL)

```bash
# run inside WSL
cd /mnt/c/Users/gezie/projects/sabre/laravel-react-classroom/api
composer require darkaonline/l5-swagger
```

### Option B — Docker (if host/WSL lacks composer/php)

```bash
# run from Windows or WSL; mounts project into official Composer image
docker run --rm -v /mnt/c/Users/gezie/projects/sabre/laravel-react-classroom/api:/app -w /app composer:2 composer require darkaonline/l5-swagger
```

> Note: Use the method that works on your machine. If Composer fails, ensure `php` is available in the container that runs `composer`.

---

## 2) Publish vendor files & config

```bash
# Using native php (WSL)
php artisan vendor:publish --provider "L5Swagger\L5SwaggerServiceProvider"

# Or using Docker (if your app is containerized and has an 'api' service)
docker compose exec api php artisan vendor:publish --provider "L5Swagger\L5SwaggerServiceProvider"
```

This creates `config/l5-swagger.php` and the swagger assets.

---

## 3) Configure L5-Swagger (recommended dev settings)

Open `config/l5-swagger.php` and set/confirm the following for local/dev usage:

- `default`/`routes` (UI path) — default is `/api/documentation`
- `generate_always` => true (optional while developing: regenerates automatically)
- `swagger_version` => '3.0'

You can also add the following to `.env` for convenience:

```
L5_SWAGGER_GENERATE_ALWAYS=true
L5_SWAGGER_OPEN_API_SPEC_VERSION=3.0
L5_SWAGGER_CONST_HOST=http://localhost:8000
```

> Tip: Keep `generate_always` disabled on CI/production; instead generate spec during build.

---

## 4) Add OpenAPI annotations in controllers (example)

Add PHPDoc `@OA` annotations to `StudentController` methods. Example to paste above the `index` method:

```php
/**
 * @OA\Get(
 *     path="/api/students",
 *     tags={"Students"},
 *     summary="Get a list of students",
 *     @OA\Response(response=200, description="OK")
 * )
 */
 public function index() { ... }
```

Example for `show`:

```php
/**
 * @OA\Get(
 *     path="/api/students/{id}",
 *     tags={"Students"},
 *     summary="Get student by id",
 *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
 *     @OA\Response(response=200, description="OK"),
 *     @OA\Response(response=404, description="Not Found")
 * )
 */
 public function show(Student $student) { ... }
```

For `store` (POST) and `update` (PUT) use `@OA\RequestBody` to define expected payload shape. See swagger-php docs for schema examples: https://zircote.github.io/swagger-php/

---

## 5) Generate the documentation

After adding annotations run:

```bash
# WSL
php artisan l5-swagger:generate

# Docker (if running inside docker compose):
docker compose exec api php artisan l5-swagger:generate
```

This will generate the OpenAPI JSON file (usually `storage/api-docs/api-docs.json`) and make the UI available.

---

## 6) View Swagger UI

Open the browser and visit:

```
http://localhost:8000/api/documentation
```

(Confirm the route in `config/l5-swagger.php` if you customized it.)

---

## 7) Secure the docs (production)

- Restrict access to docs by middleware (auth or IP allowlist) in `routes/web.php` or in `config/l5-swagger.php`.
- Do NOT enable `generate_always` in production.

---

## 8) CI & Source Control

- Optionally add a CI step to run `php artisan l5-swagger:generate` and commit the generated JSON artefact to a `docs/` output folder or upload it to a discovery service.
- Add generation step to your deploy/build pipeline so docs always reflect current API.

---

## Troubleshooting & Notes

- If `composer require` fails due to PHP extension errors, run the command inside a container with the correct PHP version or install missing extensions.
- If `php artisan` is not available in WSL, either install PHP/composer in WSL or run artisan via the `api` Docker container (e.g., `docker compose exec api php artisan ...`).
- If annotations are not picked up, confirm `scan` paths in `config/l5-swagger.php` includes the `app/` folder.

---

## Example checklist (tick when done)

- [ ] `composer require` completed
- [ ] `php artisan vendor:publish` executed
- [ ] `config/l5-swagger.php` reviewed/updated
- [ ] Controller methods annotated (`StudentController` example)
- [ ] `php artisan l5-swagger:generate` succeeded
- [ ] Swagger UI accessible at `/api/documentation`
- [ ] Docs access secured for production
- [ ] Optional: Add generation to CI

---

If you'd like, I can also add example `@OA` annotations directly into `StudentController` and add a small `.github/workflows/swagger.yml` CI job to auto-generate docs and store them as an artifact — say the word and I'll prepare the code changes.
