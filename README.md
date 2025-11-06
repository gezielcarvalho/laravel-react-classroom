# Laravel React CRUD Application

A full-stack CRUD (Create, Read, Update, Delete) application built with Laravel (backend) and React (frontend), containerized with Docker.

## 🚀 Features

- **Backend**: Laravel 8 REST API
- **Frontend**: React 18 with React Router
- **Database**: MySQL 5.7
- **Admin Panel**: phpMyAdmin
- **Student Management**: Complete CRUD operations for student records
- **Containerized**: Docker setup for easy deployment

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Git](https://git-scm.com/)

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd laravel-react
```

### 2. Set up Environment Variables

```bash
# Copy the example environment file
cp api/.env.example api/.env
```

**Important**: Update the database configuration in `api/.env`:

```env
DB_CONNECTION=mysql
DB_HOST=db
DB_PORT=3306
DB_DATABASE=laravel_db01
DB_USERNAME=root
DB_PASSWORD=A_1234567
```

### 3. Build and Start the Containers

```bash
docker compose up -d --build
```

This command will:

- Build the PHP/Apache container with Laravel
- Set up MySQL database
- Start phpMyAdmin
- Install all dependencies

### 4. Set up Laravel Application

```bash
# Access the API container
docker exec -it api bash

# Generate application key
php artisan key:generate

# Run database migrations
php artisan migrate

# Exit the container
exit
```

### 5. Install Frontend Dependencies

```bash
# Navigate to frontend directory
cd front

# Install dependencies
npm install

# Start the React development server
npm start
```

## 🌐 Access the Application

Once everything is running, you can access:

- **React Frontend**: http://localhost:3000
- **Laravel API**: http://localhost:8000
- **phpMyAdmin**: http://localhost:8088
  - Username: `root`
  - Password: `A_1234567`

## 📱 Application Features

The application provides a complete student management system with:

- **View Students**: Display all students in a table format
- **Add Student**: Create new student records
- **Edit Student**: Update existing student information
- **Delete Student**: Remove student records

### Student Fields:

- ID (auto-generated)
- Name
- Course
- Email
- Phone

## 🏗️ Project Structure

```
laravel-react/
├── api/                    # Laravel backend
│   ├── app/
│   ├── database/
│   ├── routes/
│   └── ...
├── front/                  # React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Student.js
│   │   │   ├── AddStudent.js
│   │   │   └── EditStudent.js
│   │   └── ...
│   └── ...
├── .docker/               # Docker configuration
│   ├── php/
│   └── mysql/
└── docker-compose.yaml
```

## 🐳 Docker Services

The application runs on three Docker containers:

1. **api**: PHP 8.0 with Apache, Laravel application
2. **db**: MySQL 5.7 database
3. **phpmyadmin**: Database administration interface

## 📊 API Endpoints

| Method | Endpoint                   | Description        |
| ------ | -------------------------- | ------------------ |
| GET    | `/api/students`            | Get all students   |
| POST   | `/api/add-student`         | Create new student |
| GET    | `/api/edit-student/{id}`   | Get student by ID  |
| PUT    | `/api/update-student/{id}` | Update student     |
| DELETE | `/api/delete-student/{id}` | Delete student     |

## 🔧 Development Commands

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
cd front

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

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

**Happy Coding! 🎉**
