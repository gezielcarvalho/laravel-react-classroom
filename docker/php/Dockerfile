FROM php:8.2-fpm-alpine

LABEL maintainer="devops"

RUN apk add --no-cache --virtual .build-deps \
        $PHPIZE_DEPS autoconf build-base libzip-dev zip unzip bash curl git && \
    apk add --no-cache icu-dev oniguruma-dev zlib-dev libxml2-dev && \
    docker-php-ext-install pdo pdo_mysql mbstring zip exif pcntl bcmath && \
    pecl install redis && docker-php-ext-enable redis && \
    rm -rf /var/cache/apk/*

WORKDIR /var/www/html

RUN usermod -u 1000 www-data || true

CMD ["php-fpm"]
