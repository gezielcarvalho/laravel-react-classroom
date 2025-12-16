# Laravel React Classroom (Future SaaS)

This project is the foundation for a future-ready Education SaaS platform. It currently provides a full-stack CRUD application using Laravel (API) and React (frontend), containerized with Docker. The long-term vision is to evolve into a scalable SaaS for schools, teachers, and students.

## 🚀 Current Features

- **Backend**: Laravel 8 REST API (PHP 7.3+/8.0+)
- **Frontend**: React 18 (TypeScript), React Router
- **Database**: MySQL 5.7
- **Admin Panel**: phpMyAdmin
- **Student Management**: CRUD for student records
- **Containerized**: Docker Compose for local development

## 📋 Prerequisites

- [Docker & Docker Compose](https://docs.docker.com/get-docker/)
- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) (v14+)
- [npm](https://www.npmjs.com/)

## 🛠️ Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd laravel-react-classroom
```

### 2. Set up Environment Variables

```bash
cp api/.env.example api/.env
```

Edit `api/.env` for your database settings (see `docker-compose.yaml` for defaults).

### 3. Build and Start the Containers

```bash
docker compose up -d --build
```

### 4. Set up Laravel Application

```bash
docker exec -it api bash
composer install
php artisan key:generate
php artisan migrate
exit
```

### 5. Set up Frontend Application

```bash
cd front
npm install
npm start
```

**Frontend Notes:**

- Runs at http://localhost:3000
- Connects to API at http://localhost:8000
- Hot reloading enabled

**If you encounter issues:**

- Ensure Node.js (version 14+) is installed
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`

## 🌐 Access

- **Frontend**: http://localhost:3000
- **API**: http://localhost:8000
- **phpMyAdmin**: http://localhost:8088 (user: `root`, pass: see .env)

## 📚 API Documentation (Swagger)

If L5-Swagger is installed and configured, the interactive API docs will be available at:

```
http://localhost:8000/api/documentation
```

See `docs/swagger-installation.md` for installation and configuration steps.

## 📱 Features (MVP)

- View, add, edit, delete students
- Student fields: ID, Name, Course, Email, Phone

## 🏗️ Project Structure

```
laravel-react-classroom/
├── api/      # Laravel backend
├── front/    # React frontend (TypeScript)
├── docs/     # Documentation & plans
└── docker-compose.yaml
```

## 🐳 Docker Services

- **api**: PHP 8.0 + Apache + Laravel
- **db**: MySQL 5.7
- **phpmyadmin**: DB admin interface

## 📊 API Endpoints (Student)

| Method | Endpoint             | Description        |
| ------ | -------------------- | ------------------ |
| GET    | `/api/students`      | Get all students   |
| POST   | `/api/students`      | Create new student |
| GET    | `/api/students/{id}` | Get student by ID  |
| PUT    | `/api/students/{id}` | Update student     |
| DELETE | `/api/students/{id}` | Delete student     |

## 🔧 Development

### Backend (Laravel)

```bash
# Access API container
docker exec -it api bash

# Run migrations
php artisan migrate

# Create new migration
php artisan make:migration create_table_name

# Create new controller
php artisan make:controller ControllerName

# Clear cache
php artisan cache:clear
```

### Frontend (React)

```bash
# Navigate to frontend directory
cd front

# Install dependencies (first time setup)
npm install

# Start development server (http://localhost:3000)
npm start

# Build for production
npm run build

# Run tests
npm test

# Check for dependency updates
npm outdated

# Update dependencies
npm update
```

**Frontend Development Tips:**

- The app runs on http://localhost:3000 with hot reloading
- API calls are made to http://localhost:8000 (ensure backend is running)
- Uses React Router for navigation between pages
- Bootstrap is included for styling
- SweetAlert2 is used for user notifications

### Docker Management

```bash
# Stop all containers
docker compose down

# Rebuild containers
docker compose up -d --build

# View logs
docker compose logs

# View specific service logs
docker compose logs api
```

## 🚨 Troubleshooting

### Common Issues:

1. **Port already in use**:

   - Change ports in `docker-compose.yaml`
   - Or stop services using those ports

2. **Database connection error**:

   - Verify `.env` database configuration
   - Ensure database container is running

3. **Permission issues**:

   - Check file permissions in `api/storage` and `api/bootstrap/cache`

4. **Frontend not connecting to API**:

   - Verify API is running on http://localhost:8000
   - Check CORS configuration in Laravel
   - Ensure both frontend and backend are running

5. **Frontend Issues**:
   - **npm install fails**: Clear cache with `npm cache clean --force`
   - **Port 3000 in use**: Kill process or change port in package.json
   - **Module not found**: Delete `node_modules` and run `npm install` again
   - **API requests failing**: Check network tab in browser dev tools
   - **React app won't start**: Check Node.js version (requires 14+)

### Reset Everything:

```bash
# Stop containers and remove volumes
docker compose down -v

# Remove built images
docker compose down --rmi all

# Rebuild from scratch
docker compose up -d --build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

---

## 📈 Roadmap

See `docs/action-plan.md` for the long-term SaaS action plan and vision.

---

**Happy Coding! 🎉**
