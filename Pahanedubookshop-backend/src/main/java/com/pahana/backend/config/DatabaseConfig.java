package com.pahana.backend.config;

import java.sql.*;
import java.util.logging.Logger;
import java.util.logging.Level;

public class DatabaseConfig {
    private static final Logger LOGGER = Logger.getLogger(DatabaseConfig.class.getName());
    private static final String DB_URL = "jdbc:sqlite:pahana_bookshop.db";
    private static Connection connection;

    public static void initializeDatabase() {
        try {
            // Create database connection
            connection = DriverManager.getConnection(DB_URL);
            LOGGER.info("Database connection established successfully");

            // Create tables
            createTables();
            
            // Insert sample data
            insertSampleData();
            
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error initializing database", e);
            throw new RuntimeException("Failed to initialize database", e);
        }
    }

    private static void createTables() throws SQLException {
        // Users table
        String createUsersTable = """
            CREATE TABLE IF NOT EXISTS users (
                userId TEXT PRIMARY KEY,
                userEmail TEXT UNIQUE NOT NULL,
                username TEXT NOT NULL,
                password TEXT NOT NULL,
                phoneNumber TEXT,
                userType TEXT NOT NULL,
                branch TEXT,
                profilePicture TEXT,
                createdAt TEXT NOT NULL,
                updatedAt TEXT NOT NULL
            )
        """;

        // Categories table
        String createCategoriesTable = """
            CREATE TABLE IF NOT EXISTS categories (
                categoryId TEXT PRIMARY KEY,
                categoryName TEXT UNIQUE NOT NULL,
                categoryImage TEXT,
                createdAt TEXT NOT NULL,
                updatedAt TEXT NOT NULL
            )
        """;

        // Products table
        String createProductsTable = """
            CREATE TABLE IF NOT EXISTS products (
                productId TEXT PRIMARY KEY,
                productName TEXT NOT NULL,
                categoryName TEXT NOT NULL,
                productPrice REAL NOT NULL,
                productImage TEXT,
                productDescription TEXT,
                createdAt TEXT NOT NULL,
                updatedAt TEXT NOT NULL,
                FOREIGN KEY (categoryName) REFERENCES categories(categoryName)
            )
        """;

        // Orders table
        String createOrdersTable = """
            CREATE TABLE IF NOT EXISTS orders (
                orderId TEXT PRIMARY KEY,
                userId TEXT NOT NULL,
                branch TEXT NOT NULL,
                totalAmount REAL NOT NULL,
                status TEXT NOT NULL,
                paymentMethod TEXT,
                deliveryAddress TEXT,
                customerName TEXT NOT NULL,
                customerPhone TEXT NOT NULL,
                orderDate TEXT NOT NULL,
                updatedAt TEXT NOT NULL,
                FOREIGN KEY (userId) REFERENCES users(userId)
            )
        """;

        // Order items table
        String createOrderItemsTable = """
            CREATE TABLE IF NOT EXISTS order_items (
                itemId TEXT PRIMARY KEY,
                orderId TEXT NOT NULL,
                productId TEXT NOT NULL,
                productName TEXT NOT NULL,
                quantity INTEGER NOT NULL,
                unitPrice REAL NOT NULL,
                totalPrice REAL NOT NULL,
                FOREIGN KEY (orderId) REFERENCES orders(orderId),
                FOREIGN KEY (productId) REFERENCES products(productId)
            )
        """;

        // Reservations table
        String createReservationsTable = """
            CREATE TABLE IF NOT EXISTS reservations (
                reservationId TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                branch TEXT NOT NULL,
                phoneNumber TEXT NOT NULL,
                date TEXT NOT NULL,
                time TEXT NOT NULL,
                persons INTEGER NOT NULL,
                request TEXT,
                status TEXT NOT NULL,
                createdAt TEXT NOT NULL
            )
        """;

        // Feedback table
        String createFeedbackTable = """
            CREATE TABLE IF NOT EXISTS feedback (
                feedbackId TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                phoneNumber TEXT,
                subject TEXT NOT NULL,
                message TEXT NOT NULL,
                staffResponse TEXT,
                createdAt TEXT NOT NULL
            )
        """;

        // Favorites table
        String createFavoritesTable = """
            CREATE TABLE IF NOT EXISTS favorites (
                favoriteId TEXT PRIMARY KEY,
                userId TEXT NOT NULL,
                productId TEXT NOT NULL,
                createdAt TEXT NOT NULL,
                FOREIGN KEY (userId) REFERENCES users(userId),
                FOREIGN KEY (productId) REFERENCES products(productId),
                UNIQUE(userId, productId)
            )
        """;

        // Cart table
        String createCartTable = """
            CREATE TABLE IF NOT EXISTS cart (
                cartId TEXT PRIMARY KEY,
                userId TEXT NOT NULL,
                productId TEXT NOT NULL,
                quantity INTEGER NOT NULL,
                createdAt TEXT NOT NULL,
                FOREIGN KEY (userId) REFERENCES users(userId),
                FOREIGN KEY (productId) REFERENCES products(productId),
                UNIQUE(userId, productId)
            )
        """;

        // Gallery table
        String createGalleryTable = """
            CREATE TABLE IF NOT EXISTS gallery (
                pictureId TEXT PRIMARY KEY,
                pictureName TEXT NOT NULL,
                pictureImage TEXT NOT NULL,
                pictureType TEXT,
                createdAt TEXT NOT NULL
            )
        """;

        // Offers table
        String createOffersTable = """
            CREATE TABLE IF NOT EXISTS offers (
                offerId TEXT PRIMARY KEY,
                offerTitle TEXT NOT NULL,
                offerDescription TEXT,
                offerImage TEXT,
                discountPercentage REAL,
                validFrom TEXT NOT NULL,
                validTo TEXT NOT NULL,
                isActive BOOLEAN DEFAULT 1,
                createdAt TEXT NOT NULL
            )
        """;

        // Branches table
        String createBranchesTable = """
            CREATE TABLE IF NOT EXISTS branches (
                branchId TEXT PRIMARY KEY,
                branchName TEXT UNIQUE NOT NULL,
                branchAddress TEXT NOT NULL,
                branchPhone TEXT,
                branchEmail TEXT,
                createdAt TEXT NOT NULL
            )
        """;

        try (Statement stmt = connection.createStatement()) {
            stmt.execute(createUsersTable);
            stmt.execute(createCategoriesTable);
            stmt.execute(createProductsTable);
            stmt.execute(createOrdersTable);
            stmt.execute(createOrderItemsTable);
            stmt.execute(createReservationsTable);
            stmt.execute(createFeedbackTable);
            stmt.execute(createFavoritesTable);
            stmt.execute(createCartTable);
            stmt.execute(createGalleryTable);
            stmt.execute(createOffersTable);
            stmt.execute(createBranchesTable);
            
            LOGGER.info("All tables created successfully");
        }
    }

