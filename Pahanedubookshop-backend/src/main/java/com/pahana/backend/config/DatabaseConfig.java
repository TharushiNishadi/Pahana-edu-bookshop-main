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
            LOGGER.log(Level.SEVERE, "Error i", e);
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
                categoryDescription TEXT,
                status TEXT DEFAULT 'Active',
                displayOrder INTEGER DEFAULT 0,
                parentCategoryId TEXT,
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
                stockQuantity INTEGER DEFAULT 0,
                status TEXT DEFAULT 'Active',
                discountPercentage REAL DEFAULT 0.0,
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
                offerValue TEXT,
                offerImage TEXT,
                discountPercentage REAL,
                validFrom TEXT NOT NULL,
                validTo TEXT NOT NULL,
                isActive BOOLEAN DEFAULT 1,
                createdAt TEXT NOT NULL,
                updatedAt TEXT NOT NULL
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
        
        // Run migrations to add missing columns to existing tables
        runMigrations();
        
        // Log current database schema for debugging
        logDatabaseSchema();
    }

    private static void runMigrations() throws SQLException {
        try (Statement stmt = connection.createStatement()) {
            // Check if categoryDescription column exists in categories table
            try {
                stmt.execute("SELECT categoryDescription FROM categories LIMIT 1");
                LOGGER.info("categoryDescription column already exists in categories table");
            } catch (SQLException e) {
                // Column doesn't exist, add it
                LOGGER.info("Adding categoryDescription column to categories table");
                stmt.execute("ALTER TABLE categories ADD COLUMN categoryDescription TEXT");
                LOGGER.info("categoryDescription column added successfully");
            }
            
            // Check if status column exists in categories table
            try {
                stmt.execute("SELECT status FROM categories LIMIT 1");
                LOGGER.info("status column already exists in categories table");
            } catch (SQLException e) {
                // Column doesn't exist, add it
                LOGGER.info("Adding status column to categories table");
                stmt.execute("ALTER TABLE categories ADD COLUMN status TEXT DEFAULT 'Active'");
                LOGGER.info("status column added successfully");
            }
            
            // Check if displayOrder column exists in categories table
            try {
                stmt.execute("SELECT displayOrder FROM categories LIMIT 1");
                LOGGER.info("displayOrder column already exists in categories table");
            } catch (SQLException e) {
                // Column doesn't exist, add it
                LOGGER.info("Adding displayOrder column to categories table");
                stmt.execute("ALTER TABLE categories ADD COLUMN displayOrder INTEGER DEFAULT 0");
                LOGGER.info("displayOrder column added successfully");
            }
            
            // Check if parentCategoryId column exists in categories table
            try {
                stmt.execute("SELECT parentCategoryId FROM categories LIMIT 1");
                LOGGER.info("parentCategoryId column already exists in categories table");
            } catch (SQLException e) {
                // Column doesn't exist, add it
                LOGGER.info("Adding parentCategoryId column to categories table");
                stmt.execute("ALTER TABLE categories ADD COLUMN parentCategoryId TEXT");
                LOGGER.info("parentCategoryId column added successfully");
            }
            
            // Check if productImage column exists in products table
            try {
                stmt.execute("SELECT productImage FROM products LIMIT 1");
                LOGGER.info("productImage column already exists in products table");
            } catch (SQLException e) {
                // Column doesn't exist, add it
                LOGGER.info("Adding productImage column to products table");
                stmt.execute("ALTER TABLE products ADD COLUMN productImage TEXT");
                LOGGER.info("productImage column added successfully");
            }
            
            // Check if stockQuantity column exists in products table
            try {
                stmt.execute("SELECT stockQuantity FROM products LIMIT 1");
                LOGGER.info("stockQuantity column already exists in products table");
            } catch (SQLException e) {
                // Column doesn't exist, add it
                LOGGER.info("Adding stockQuantity column to products table");
                stmt.execute("ALTER TABLE products ADD COLUMN stockQuantity INTEGER DEFAULT 0");
                LOGGER.info("stockQuantity column added successfully");
            }
            
            // Check if status column exists in products table
            try {
                stmt.execute("SELECT status FROM products LIMIT 1");
                LOGGER.info("status column already exists in products table");
            } catch (SQLException e) {
                // Column doesn't exist, add it
                LOGGER.info("Adding status column to products table");
                stmt.execute("ALTER TABLE products ADD COLUMN status TEXT DEFAULT 'Active'");
                LOGGER.info("status column added successfully");
            }
            
                        // Check if discountPercentage column exists in products table
            try {
                stmt.execute("SELECT discountPercentage FROM products LIMIT 1");
                LOGGER.info("discountPercentage column already exists in products table");
            } catch (SQLException e) {
                // Column doesn't exist, add it
                LOGGER.info("Adding discountPercentage column to products table");
                stmt.execute("ALTER TABLE products ADD COLUMN discountPercentage REAL DEFAULT 0.0");
                LOGGER.info("discountPercentage column added successfully");
            }
            
            // Check if categoryName column exists in products table
            try {
                stmt.execute("SELECT categoryName FROM products LIMIT 1");
                LOGGER.info("categoryName column already exists in products table");
            } catch (SQLException e) {
                // Column doesn't exist, add it
                LOGGER.info("Adding categoryName column to products table");
                stmt.execute("ALTER TABLE products ADD COLUMN categoryName TEXT");
                LOGGER.info("categoryName column added successfully");
            }
            

            
            // Check if offerValue column exists in offers table
            try {
                stmt.execute("SELECT offerValue FROM offers LIMIT 1");
                LOGGER.info("offerValue column already exists in offers table");
            } catch (SQLException e) {
                // Column doesn't exist, add it
                LOGGER.info("Adding offerValue column to offers table");
                stmt.execute("ALTER TABLE offers ADD COLUMN offerValue TEXT");
                LOGGER.info("offerValue column added successfully");
            }
            
            // Check if updatedAt column exists in offers table
            try {
                stmt.execute("SELECT updatedAt FROM offers LIMIT 1");
                LOGGER.info("updatedAt column already exists in offers table");
            } catch (SQLException e) {
                // Column doesn't exist, add it
                LOGGER.info("Adding updatedAt column to offers table");
                stmt.execute("ALTER TABLE offers ADD COLUMN updatedAt TEXT");
                LOGGER.info("updatedAt column added successfully");
            }

            // Check if updatedAt column exists in gallery table
            try {
                stmt.execute("SELECT updatedAt FROM gallery LIMIT 1");
                LOGGER.info("updatedAt column already exists in gallery table");
            } catch (SQLException e) {
                // Column doesn't exist, add it
                LOGGER.info("Adding updatedAt column to gallery table");
                stmt.execute("ALTER TABLE gallery ADD COLUMN updatedAt TEXT");
                LOGGER.info("updatedAt column added successfully");
            }

            LOGGER.info("Database migrations completed successfully");
        }
    }

    private static void insertSampleData() throws SQLException {
        // Insert default admin user
        String insertAdmin = """
            INSERT OR IGNORE INTO users (userId, userEmail, username, password, phoneNumber, userType, createdAt, updatedAt)
            VALUES ('admin001', 'admin@pahana.com', 'Admin User', 'admin123', '1234567890', 'Admin', datetime('now'), datetime('now'))
        """;

        // Insert test customer user
        String insertTestCustomer = """
            INSERT OR IGNORE INTO users (userId, userEmail, username, password, phoneNumber, userType, createdAt, updatedAt)
            VALUES ('cust001', 'customer@test.com', 'Test Customer', 'customer123', '1234567890', 'Customer', datetime('now'), datetime('now'))
        """;

        // Insert sample categories
        String insertCategories = """
            INSERT OR IGNORE INTO categories (categoryId, categoryName, categoryImage, categoryDescription, createdAt, updatedAt) VALUES
            ('cat001', 'Fiction', 'fiction.jpg', 'Fiction books and novels', datetime('now'), datetime('now')),
            ('cat002', 'Non-Fiction', 'non-fiction.jpg', 'Non-fiction and educational books', datetime('now'), datetime('now')),
            ('cat003', 'Academic', 'academic.jpg', 'Academic and study materials', datetime('now'), datetime('now')),
            ('cat004', 'Children', 'children.jpg', 'Children books and stories', datetime('now'), datetime('now'))
        """;

        // Insert sample products
        String insertProducts = """
            INSERT OR IGNORE INTO products (productId, productName, productDescription, productPrice, productImage, categoryName, stockQuantity, status, discountPercentage, createdAt, updatedAt) VALUES
            ('prod001', 'Sample Book 1', 'A sample fiction book for testing', 500.00, 'book1.jpg', 'Fiction', 10, 'Active', 0.0, datetime('now'), datetime('now')),
            ('prod002', 'Sample Book 2', 'A sample non-fiction book for testing', 500.00, 'book2.jpg', 'Non-Fiction', 15, 'Active', 0.0, datetime('now'), datetime('now')),
            ('prod003', 'Sample Book 3', 'A sample academic book for testing', 1200.00, 'book3.jpg', 'Academic', 8, 'Active', 0.0, datetime('now'), datetime('now')),
            ('prod004', 'Sample Book 4', 'A sample children book for testing', 1000.00, 'book4.jpg', 'Children', 20, 'Active', 0.0, datetime('now'), datetime('now'))
        """;
        
        // Update existing categories to add descriptions if they don't have them
        String updateExistingCategories = """
            UPDATE categories SET categoryDescription = 'Fiction books and novels' WHERE categoryName = 'Fiction' AND (categoryDescription IS NULL OR categoryDescription = '')
        """;
        
        String updateNonFiction = """
            UPDATE categories SET categoryDescription = 'Non-fiction and educational books' WHERE categoryName = 'Non-Fiction' AND (categoryDescription IS NULL OR categoryDescription = '')
        """;
        
        String updateAcademic = """
            UPDATE categories SET categoryDescription = 'Academic and study materials' WHERE categoryName = 'Academic' AND (categoryDescription IS NULL OR categoryDescription = '')
        """;
        
        String updateChildren = """
            UPDATE categories SET categoryDescription = 'Children books and stories' WHERE categoryName = 'Children' AND (categoryDescription IS NULL OR categoryDescription = '')
        """;

        // Insert sample branches
        String insertBranches = """
            INSERT OR IGNORE INTO branches (branchId, branchName, branchAddress, branchPhone, branchEmail, createdAt) VALUES
            ('branch001', 'Main Branch', '123 Main Street, Colombo', '0112345678', 'main@pahana.com', datetime('now')),
            ('branch002', 'City Branch', '456 City Road, Kandy', '0812345678', 'city@pahana.com', datetime('now'))
        """;
        
        // Insert sample offers
        String insertOffers = """
            INSERT OR IGNORE INTO offers (offerId, offerTitle, offerDescription, offerValue, offerImage, validFrom, validTo, isActive, createdAt, updatedAt) VALUES
            ('off001', 'Summer Sale', 'Get 20% off on all summer books', '20%', 'summer_sale.jpg', datetime('now'), datetime('now', '+30 days'), 1, datetime('now'), datetime('now')),
            ('off002', 'Student Discount', 'Special discount for students', '15%', 'student_discount.jpg', datetime('now'), datetime('now', '+90 days'), 1, datetime('now'), datetime('now')),
            ('off003', 'New Year Special', 'Start the year with great offers', '25%', 'new_year.jpg', datetime('now'), datetime('now', '+60 days'), 1, datetime('now'), datetime('now'))
        """;

        // Insert sample orders for testing
        String insertSampleOrders = """
            INSERT OR IGNORE INTO orders (orderId, userId, branch, totalAmount, status, paymentMethod, deliveryAddress, customerName, customerPhone, orderDate, updatedAt) VALUES
            ('ord001', 'admin001', 'Main Branch', 1500.00, 'Confirmed', 'Cash', '123 Test Street, Colombo', 'Test Customer', '1234567890', datetime('now'), datetime('now')),
            ('ord002', 'admin001', 'City Branch', 2200.00, 'Pending', 'Card', '456 Sample Road, Kandy', 'Test Customer', '1234567890', datetime('now'), datetime('now')),
            ('ord003', 'cust001', 'Main Branch', 1800.00, 'Confirmed', 'Cash', '789 Customer Ave, Colombo', 'Test Customer', '1234567890', datetime('now'), datetime('now')),
            ('ord004', 'cust001', 'City Branch', 950.00, 'Pending', 'Card', '321 Customer St, Kandy', 'Test Customer', '1234567890', datetime('now'), datetime('now'))
        """;

        // Insert sample order items
        String insertSampleOrderItems = """
            INSERT OR IGNORE INTO order_items (itemId, orderId, productId, productName, quantity, unitPrice, totalPrice) VALUES
            ('item001', 'ord001', 'prod001', 'Sample Book 1', 2, 500.00, 1000.00),
            ('item002', 'ord001', 'prod002', 'Sample Book 2', 1, 500.00, 500.00),
            ('item003', 'ord002', 'prod003', 'Sample Book 3', 1, 1200.00, 1200.00),
            ('item004', 'ord002', 'prod004', 'Sample Book 4', 1, 1000.00, 1000.00),
            ('item005', 'ord003', 'prod001', 'Sample Book 1', 1, 500.00, 500.00),
            ('item006', 'ord003', 'prod003', 'Sample Book 3', 1, 1200.00, 1200.00),
            ('item007', 'ord003', 'prod004', 'Sample Book 4', 1, 100.00, 100.00),
            ('item008', 'ord004', 'prod002', 'Sample Book 2', 1, 500.00, 500.00),
            ('item009', 'ord004', 'prod004', 'Sample Book 4', 1, 450.00, 450.00)
        """;

        try (Statement stmt = connection.createStatement()) {
            stmt.execute(insertAdmin);
            stmt.execute(insertTestCustomer);
            stmt.execute(insertCategories);
            
            // Try to insert products, but handle errors gracefully
            try {
                stmt.execute(insertProducts);
                LOGGER.info("Sample products inserted successfully");
            } catch (SQLException e) {
                LOGGER.warning("Could not insert sample products: " + e.getMessage());
                LOGGER.info("This might be due to existing data or schema differences");
            }
            
            stmt.execute(insertBranches);
            
            // Try to insert offers, but handle errors gracefully
            try {
                stmt.execute(insertOffers);
                LOGGER.info("Sample offers inserted successfully");
            } catch (SQLException e) {
                LOGGER.warning("Could not insert sample offers: " + e.getMessage());
                LOGGER.info("This might be due to existing data or schema differences");
            }
            
            // Try to insert orders, but handle errors gracefully
            try {
                stmt.execute(insertSampleOrders);
                LOGGER.info("Sample orders inserted successfully");
            } catch (SQLException e) {
                LOGGER.warning("Could not insert sample orders: " + e.getMessage());
                LOGGER.info("This might be due to existing data or schema differences");
            }
            
            try {
                stmt.execute(insertSampleOrderItems);
                LOGGER.info("Sample order items inserted successfully");
            } catch (SQLException e) {
                LOGGER.warning("Could not insert sample order items: " + e.getMessage());
                LOGGER.info("This might be due to existing data or schema differences");
            }
            
            // Try to create a simple test order if the complex ones fail
            try {
                String simpleOrder = """
                    INSERT OR IGNORE INTO orders (orderId, userId, branch, totalAmount, status, paymentMethod, deliveryAddress, customerName, customerPhone, orderDate, updatedAt) VALUES
                    ('test001', 'cust001', 'Main Branch', 100.00, 'Pending', 'Cash', 'Test Address', 'Test User', '1234567890', datetime('now'), datetime('now'))
                """;
                stmt.execute(simpleOrder);
                LOGGER.info("Simple test order created successfully");
            } catch (SQLException e) {
                LOGGER.warning("Could not create simple test order: " + e.getMessage());
            }
            
            // Insert sample favorites for testing
            try {
                String insertSampleFavorites = """
                    INSERT OR IGNORE INTO favorites (favoriteId, userId, productId, createdAt) VALUES
                    ('fav001', 'cust001', 'prod001', datetime('now')),
                    ('fav002', 'cust001', 'prod003', datetime('now')),
                    ('fav003', 'admin001', 'prod002', datetime('now'))
                """;
                stmt.execute(insertSampleFavorites);
                LOGGER.info("Sample favorites inserted successfully");
            } catch (SQLException e) {
                LOGGER.warning("Could not insert sample favorites: " + e.getMessage());
                LOGGER.info("This might be due to existing data or schema differences");
            }
            
            // Insert sample gallery data for testing
            try {
                String insertSampleGallery = """
                    INSERT OR IGNORE INTO gallery (pictureId, pictureName, pictureImage, pictureType, createdAt) VALUES
                    ('gal001', 'Fiction Books', 'book1.jpg', 'Fiction', datetime('now')),
                    ('gal002', 'Non-Fiction Books', 'book2.jpg', 'Non-Fiction', datetime('now')),
                    ('gal003', 'Academic Books', 'book3.jpg', 'Academic', datetime('now')),
                    ('gal004', 'Children Books', 'book4.jpg', 'Children', datetime('now'))
                """;
                stmt.execute(insertSampleGallery);
                LOGGER.info("Sample gallery data inserted successfully");
            } catch (SQLException e) {
                LOGGER.warning("Could not insert sample gallery data: " + e.getMessage());
                LOGGER.info("This might be due to existing data or schema differences");
            }
            
            // Update existing categories with descriptions
            stmt.execute(updateExistingCategories);
            stmt.execute(updateNonFiction);
            stmt.execute(updateAcademic);
            stmt.execute(updateChildren);
            
            LOGGER.info("Sample data insertion completed");
        }
    }
    
    private static void logDatabaseSchema() {
        try (Statement stmt = connection.createStatement()) {
            LOGGER.info("=== CURRENT DATABASE SCHEMA ===");
            
            // Check products table structure
            try {
                ResultSet rs = stmt.executeQuery("PRAGMA table_info(products)");
                LOGGER.info("Products table columns:");
                while (rs.next()) {
                    String colName = rs.getString("name");
                    String colType = rs.getString("type");
                    LOGGER.info("  - " + colName + " (" + colType + ")");
                }
            } catch (SQLException e) {
                LOGGER.warning("Could not get products table info: " + e.getMessage());
            }
            
            // Check categories table structure
            try {
                ResultSet rs = stmt.executeQuery("PRAGMA table_info(categories)");
                LOGGER.info("Categories table columns:");
                while (rs.next()) {
                    String colName = rs.getString("name");
                    String colType = rs.getString("type");
                    LOGGER.info("  - " + colName + " (" + colType + ")");
                }
            } catch (SQLException e) {
                LOGGER.warning("Could not get categories table info: " + e.getMessage());
            }
            
            LOGGER.info("=== END SCHEMA INFO ===");
        } catch (SQLException e) {
            LOGGER.warning("Could not log database schema: " + e.getMessage());
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