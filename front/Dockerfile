FROM node:18-alpine AS build

WORKDIR /app

# Copy frontend sources from subfolder when build context is repo root
COPY front/package.json front/package-lock.json ./
RUN npm ci --silent

COPY front/. ./
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY docker/nginx/front.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
