FROM php:8.0-fpm-alpine

RUN apk add --no-cache --virtual .build-deps \
        $PHPIZE_DEPS tzdata autoconf build-base libzip-dev zip unzip bash curl git && \
    apk add --no-cache icu-dev oniguruma-dev zlib-dev && \
    docker-php-ext-install pdo pdo_mysql mbstring zip exif pcntl bcmath && \
    pecl install redis && docker-php-ext-enable redis && \
    rm -rf /var/cache/apk/*

COPY --from=composer:2.6 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Install PHP dependencies without running Composer scripts (prevents running
# artisan/package discovery during the image build). We'll run discovery at
# runtime instead.
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-progress --no-interaction --no-scripts

# Copy app source
COPY . .

# Generate optimized autoload without running scripts, then set permissions
RUN composer dump-autoload --optimize --no-scripts && \
    chown -R www-data:www-data /var/www/html && \
    chmod -R 755 /var/www/html

EXPOSE 9000

CMD ["php-fpm"]
