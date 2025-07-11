# Web Crawler Dashboard

A full-stack web application for crawling websites and analyzing their content. Built with React (frontend) and Go (backend), featuring user authentication, bulk operations, and real-time crawl monitoring.

## 🌐 Live Demo

You can access the app via ngrok at:
[https://180e7ee86b80.ngrok-free.app](https://180e7ee86b80.ngrok-free.app)

## 🚀 Features

- **User Authentication**: Secure login/registration system
- **Website Crawling**: Add URLs and monitor crawl progress
- **Bulk Operations**: Select multiple crawls for re-run or deletion
- **Individual Actions**: Start, stop, and view details for each crawl
- **Real-time Monitoring**: Live progress tracking for active crawls
- **Responsive Design**: Modern UI built with Tailwind CSS
- **Database Storage**: MySQL database with automatic migrations

## 🛠️ Tech Stack

### Frontend

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Radix UI** for accessible components
- **React Table** for data display

### Backend

- **Go** with Gin framework
- **GORM** for database ORM
- **JWT** for authentication
- **MySQL** database
- **Docker** for containerization

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **Go** (v1.21 or higher)
- **Docker** and **Docker Compose**
- **Git**

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd crawler-tech-challenge
```

### 2. Start the Backend Services

The application uses Docker Compose to run the backend services (Go API and MySQL database):

```bash
# Start all services
docker-compose up -d

# Check if services are running
docker-compose ps
```

This will start:

- **MySQL Database** on port 3306
- **Go Backend API** on port 8090

### 3. Install Frontend Dependencies

```bash
# Install Node.js dependencies
npm install
```

### 4. Start the Frontend Development Server

```bash
# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:3000` (or the next available port).

### 5. Access the Application

Open your browser and navigate to `http://localhost:3000`

## 🔧 Development

### Frontend Development

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run type checking
npm run type-check

# Run linting
npm run lint
```

### Backend Development

The backend runs in a Docker container. To make changes:

1. **Edit Go files** in the `internal/` directory
2. **Restart the backend container**:
   ```bash
   docker-compose restart backend
   ```

### Database

The MySQL database is automatically initialized with:

- User tables and authentication
- Crawl results tables
- Sample data for testing

To reset the database:

```bash
# Stop services
docker-compose down

# Remove volumes (this will delete all data)
docker-compose down -v

# Start fresh
docker-compose up -d
```

## 🧪 Testing

### E2E Tests

The application includes comprehensive Cypress tests:

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test suites
npm run test:e2e:auth      # Authentication tests
npm run test:e2e:dashboard # Dashboard tests
npm run test:e2e:details   # Crawl details tests
npm run test:e2e:journey   # User journey tests

# Open Cypress UI
npm run cypress:open
```

### Manual Testing

1. **Register/Login**: Create an account or use existing credentials
2. **Add URLs**: Enter website URLs to crawl
3. **Monitor Progress**: Watch crawls progress in real-time
4. **Bulk Operations**: Select multiple crawls for re-run or deletion
5. **Individual Actions**: Use the three-dot menu for individual crawl actions

## 📁 Project Structure

```
crawler-tech-challenge/
├── src/                    # Frontend React application
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page components
│   ├── services/          # API service layer
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom React hooks
│   └── types/             # TypeScript type definitions
├── internal/              # Backend Go application
│   ├── handlers/          # HTTP request handlers
│   ├── models/            # Database models
│   ├── middleware/        # HTTP middleware
│   └── database/          # Database connection and migrations
├── database/              # Database initialization scripts
├── cypress/               # E2E test suite
├── docker-compose.yml     # Docker services configuration
└── main.go               # Backend entry point
```

## 🔐 Authentication

The application uses JWT-based authentication:

- **Registration**: Create new user accounts
- **Login**: Authenticate with email/password
- **Token Refresh**: Automatic token renewal
- **Protected Routes**: API endpoints require authentication

## 🌐 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Token refresh

### Crawls

- `GET /api/crawls` - List all crawls
- `POST /api/crawls` - Create new crawl
- `GET /api/crawls/:id` - Get crawl details
- `POST /api/crawls/:id/process` - Start crawl processing
- `POST /api/crawls/:id/stop` - Stop crawl
- `DELETE /api/crawls/:id` - Delete crawl
- `GET /api/crawls/:id/broken-links` - Get broken links

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**

   ```bash
   # Check what's using the port
   lsof -i :3000
   lsof -i :8090

   # Kill the process or use a different port
   ```

2. **Database Connection Issues**

   ```bash
   # Check if MySQL is running
   docker-compose ps

   # Restart database
   docker-compose restart mysql
   ```

3. **Backend Not Starting**

   ```bash
   # Check backend logs
   docker-compose logs backend

   # Restart backend
   docker-compose restart backend
   ```

4. **Frontend Build Issues**
   ```bash
   # Clear node modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

### Environment Variables

Create a `.env` file in the root directory for custom configuration:

```env
# Backend
JWT_SECRET=your-super-secret-jwt-key
PORT=8090

# Database
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=crawler_db
MYSQL_USER=crawler_user
MYSQL_PASSWORD=crawler_password

# Frontend
VITE_API_URL=http://localhost:8090/api
```

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For questions or issues, please open an issue in the repository or contact me at **madina.jampasee@gmail.com**.

## Public Demo (ngrok)

You can access the live frontend here:

👉 You can access the app via ngrok at:
[ https://180e7ee86b80.ngrok-free.app/ ]([https://1d495d7a3a11.ngrok-free.app/](https://180e7ee86b80.ngrok-free.app/ ) 

> **Note:** This link is temporary and may change if the ngrok tunnel is restarted. If the link does not work, please contact the maintainer for an updated URL.
