# Pahana Edu Bookshop Backend

A simple Java backend server for the Pahana Edu Bookshop React frontend application. This backend is built using pure Java without any frameworks, using only standard Java libraries and SQLite for the database.

## Features

- **Authentication**: User login, registration, and password reset functionality
- **Product Management**: CRUD operations for products and categories
- **Order Management**: Handle customer orders and order status updates
- **Feedback System**: Customer feedback collection and management
- **Gallery Management**: Image gallery for the bookshop
- **Favorites & Cart**: User favorites and shopping cart functionality
- **JWT Authentication**: Secure token-based authentication
- **CORS Support**: Cross-origin resource sharing enabled
- **SQLite Database**: Lightweight, file-based database

## Prerequisites

- Java 17 or higher
- Maven 3.6 or higher
- SQLite (included as dependency)

## Installation & Setup

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd Pahanedubookshop-backend
   ```

2. **Build the project**:
   ```bash
   mvn clean package
   ```

3. **Run the server**:
   ```bash
   java -jar target/pahana-backend-1.0.0.jar
   ```

   Or run directly with Maven:
   ```bash
   mvn exec:java -Dexec.mainClass="com.pahana.backend.Main"
   ```

## API Endpoints

### Authentication
- `POST /user/login` - User login
- `POST /user/register` - User registration
- `POST /api/password/request` - Request password reset
- `POST /api/password/verify` - Verify password reset code
- `POST /api/password/reset` - Reset password

### Products
- `GET /product` - Get all products
- `GET /product/{id}` - Get product by ID
- `GET /product/byCategory?categoryName={name}` - Get products by category
- `POST /product` - Create new product
- `PUT /product/{id}` - Update product
- `DELETE /product/{id}` - Delete product

### Categories
- `GET /category` - Get all categories
- `GET /category/{id}` - Get category by ID
- `POST /category` - Create new category
- `PUT /category/{id}` - Update category
- `DELETE /category/{id}` - Delete category

### Orders
- `GET /orders` - Get all orders
- `POST /orders` - Create new order
- `PUT /orders/{id}/status` - Update order status

### Reservations
- `GET /reservation` - Get all reservations
- `POST /reservation` - Create new reservation
- `PUT /reservation/{id}/status` - Update reservation status

### Feedback
- `GET /feedback` - Get all feedback
- `POST /feedback` - Submit feedback

### Other
- `GET /branch` - Get all branches
- `GET /gallery` - Get gallery images
- `GET /offer` - Get offers
- `GET /api/favorites` - Get user favorites
- `GET /api/cart` - Get user cart

## Database

The application uses SQLite as the database, which is automatically created when the server starts. The database file (`pahana_bookshop.db`) will be created in the project root directory.

### Sample Data

The application comes with some sample data:
- Default admin user: `admin@pahana.com` / `admin123`
- Sample categories: Fiction, Non-Fiction, Academic, Children
- Sample branches: Main Branch, City Branch

## Configuration

The server runs on port 8080 by default. You can modify this in the `Main.java` file.

## Project Structure

```
src/main/java/com/pahana/backend/
├── Main.java                    # Main application entry point
├── config/
│   └── DatabaseConfig.java      # Database configuration and initialization
├── handlers/                    # HTTP request handlers
│   ├── AuthHandler.java         # Authentication endpoints
│   ├── ProductHandler.java      # Product management
│   ├── CategoryHandler.java     # Category management
│   ├── OrderHandler.java        # Order management
│   ├── ReservationHandler.java  # Reservation management
│   ├── FeedbackHandler.java     # Feedback management
│   ├── BranchHandler.java       # Branch management
│   ├── GalleryHandler.java      # Gallery management
│   ├── OfferHandler.java        # Offer management
│   ├── FavoritesHandler.java    # Favorites management
│   ├── CartHandler.java         # Cart management
│   └── StaticFileHandler.java   # Static file serving
├── middleware/                  # HTTP filters
│   ├── CorsFilter.java          # CORS handling
│   └── AuthFilter.java          # Authentication filter
├── models/                      # Data models
│   ├── User.java               # User entity
│   ├── Product.java            # Product entity
│   ├── Category.java           # Category entity
│   └── Order.java              # Order entity
└── utils/                       # Utility classes
    ├── JsonUtil.java           # JSON serialization/deserialization
    └── JwtUtil.java            # JWT token handling
```

## Development

### Adding New Endpoints

1. Create a new handler class in the `handlers` package
2. Implement the `HttpHandler` interface
3. Add the handler to the `HttpServer.setupRoutes()` method

### Database Changes

1. Modify the table creation SQL in `DatabaseConfig.createTables()`
2. Add any necessary data migration logic

## Troubleshooting

### Common Issues

1. **Port already in use**: Change the port in `Main.java` or kill the process using port 8080
2. **Database errors**: Delete the `pahana_bookshop.db` file and restart the server
3. **CORS issues**: Ensure the frontend is making requests to the correct backend URL

### Logs

The application uses Java's built-in logging. Check the console output for any error messages.

## Security Notes

- This is a development version with basic security
- Passwords are stored in plain text (should be hashed in production)
- JWT tokens use a simple secret key (should be more secure in production)
- CORS is set to allow all origins (should be restricted in production)

## License

This project is for educational purposes. 