    private static void insertSampleData() throws SQLException {
        // Insert default admin user
        String insertAdmin = """
            INSERT OR IGNORE INTO users (userId, userEmail, username, password, phoneNumber, userType, createdAt, updatedAt)
            VALUES ('admin001', 'admin@pahana.com', 'Admin User', 'admin123', '1234567890', 'Admin', datetime('now'), datetime('now'))
        """;

        // Insert sample categories
        String insertCategories = """
            INSERT OR IGNORE INTO categories (categoryId, categoryName, categoryImage, createdAt, updatedAt) VALUES
            ('cat001', 'Fiction', 'fiction.jpg', datetime('now'), datetime('now')),
            ('cat002', 'Non-Fiction', 'non-fiction.jpg', datetime('now'), datetime('now')),
            ('cat003', 'Academic', 'academic.jpg', datetime('now'), datetime('now')),
            ('cat004', 'Children', 'children.jpg', datetime('now'), datetime('now'))
        """;

        // Insert sample branches
        String insertBranches = """
            INSERT OR IGNORE INTO branches (branchId, branchName, branchAddress, branchPhone, branchEmail, createdAt) VALUES
            ('branch001', 'Main Branch', '123 Main Street, Colombo', '0112345678', 'main@pahana.com', datetime('now')),
            ('branch002', 'City Branch', '456 City Road, Kandy', '0812345678', 'city@pahana.com', datetime('now'))
        """;

        try (Statement stmt = connection.createStatement()) {
            stmt.execute(insertAdmin);
            stmt.execute(insertCategories);
            stmt.execute(insertBranches);
            LOGGER.info("Sample data inserted successfully");
        }
    }

    public static Connection getConnection() {
        try {
            if (connection == null || connection.isClosed()) {
                connection = DriverManager.getConnection(DB_URL);
            }
            return connection;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error getting database connection", e);
            throw new RuntimeException("Failed to get database connection", e);
        }
    }

    public static void closeConnection() {
        try {
            if (connection != null && !connection.isClosed()) {
                connection.close();
                LOGGER.info("Database connection closed");
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error closing database connection", e);
        }
    }
} 