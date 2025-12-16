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

> Important: L5-Swagger requires a top-level `@OA\Info()` annotation (title & version). Add an annotations file (e.g. `app/Swagger/SwaggerAnnotations.php`) with an `@OA\Info` and `@OA\Server` so the generator can find the API metadata before running `php artisan l5-swagger:generate`. Example file content is included in the repo at `api/app/Swagger/SwaggerAnnotations.php`.
>
> ### Why we add a small placeholder class
>
> The OpenAPI generator (swagger-php) scans PHP files for `@OA` annotations. In some setups the scanner will miss top-level annotations that are placed in files without a class/namespace, or that are outside the configured scan paths. To reliably provide the required metadata (`@OA\Info`) we include a tiny namespaced placeholder class `App\Swagger\SwaggerAnnotations` whose class-level docblock contains `@OA\Info` and `@OA\Server` annotations. This ensures the generator always finds the API title & version before generating the spec.
>
> Example (already present at `api/app/Swagger/SwaggerAnnotations.php`):
>
> ```php
> <?php
> namespace App\Swagger;
>
> /**
>  * @OA\Info(title="Laravel React Classroom API", version="1.0.0")
>  * @OA\Server(url="http://localhost:8000", description="Local development server")
>  */
> class SwaggerAnnotations {}
> ```
>
> **Tips / Troubleshooting**
>
> - Ensure `config/l5-swagger.php` includes the `app/Swagger` folder in `paths.annotations` (we add `base_path('app/Swagger')` to scan it first).
> - Run the generator with verbosity to see which files are scanned:
>   ```bash
>   php artisan l5-swagger:generate -v
>   ```
> - If the `@OA\Info()` annotation is still not found:
>   - Confirm the file is readable and in the project (no typos in namespace/path).
>   - Run `composer dump-autoload` to refresh classmap/autoloading.
>   - Clear Laravel caches: `php artisan config:clear && php artisan cache:clear`.
>   - Check `config/l5-swagger.php` `scanOptions.pattern` if you use non-standard file patterns.
> - Once the generator finds the `@OA\Info` annotation the command should succeed and generate `storage/api-docs/api-docs.json`.

### Storage directory & file permissions (common cause of 500)

If Swagger UI shows "Failed to load API definition" with a 500 / "Internal Server Error" when trying to fetch the generated JSON (for example `/docs?api-docs.json`), a common cause is that `storage/api-docs/api-docs.json` either does not exist or is not readable by the web process (ownership/permissions issue).

Quick fixes (run inside the `api` container or via WSL):

```bash
# create the folder (if missing) and fix ownership/permissions for the web user
mkdir -p storage/api-docs
chown -R www-data:www-data storage storage/api-docs
chmod -R 775 storage storage/api-docs

# regenerate docs (verbose)
php artisan l5-swagger:generate -v
```

If you use Docker from the host, run this one-liner:

```bash
docker compose exec api bash -lc "mkdir -p storage/api-docs && chown -R www-data:www-data storage storage/api-docs && chmod -R 775 storage storage/api-docs && php artisan l5-swagger:generate -v"
```

After fixing permissions, verify the generated file exists and is readable:

```bash
ls -la storage/api-docs
head -n 20 storage/api-docs/api-docs.json
tail -n 200 storage/logs/laravel.log
```

If permissions were the issue you should see `storage/api-docs/api-docs.json` present and readable by the web user and the Swagger UI will load the API definition successfully.

---

## 3) Configure L5-Swagger (recommended dev settings)

Open `config/l5-swagger.php` and set/confirm the following for local/dev usage:

- `default`/`routes` (UI path) — default is `/api/documentation`
- `generate_always` => true (optional while developing: regenerates automatically)
- `swagger_version` => '3.0'

You can also add the following to `.env` for convenience:

```
L5_SWAGGER_GENERATE_ALWAYS=true
L5_SWAGGER_OPEN_API_SPEC_VERSION=3.0.0
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
