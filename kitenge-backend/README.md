# Kitenge Bora Backend - Spring Boot

A modern Spring Boot backend for the Kitenge Bora e-commerce platform, replacing the Node.js/Express implementation with a more robust, scalable solution.

## Features

- ✅ **RESTful API** - Clean, well-structured REST endpoints
- ✅ **JWT Authentication** - Stateless authentication with JSON Web Tokens
- ✅ **Spring Security** - Role-based access control (Admin/User)
- ✅ **PostgreSQL Integration** - JPA/Hibernate for database operations
- ✅ **File Upload** - Image upload handling for products
- ✅ **Email Notifications** - Order confirmation emails (optional)
- ✅ **CORS Support** - Configured for frontend integration
- ✅ **Input Validation** - Request validation using Bean Validation

## Tech Stack

- **Spring Boot 3.2.0**
- **Java 17**
- **PostgreSQL**
- **Spring Data JPA**
- **Spring Security**
- **JWT (jjwt)**
- **Lombok**
- **Maven**

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- PostgreSQL 12+
- (Optional) Email account for order notifications

## Setup Instructions

### 1. Database Setup

Make sure PostgreSQL is running and create the database:

```sql
CREATE DATABASE kitenge;
```

The application will automatically create tables using JPA's `ddl-auto=update` setting.

Alternatively, you can run the SQL script from the original project:
```bash
psql -U postgres -f ../kitenge-project/setup_kitenge.sql
```

### 2. Configuration

Edit `src/main/resources/application.properties`:

```properties
# Update database credentials
spring.datasource.username=postgres
spring.datasource.password=your_password

# Update JWT secret (use a strong random string in production)
jwt.secret=your-secret-key-change-this-in-production

# Optional: Email configuration
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
app.admin.email=admin@kitenge.com
```

### 3. Build and Run

```bash
# Navigate to the backend directory
cd kitenge-backend

# Build the project
mvn clean install

# Run the application
mvn spring-boot:run
```

Or use your IDE to run `KitengeBoraApplication.java`.

The server will start on `http://localhost:8080`

## API Endpoints

### Authentication

- `POST /api/register` - Register a new user
- `POST /api/login` - Login and get JWT token
- `POST /api/logout` - Logout (client-side token removal)
- `GET /api/check-auth` - Check authentication status

### Products (Public)

- `GET /api/public-products` - Get all active products

### Products (Admin Only)

- `GET /api/products` - Get all products (including inactive)
- `GET /api/products/{id}` - Get product by ID
- `POST /api/products` - Create new product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product

### Orders

- `POST /api/orders` - Create a new order (public)

### Wishlist (Authenticated)

- `GET /api/wishlist` - Get user's wishlist
- `POST /api/wishlist` - Add/remove item from wishlist

### File Upload (Admin Only)

- `POST /api/upload-image` - Upload product image

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. After login, include the token in requests:

```
Authorization: Bearer <your-jwt-token>
```

### Example Login Request

```json
POST /api/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Example Response

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com"
  },
  "isAdmin": false
}
```

## Frontend Integration

Update your frontend to use the new API:

1. **Base URL**: Change from `http://localhost:4000` to `http://localhost:8080`
2. **Authentication**: Store JWT token and include in headers:
   ```javascript
   headers: {
     'Authorization': `Bearer ${token}`,
     'Content-Type': 'application/json'
   }
   ```
3. **Endpoints**: All endpoints remain the same (`/api/products`, `/api/orders`, etc.)

## Project Structure

```
kitenge-backend/
├── src/
│   ├── main/
│   │   ├── java/com/kitenge/
│   │   │   ├── config/          # Configuration classes
│   │   │   ├── controller/       # REST controllers
│   │   │   ├── dto/              # Data Transfer Objects
│   │   │   ├── model/            # Entity models
│   │   │   ├── repository/       # JPA repositories
│   │   │   ├── security/         # Security configuration
│   │   │   ├── service/          # Business logic
│   │   │   └── util/             # Utility classes
│   │   └── resources/
│   │       └── application.properties
│   └── test/
└── pom.xml
```

## Differences from Node.js Version

1. **Stateless Authentication**: Uses JWT instead of server-side sessions
2. **Type Safety**: Strong typing with Java
3. **Better Structure**: Layered architecture (Controller → Service → Repository)
4. **Automatic Validation**: Bean Validation annotations
5. **Database Migrations**: JPA handles schema updates automatically
6. **Better Error Handling**: Structured exception handling

## Production Considerations

1. **Change JWT Secret**: Use a strong, random secret key
2. **Database Connection Pool**: Configure connection pooling
3. **HTTPS**: Enable HTTPS in production
4. **CORS**: Restrict CORS to your frontend domain
5. **Logging**: Configure proper logging levels
6. **Environment Variables**: Use environment variables for sensitive data
7. **File Storage**: Consider cloud storage (S3, etc.) for uploaded files

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check database credentials in `application.properties`
- Ensure database `kitenge` exists

### Port Already in Use
- Change `server.port` in `application.properties`
- Or stop the process using port 8080

### JWT Token Issues
- Ensure token is included in `Authorization` header
- Check token expiration (default: 30 days)
- Verify JWT secret matches

## License

This project is part of the Kitenge Bora e-commerce platform.

