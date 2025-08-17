package com.pahana.backend.handlers;

import com.pahana.backend.config.DatabaseConfig;
import com.pahana.backend.models.Order;
import com.pahana.backend.utils.JsonUtil;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.sql.*;
import java.time.LocalDateTime;
import java.util.*;
import java.util.logging.Logger;
import java.util.logging.Level;

public class OrderHandler implements HttpHandler {
    private static final Logger LOGGER = Logger.getLogger(OrderHandler.class.getName());

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        try {
            String path = exchange.getRequestURI().getPath();
            String method = exchange.getRequestMethod();
            
            LOGGER.info("=== ORDER REQUEST ===");
            LOGGER.info("Method: " + method);
            LOGGER.info("Path: " + path);

            setCorsHeaders(exchange);

            if ("OPTIONS".equals(method)) {
                exchange.sendResponseHeaders(200, -1);
                return;
            }

            // Handle different order endpoints
            if (path.startsWith("/orders/")) {
                String orderId = path.substring("/orders/".length());
                
                switch (method) {
                    case "GET":
                        handleGetOrderById(exchange, orderId);
                        break;
                    case "PUT":
                        handleUpdateOrder(exchange, orderId);
                        break;
                    case "DELETE":
                        handleDeleteOrder(exchange, orderId);
                        break;
                    default:
                        sendErrorResponse(exchange, 405, "Method not allowed");
                }
            } else if ("/orders".equals(path)) {
                switch (method) {
                    case "GET":
                handleGetOrders(exchange);
                        break;
                    case "POST":
                        handleCreateOrder(exchange);
                        break;
                    default:
                        sendErrorResponse(exchange, 405, "Method not allowed");
                }
            } else if ("/test-orders".equals(path)) {
                handleTestOrders(exchange);
            } else if ("/test-create-order".equals(path)) {
                // Test endpoint to create a sample order
                if ("POST".equals(method)) {
                    handleTestCreateOrder(exchange);
                } else {
                    sendErrorResponse(exchange, 405, "Method not allowed");
                }
            } else if ("/test-user-exists".equals(path)) {
                // Test endpoint to check if a user exists
                if ("GET".equals(method)) {
                    handleTestUserExists(exchange);
                } else {
                    sendErrorResponse(exchange, 405, "Method not allowed");
                }
            } else if ("/test-database".equals(path)) {
                // Test endpoint to check database tables and structure
                if ("GET".equals(method)) {
                    handleTestDatabase(exchange);
                } else {
                    sendErrorResponse(exchange, 405, "Method not allowed");
                }
            } else if ("/test-create-sample-order".equals(path)) {
                // Test endpoint to create a sample order
                if ("POST".equals(method)) {
                    handleTestCreateSampleOrder(exchange);
                } else {
                    sendErrorResponse(exchange, 405, "Method not allowed");
                }
            } else if ("/orders/sales-report".equals(path)) {
                // Sales report endpoint
                if ("GET".equals(method)) {
                    handleSalesReport(exchange);
                } else {
                    sendErrorResponse(exchange, 405, "Method not allowed");
                }
            } else if ("/orders/financial-report".equals(path)) {
                // Financial report endpoint
                if ("GET".equals(method)) {
                    handleFinancialReport(exchange);
                } else {
                    sendErrorResponse(exchange, 405, "Method not allowed");
                }
            } else {
                sendErrorResponse(exchange, 404, "Endpoint not found");
            }
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error handling order request", e);
            sendErrorResponse(exchange, 500, "Internal server error");
        }
    }

    private void handleCreateOrder(HttpExchange exchange) throws IOException {
        try {
            LOGGER.info("=== CREATE ORDER ===");
            
            String requestBody = getRequestBody(exchange);
            LOGGER.info("Request body: " + requestBody);
            
            Map<String, Object> orderData = JsonUtil.fromJson(requestBody, Map.class);
            LOGGER.info("Parsed order data: " + orderData);
            
            // Extract order information
            String userId = (String) orderData.get("userId");
            String userEmail = (String) orderData.get("userEmail");
            List<Map<String, Object>> items = (List<Map<String, Object>>) orderData.get("items");
            String branch = (String) orderData.get("branch");
            String paymentMethod = (String) orderData.get("paymentMethod");
            String deliveryAddress = (String) orderData.get("deliveryAddress");
            String offerId = (String) orderData.get("offerId");
            
            // Handle different numeric types for amounts
            Double taxAmount = convertToDouble(orderData.get("taxAmount"));
            Double deliveryCharges = convertToDouble(orderData.get("deliveryCharges"));
            Double discountAmount = convertToDouble(orderData.get("discountAmount"));
            Double finalAmount = convertToDouble(orderData.get("finalAmount"));
            
            // Validate required fields
            if (userId == null || items == null || branch == null || paymentMethod == null || deliveryAddress == null) {
                sendErrorResponse(exchange, 400, "Missing required fields: userId, items, branch, paymentMethod, deliveryAddress");
                return;
            }
            
            // Calculate total amount if not provided
            if (finalAmount == null) {
                double total = 0.0;
                for (Map<String, Object> item : items) {
                    Double price = convertToDouble(item.get("price"));
                    Integer quantity = convertToInteger(item.get("quantity"));
                    if (price != null && quantity != null) {
                        total += price * quantity;
                    }
                }
                finalAmount = total;
            }
            
            // Create the order
            String orderId = createOrder(userId, userEmail, items, branch, paymentMethod, deliveryAddress, 
                                       offerId, taxAmount, deliveryCharges, discountAmount, finalAmount);
            
            if (orderId != null) {
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Order created successfully");
                response.put("orderId", orderId);
                response.put("finalAmount", finalAmount);
                sendJsonResponse(exchange, 201, response);
            } else {
                sendErrorResponse(exchange, 500, "Failed to create order");
            }
            
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error creating order", e);
            String errorMessage = "Failed to create order";
            if (e.getCause() != null) {
                errorMessage += ": " + e.getCause().getMessage();
            } else if (e.getMessage() != null) {
                errorMessage += ": " + e.getMessage();
            }
            sendErrorResponse(exchange, 500, errorMessage);
        }
    }

    private void handleGetOrders(HttpExchange exchange) throws IOException {
        try {
            LOGGER.info("=== GET ORDERS ===");
            
            // Get query parameters
            String query = exchange.getRequestURI().getQuery();
            Map<String, String> params = parseQueryString(query);
            String userId = params.get("userId");
            
            LOGGER.info("userId: " + userId);
            
            List<Map<String, Object>> orders;
            if (userId != null) {
                orders = getOrdersByUserId(userId);
            } else {
                orders = getAllOrders();
            }
            
            sendJsonResponse(exchange, 200, orders);
            
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error getting orders", e);
            sendErrorResponse(exchange, 500, "Failed to get orders");
        }
    }

    private void handleTestOrders(HttpExchange exchange) throws IOException {
        try {
            LOGGER.info("=== TEST ORDERS ENDPOINT ===");
            
            Map<String, Object> testResponse = new HashMap<>();
            testResponse.put("message", "Orders endpoint is working");
            testResponse.put("timestamp", LocalDateTime.now().toString());
            testResponse.put("availableEndpoints", Arrays.asList(
                "GET /orders - Get all orders or filter by userId",
                "POST /orders - Create new order",
                "GET /orders/{id} - Get order by ID",
                "PUT /orders/{id} - Update order",
                "DELETE /orders/{id} - Delete order"
            ));
            
            sendJsonResponse(exchange, 200, testResponse);
            
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error in test orders endpoint", e);
            sendErrorResponse(exchange, 500, "Test failed");
        }
    }

    private void handleTestCreateOrder(HttpExchange exchange) throws IOException {
        try {
            LOGGER.info("=== TEST CREATE ORDER ===");
            
            // Create sample order data
            String userId = "cust001"; // Use existing user ID
            String userEmail = "customer@example.com";
            List<Map<String, Object>> items = new ArrayList<>();
            
            // Sample item 1
            Map<String, Object> item1 = new HashMap<>();
            item1.put("productId", "prod_001");
            item1.put("productName", "Sample Book 1");
            item1.put("quantity", 2);
            item1.put("price", 1500.0);
            items.add(item1);
            
            // Sample item 2
            Map<String, Object> item2 = new HashMap<>();
            item2.put("productId", "prod_002");
            item2.put("productName", "Sample Book 2");
            item2.put("quantity", 1);
            item2.put("price", 2000.0);
            items.add(item2);
            
            String branch = "Main Branch";
            String paymentMethod = "Online Payment";
            String deliveryAddress = "123 Test Street, Colombo";
            String offerId = null;
            Double taxAmount = 140.0;
            Double deliveryCharges = 175.0;
            Double discountAmount = 0.0;
            Double finalAmount = 5015.0; // 2*1500 + 1*2000 + 140 + 175
            
            LOGGER.info("Creating test order with data:");
            LOGGER.info("userId: " + userId);
            LOGGER.info("items count: " + items.size());
            LOGGER.info("finalAmount: " + finalAmount);
            
            // Create the order
            String orderId = createOrder(userId, userEmail, items, branch, paymentMethod, deliveryAddress, 
                                       offerId, taxAmount, deliveryCharges, discountAmount, finalAmount);
            
            if (orderId != null) {
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Test order created successfully");
                response.put("orderId", orderId);
                response.put("finalAmount", finalAmount);
                response.put("items", items);
                sendJsonResponse(exchange, 201, response);
            } else {
                sendErrorResponse(exchange, 500, "Failed to create test order");
            }
            
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error creating test order", e);
            sendErrorResponse(exchange, 500, "Failed to create test order: " + e.getMessage());
        }
    }

    private void handleGetOrderById(HttpExchange exchange, String orderId) throws IOException {
        try {
            LOGGER.info("=== GET ORDER BY ID ===");
            LOGGER.info("orderId: " + orderId);
            
            Map<String, Object> order = getOrderById(orderId);
            if (order != null) {
                sendJsonResponse(exchange, 200, order);
            } else {
                sendErrorResponse(exchange, 404, "Order not found");
            }
            
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error getting order by ID", e);
            sendErrorResponse(exchange, 500, "Failed to get order");
        }
    }

    private void handleUpdateOrder(HttpExchange exchange, String orderId) throws IOException {
        try {
            LOGGER.info("=== UPDATE ORDER ===");
            LOGGER.info("orderId: " + orderId);
            
            String requestBody = getRequestBody(exchange);
            Map<String, Object> updateData = JsonUtil.fromJson(requestBody, Map.class);
            
            boolean success = updateOrder(orderId, updateData);
            if (success) {
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Order updated successfully");
                sendJsonResponse(exchange, 200, response);
            } else {
                sendErrorResponse(exchange, 404, "Order not found");
            }
            
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error updating order", e);
            sendErrorResponse(exchange, 500, "Failed to update order");
        }
    }

    private void handleDeleteOrder(HttpExchange exchange, String orderId) throws IOException {
        try {
            LOGGER.info("=== DELETE ORDER ===");
            LOGGER.info("orderId: " + orderId);
            
            boolean success = deleteOrder(orderId);
            if (success) {
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Order deleted successfully");
                sendJsonResponse(exchange, 200, response);
            } else {
                sendErrorResponse(exchange, 404, "Order not found");
            }
            
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error deleting order", e);
            sendErrorResponse(exchange, 500, "Failed to delete order");
        }
    }

    private String createOrder(String userId, String userEmail, List<Map<String, Object>> items, 
                              String branch, String paymentMethod, String deliveryAddress,
                              String offerId, Double taxAmount, Double deliveryCharges, 
                              Double discountAmount, Double finalAmount) {
        
        LOGGER.info("=== CREATING ORDER IN DATABASE ===");
        LOGGER.info("userId: " + userId);
        LOGGER.info("userEmail: " + userEmail);
        LOGGER.info("branch: " + branch);
        LOGGER.info("finalAmount: " + finalAmount);
        LOGGER.info("items count: " + items.size());
        
        String orderId = "ord_" + System.currentTimeMillis();
        
        try (Connection conn = DatabaseConfig.getConnection()) {
            conn.setAutoCommit(false);
            
            try {
                // Get customer information from users table
                String customerName = "Customer";
                String customerPhone = "N/A";
                
                try (PreparedStatement userStmt = conn.prepareStatement("SELECT username, phoneNumber FROM users WHERE userId = ?")) {
                    userStmt.setString(1, userId);
                    try (ResultSet rs = userStmt.executeQuery()) {
                        if (rs.next()) {
                            customerName = rs.getString("username");
                            customerPhone = rs.getString("phoneNumber");
                            if (customerName == null) customerName = "Customer";
                            if (customerPhone == null) customerPhone = "N/A";
                        } else {
                            LOGGER.warning("User not found in database: " + userId + ". Using default values.");
                        }
                    }
                } catch (SQLException e) {
                    LOGGER.warning("Error fetching user info: " + e.getMessage() + ". Using default values.");
                }
                
                LOGGER.info("Customer info - Name: " + customerName + ", Phone: " + customerPhone);
                
                // Insert order
                String orderSql = """
                    INSERT INTO orders (orderId, userId, branch, totalAmount, status, paymentMethod, 
                                      deliveryAddress, customerName, customerPhone, orderDate, updatedAt)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """;
                
                try (PreparedStatement orderStmt = conn.prepareStatement(orderSql)) {
                    orderStmt.setString(1, orderId);
                    orderStmt.setString(2, userId);
                    orderStmt.setString(3, branch);
                    orderStmt.setDouble(4, finalAmount);
                    orderStmt.setString(5, "Pending");
                    orderStmt.setString(6, paymentMethod);
                    orderStmt.setString(7, deliveryAddress);
                    orderStmt.setString(8, customerName);
                    orderStmt.setString(9, customerPhone);
                    orderStmt.setString(10, LocalDateTime.now().toString());
                    orderStmt.setString(11, LocalDateTime.now().toString());
                    
                    int orderAffected = orderStmt.executeUpdate();
                    LOGGER.info("Order inserted. Rows affected: " + orderAffected);
                    
                    if (orderAffected == 0) {
                        LOGGER.severe("Failed to insert order - no rows affected");
                        return null;
                    }
                } catch (SQLException e) {
                    LOGGER.severe("Error inserting order: " + e.getMessage());
                    return null;
                }
                
                // Insert order items
                String itemSql = """
                    INSERT INTO order_items (itemId, orderId, productId, productName, quantity, unitPrice, totalPrice)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """;
                
                try (PreparedStatement itemStmt = conn.prepareStatement(itemSql)) {
                    for (Map<String, Object> item : items) {
                        String itemId = "item_" + System.currentTimeMillis() + "_" + Math.random();
                        String productId = (String) item.get("productId");
                        String productName = (String) item.get("productName");
                        Object quantityObj = item.get("quantity");
                        Object priceObj = item.get("price");
                        
                        // Handle different data types for quantity
                        Integer quantity = null;
                        Double price = null;
                        
                        if (quantityObj instanceof Integer) {
                            quantity = (Integer) quantityObj;
                        } else if (quantityObj instanceof Long) {
                            quantity = ((Long) quantityObj).intValue();
                        } else if (quantityObj instanceof String) {
                            try {
                                quantity = Integer.parseInt((String) quantityObj);
                            } catch (NumberFormatException e) {
                                LOGGER.warning("Invalid quantity format: " + quantityObj);
                                continue;
                            }
                        } else if (quantityObj instanceof Number) {
                            quantity = ((Number) quantityObj).intValue();
                        }
                        
                        // Handle different data types for price
                        if (priceObj instanceof Double) {
                            price = (Double) priceObj;
                        } else if (priceObj instanceof Long) {
                            price = ((Long) priceObj).doubleValue();
                        } else if (priceObj instanceof Integer) {
                            price = ((Integer) priceObj).doubleValue();
                        } else if (priceObj instanceof String) {
                            try {
                                price = Double.parseDouble((String) priceObj);
                            } catch (NumberFormatException e) {
                                LOGGER.warning("Invalid price format: " + priceObj);
                                continue;
                            }
                        } else if (priceObj instanceof Number) {
                            price = ((Number) priceObj).doubleValue();
                        }
                        
                        LOGGER.info("Processing item - productId: " + productId + ", productName: " + productName + 
                                  ", quantity: " + quantity + " (type: " + (quantityObj != null ? quantityObj.getClass().getSimpleName() : "null") + 
                                  "), price: " + price + " (type: " + (priceObj != null ? priceObj.getClass().getSimpleName() : "null") + ")");
                        
                        if (productId != null && productName != null && quantity != null && price != null) {
                            itemStmt.setString(1, itemId);
                            itemStmt.setString(2, orderId);
                            itemStmt.setString(3, productId);
                            itemStmt.setString(4, productName);
                            itemStmt.setInt(5, quantity);
                            itemStmt.setDouble(6, price);
                            itemStmt.setDouble(7, price * quantity);
                            
                            int itemAffected = itemStmt.executeUpdate();
                            LOGGER.info("Order item inserted. Rows affected: " + itemAffected);
                            
                            if (itemAffected == 0) {
                                LOGGER.severe("Failed to insert order item - no rows affected");
                                return null;
                            }
                        } else {
                            LOGGER.warning("Skipping invalid item: " + item);
                        }
                    }
                } catch (SQLException e) {
                    LOGGER.severe("Error inserting order items: " + e.getMessage());
                    return null;
                }
                
                // Clear cart items for this user
                String clearCartSql = "DELETE FROM cart WHERE userId = ?";
                try (PreparedStatement clearCartStmt = conn.prepareStatement(clearCartSql)) {
                    clearCartStmt.setString(1, userId);
                    int cartAffected = clearCartStmt.executeUpdate();
                    LOGGER.info("Cart cleared. Rows affected: " + cartAffected);
                } catch (SQLException e) {
                    LOGGER.warning("Error clearing cart: " + e.getMessage());
                    // Don't fail the order for cart clearing issues
                }
                
                conn.commit();
                LOGGER.info("Order created successfully: " + orderId);
                return orderId;
                
            } catch (Exception e) {
                LOGGER.severe("Error during order creation, rolling back: " + e.getMessage());
                try {
                    conn.rollback();
                } catch (SQLException rollbackError) {
                    LOGGER.severe("Error rolling back transaction: " + rollbackError.getMessage());
                }
                return null;
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "SQL Error creating order", e);
            LOGGER.severe("SQL State: " + e.getSQLState());
            LOGGER.severe("Error Code: " + e.getErrorCode());
            LOGGER.severe("Error Message: " + e.getMessage());
            return null;
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Unexpected error creating order", e);
            return null;
        }
    }

    private void handleTestUserExists(HttpExchange exchange) throws IOException {
        try {
            LOGGER.info("=== TEST USER EXISTS ===");
            
            // Get query parameters
            String query = exchange.getRequestURI().getQuery();
            Map<String, String> params = parseQueryString(query);
            String userId = params.get("userId");
            
            if (userId == null) {
                // Check all users if no specific userId provided
                List<Map<String, Object>> allUsers = new ArrayList<>();
                
                try (Connection conn = DatabaseConfig.getConnection();
                     PreparedStatement stmt = conn.prepareStatement("SELECT userId, username, userEmail, phoneNumber, userType FROM users")) {
                    
                    try (ResultSet rs = stmt.executeQuery()) {
                        while (rs.next()) {
                            Map<String, Object> user = new HashMap<>();
                            user.put("userId", rs.getString("userId"));
                            user.put("username", rs.getString("username"));
                            user.put("userEmail", rs.getString("userEmail"));
                            user.put("phoneNumber", rs.getString("phoneNumber"));
                            user.put("userType", rs.getString("userType"));
                            allUsers.add(user);
                        }
                    }
                }
                
                Map<String, Object> response = new HashMap<>();
                response.put("message", "All users in database");
                response.put("userCount", allUsers.size());
                response.put("users", allUsers);
                sendJsonResponse(exchange, 200, response);
                
            } else {
                // Check specific user
                try (Connection conn = DatabaseConfig.getConnection();
                     PreparedStatement stmt = conn.prepareStatement("SELECT userId, username, userEmail, phoneNumber, userType FROM users WHERE userId = ?")) {
                    
                    stmt.setString(1, userId);
                    try (ResultSet rs = stmt.executeQuery()) {
                        if (rs.next()) {
                            Map<String, Object> user = new HashMap<>();
                            user.put("userId", rs.getString("userId"));
                            user.put("username", rs.getString("username"));
                            user.put("userEmail", rs.getString("userEmail"));
                            user.put("phoneNumber", rs.getString("phoneNumber"));
                            user.put("userType", rs.getString("userType"));
                            
                            Map<String, Object> response = new HashMap<>();
                            response.put("message", "User found");
                            response.put("user", user);
                            sendJsonResponse(exchange, 200, response);
                        } else {
                            Map<String, Object> response = new HashMap<>();
                            response.put("message", "User not found");
                            response.put("userId", userId);
                            sendJsonResponse(exchange, 404, response);
                        }
                    }
                }
            }
            
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error checking user existence", e);
            sendErrorResponse(exchange, 500, "Failed to check user: " + e.getMessage());
        }
    }

    private void handleTestDatabase(HttpExchange exchange) throws IOException {
        try {
            LOGGER.info("=== TEST DATABASE ===");
            
            Map<String, Object> response = new HashMap<>();
            List<Map<String, Object>> tables = new ArrayList<>();
            
            try (Connection conn = DatabaseConfig.getConnection()) {
                // Check if orders table exists
                try (Statement stmt = conn.createStatement()) {
                    try (ResultSet rs = stmt.executeQuery("SELECT name FROM sqlite_master WHERE type='table' AND name='orders'")) {
                        if (rs.next()) {
                            Map<String, Object> ordersTable = new HashMap<>();
                            ordersTable.put("tableName", "orders");
                            ordersTable.put("exists", true);
                            
                            // Check table structure
                            try (ResultSet tableInfo = stmt.executeQuery("PRAGMA table_info(orders)")) {
                                List<String> columns = new ArrayList<>();
                                while (tableInfo.next()) {
                                    columns.add(tableInfo.getString("name") + " (" + tableInfo.getString("type") + ")");
                                }
                                ordersTable.put("columns", columns);
                            }
                            
                            // Check sample data
                            try (ResultSet sampleData = stmt.executeQuery("SELECT COUNT(*) as count FROM orders")) {
                                if (sampleData.next()) {
                                    ordersTable.put("rowCount", sampleData.getInt("count"));
                                }
                            }
                            
                            tables.add(ordersTable);
                        } else {
                            Map<String, Object> ordersTable = new HashMap<>();
                            ordersTable.put("tableName", "orders");
                            ordersTable.put("exists", false);
                            tables.add(ordersTable);
                        }
                    }
                    
                    // Check order_items table
                    try (ResultSet rs = stmt.executeQuery("SELECT name FROM sqlite_master WHERE type='table' AND name='order_items'")) {
                        if (rs.next()) {
                            Map<String, Object> itemsTable = new HashMap<>();
                            itemsTable.put("tableName", "order_items");
                            itemsTable.put("exists", true);
                            
                            // Check table structure
                            try (ResultSet tableInfo = stmt.executeQuery("PRAGMA table_info(order_items)")) {
                                List<String> columns = new ArrayList<>();
                                while (tableInfo.next()) {
                                    columns.add(tableInfo.getString("name") + " (" + tableInfo.getString("type") + ")");
                                }
                                itemsTable.put("columns", columns);
                            }
                            
                            // Check sample data
                            try (ResultSet sampleData = stmt.executeQuery("SELECT COUNT(*) as count FROM order_items")) {
                                if (sampleData.next()) {
                                    itemsTable.put("rowCount", sampleData.getInt("count"));
                                }
                            }
                            
                            tables.add(itemsTable);
                        } else {
                            Map<String, Object> itemsTable = new HashMap<>();
                            itemsTable.put("tableName", "order_items");
                            itemsTable.put("exists", false);
                            tables.add(itemsTable);
                        }
                    }
                    
                    // Check users table
                    try (ResultSet rs = stmt.executeQuery("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")) {
                        if (rs.next()) {
                            Map<String, Object> usersTable = new HashMap<>();
                            usersTable.put("tableName", "users");
                            usersTable.put("exists", true);
                            
                            // Check table structure
                            try (ResultSet tableInfo = stmt.executeQuery("PRAGMA table_info(users)")) {
                                List<String> columns = new ArrayList<>();
                                while (tableInfo.next()) {
                                    columns.add(tableInfo.getString("name") + " (" + tableInfo.getString("type") + ")");
                                }
                                usersTable.put("columns", columns);
                            }
                            
                            // Check sample data
                            try (ResultSet sampleData = stmt.executeQuery("SELECT COUNT(*) as count FROM users")) {
                                if (sampleData.next()) {
                                    usersTable.put("rowCount", sampleData.getInt("count"));
                                }
                            }
                            
                            tables.add(usersTable);
                        } else {
                            Map<String, Object> usersTable = new HashMap<>();
                            usersTable.put("tableName", "users");
                            usersTable.put("exists", false);
                            tables.add(usersTable);
                        }
                    }
                }
                
                response.put("message", "Database check completed");
                response.put("tables", tables);
                sendJsonResponse(exchange, 200, response);
                
            } catch (SQLException e) {
                LOGGER.log(Level.SEVERE, "Error checking database", e);
                response.put("error", "Database check failed: " + e.getMessage());
                sendJsonResponse(exchange, 500, response);
            }
            
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error in test database endpoint", e);
            sendErrorResponse(exchange, 500, "Test failed: " + e.getMessage());
        }
    }

    private void handleTestCreateSampleOrder(HttpExchange exchange) throws IOException {
        try {
            LOGGER.info("=== TEST CREATE SAMPLE ORDER ===");
            
            // Create sample order data
            String userId = "cust001"; // Use existing user ID
            String userEmail = "customer@example.com";
            List<Map<String, Object>> items = new ArrayList<>();
            
            // Sample item 1
            Map<String, Object> item1 = new HashMap<>();
            item1.put("productId", "prod_001");
            item1.put("productName", "Sample Book 1");
            item1.put("quantity", 2);
            item1.put("price", 1500.0);
            items.add(item1);
            
            // Sample item 2
            Map<String, Object> item2 = new HashMap<>();
            item2.put("productId", "prod_002");
            item2.put("productName", "Sample Book 2");
            item2.put("quantity", 1);
            item2.put("price", 2000.0);
            items.add(item2);
            
            String branch = "Main Branch";
            String paymentMethod = "Online Payment";
            String deliveryAddress = "123 Test Street, Colombo";
            String offerId = null;
            Double taxAmount = 140.0;
            Double deliveryCharges = 175.0;
            Double discountAmount = 0.0;
            Double finalAmount = 5015.0; // 2*1500 + 1*2000 + 140 + 175
            
            LOGGER.info("Creating sample order with data:");
            LOGGER.info("userId: " + userId);
            LOGGER.info("items count: " + items.size());
            LOGGER.info("finalAmount: " + finalAmount);
            
            // Create the order
            String orderId = createOrder(userId, userEmail, items, branch, paymentMethod, deliveryAddress, 
                                       offerId, taxAmount, deliveryCharges, discountAmount, finalAmount);
            
            if (orderId != null) {
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Sample order created successfully");
                response.put("orderId", orderId);
                response.put("finalAmount", finalAmount);
                response.put("items", items);
                sendJsonResponse(exchange, 201, response);
            } else {
                sendErrorResponse(exchange, 500, "Failed to create sample order");
            }
            
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error creating sample order", e);
            sendErrorResponse(exchange, 500, "Failed to create sample order: " + e.getMessage());
        }
    }

    private List<Map<String, Object>> getAllOrders() {
        List<Map<String, Object>> orders = new ArrayList<>();
        String sql = "SELECT * FROM orders ORDER BY orderDate DESC";
        
        try (Connection conn = DatabaseConfig.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            
            while (rs.next()) {
                Map<String, Object> order = mapResultSetToOrder(rs);
                orders.add(order);
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error getting all orders", e);
        }
        return orders;
    }

    private List<Map<String, Object>> getOrdersByUserId(String userId) {
        List<Map<String, Object>> orders = new ArrayList<>();
        String sql = "SELECT * FROM orders WHERE userId = ? ORDER BY orderDate DESC";
        
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, userId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> order = mapResultSetToOrder(rs);
                    
                    // Get order items for each order
                    String orderId = order.get("orderId").toString();
                    List<Map<String, Object>> items = getOrderItems(orderId);
                    order.put("items", items);
                    
                    orders.add(order);
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error getting orders by userId", e);
        }
        return orders;
    }

    private Map<String, Object> getOrderById(String orderId) {
        String sql = "SELECT * FROM orders WHERE orderId = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, orderId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    Map<String, Object> order = mapResultSetToOrder(rs);
                    
                    // Get order items
                    List<Map<String, Object>> items = getOrderItems(orderId);
                    order.put("items", items);
                    
                    return order;
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error getting order by ID", e);
        }
        return null;
    }

    private List<Map<String, Object>> getOrderItems(String orderId) {
        List<Map<String, Object>> items = new ArrayList<>();
        String sql = "SELECT * FROM order_items WHERE orderId = ?";
        
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, orderId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> item = new HashMap<>();
                    item.put("itemId", rs.getString("itemId"));
                    item.put("productId", rs.getString("productId"));
                    item.put("productName", rs.getString("productName"));
                    item.put("quantity", rs.getInt("quantity"));
                    item.put("unitPrice", rs.getDouble("unitPrice"));
                    item.put("totalPrice", rs.getDouble("totalPrice"));
                    items.add(item);
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error getting order items", e);
        }
        return items;
    }

    private boolean updateOrder(String orderId, Map<String, Object> updateData) {
        StringBuilder sql = new StringBuilder("UPDATE orders SET ");
        List<Object> params = new ArrayList<>();
        
        if (updateData.containsKey("status")) {
            sql.append("status = ?, ");
            params.add(updateData.get("status"));
        }
        if (updateData.containsKey("paymentMethod")) {
            sql.append("paymentMethod = ?, ");
            params.add(updateData.get("paymentMethod"));
        }
        if (updateData.containsKey("deliveryAddress")) {
            sql.append("deliveryAddress = ?, ");
            params.add(updateData.get("deliveryAddress"));
        }
        
        if (params.size() > 0) {
            sql.setLength(sql.length() - 2); // Remove trailing comma
            sql.append(", updatedAt = ? WHERE orderId = ?");
            params.add(LocalDateTime.now().toString());
            params.add(orderId);
            
            try (Connection conn = DatabaseConfig.getConnection();
                 PreparedStatement stmt = conn.prepareStatement(sql.toString())) {
                
                for (int i = 0; i < params.size(); i++) {
                    stmt.setObject(i + 1, params.get(i));
                }
                
                int affected = stmt.executeUpdate();
                return affected > 0;
            } catch (SQLException e) {
                LOGGER.log(Level.SEVERE, "Error updating order", e);
            }
        }
        return false;
    }

    private boolean deleteOrder(String orderId) {
        try (Connection conn = DatabaseConfig.getConnection()) {
            conn.setAutoCommit(false);
            
            try {
                // Delete order items first
                String deleteItemsSql = "DELETE FROM order_items WHERE orderId = ?";
                try (PreparedStatement stmt = conn.prepareStatement(deleteItemsSql)) {
                    stmt.setString(1, orderId);
                    stmt.executeUpdate();
                }
                
                // Delete order
                String deleteOrderSql = "DELETE FROM orders WHERE orderId = ?";
                try (PreparedStatement stmt = conn.prepareStatement(deleteOrderSql)) {
                    stmt.setString(1, orderId);
                    int affected = stmt.executeUpdate();
                    
                    conn.commit();
                    return affected > 0;
                }
            } catch (Exception e) {
                conn.rollback();
                throw e;
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error deleting order", e);
        }
        return false;
    }

    private Map<String, Object> mapResultSetToOrder(ResultSet rs) throws SQLException {
        Map<String, Object> order = new HashMap<>();
        order.put("orderId", rs.getString("orderId"));
        order.put("userId", rs.getString("userId"));
        order.put("branch", rs.getString("branch"));
        order.put("totalAmount", rs.getDouble("totalAmount"));
        order.put("status", rs.getString("status"));
        order.put("paymentMethod", rs.getString("paymentMethod"));
        order.put("deliveryAddress", rs.getString("deliveryAddress"));
        order.put("customerName", rs.getString("customerName"));
        order.put("customerPhone", rs.getString("customerPhone"));
        order.put("orderDate", rs.getString("orderDate"));
        order.put("updatedAt", rs.getString("updatedAt"));
        return order;
    }

    private void handleSalesReport(HttpExchange exchange) throws IOException {
        try {
            String query = exchange.getRequestURI().getQuery();
            LOGGER.info("Generating sales report with query: " + query);
            
            // Parse query parameters
            Map<String, String> params = parseQueryString(query);
            String startDate = params.get("startDate");
            String endDate = params.get("endDate");
            
            if (startDate == null || endDate == null) {
                sendErrorResponse(exchange, 400, "Start date and end date are required");
                return;
            }
            
            LOGGER.info("Generating sales report from " + startDate + " to " + endDate);
            
            // Generate sales report data
            List<Map<String, Object>> salesData = generateSalesReportData(startDate, endDate);
            
            // For now, return JSON data instead of PDF
            // In a real application, you would generate a PDF here
            Map<String, Object> reportData = new HashMap<>();
            reportData.put("reportType", "Sales Report");
            reportData.put("startDate", startDate);
            reportData.put("endDate", endDate);
            reportData.put("generatedAt", LocalDateTime.now().toString());
            reportData.put("salesData", salesData);
            reportData.put("totalOrders", salesData.size());
            
            // Calculate total revenue
            double totalRevenue = salesData.stream()
                .mapToDouble(sale -> ((Number) sale.get("totalAmount")).doubleValue())
                .sum();
            reportData.put("totalRevenue", totalRevenue);
            
            sendJsonResponse(exchange, 200, reportData);
            
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error generating sales report", e);
            sendErrorResponse(exchange, 500, "Failed to generate sales report: " + e.getMessage());
        }
    }

    private void handleFinancialReport(HttpExchange exchange) throws IOException {
        try {
            String query = exchange.getRequestURI().getQuery();
            LOGGER.info("Generating financial report with query: " + query);
            
            // Parse query parameters
            Map<String, String> params = parseQueryString(query);
            String startDate = params.get("startDate");
            String endDate = params.get("endDate");
            
            if (startDate == null || endDate == null) {
                sendErrorResponse(exchange, 400, "Start date and end date are required");
                return;
            }
            
            LOGGER.info("Generating financial report from " + startDate + " to " + endDate);
            
            // Generate financial report data
            Map<String, Object> financialData = generateFinancialReportData(startDate, endDate);
            
            // For now, return JSON data instead of PDF
            // In a real application, you would generate a PDF here
            Map<String, Object> reportData = new HashMap<>();
            reportData.put("reportType", "Financial Report");
            reportData.put("startDate", startDate);
            reportData.put("endDate", endDate);
            reportData.put("generatedAt", LocalDateTime.now().toString());
            reportData.put("financialData", financialData);
            
            sendJsonResponse(exchange, 200, reportData);
            
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error generating financial report", e);
            sendErrorResponse(exchange, 500, "Failed to generate financial report: " + e.getMessage());
        }
    }

    private List<Map<String, Object>> generateSalesReportData(String startDate, String endDate) {
        List<Map<String, Object>> salesData = new ArrayList<>();
        
        try (Connection conn = DatabaseConfig.getConnection()) {
            String sql = "SELECT o.orderId, o.customerName, o.customerPhone, o.totalAmount, o.status, o.createdAt, " +
                        "oi.productName, oi.quantity, oi.price " +
                        "FROM orders o " +
                        "LEFT JOIN order_items oi ON o.orderId = oi.orderId " +
                        "WHERE o.createdAt >= ? AND o.createdAt <= ? " +
                        "ORDER BY o.createdAt DESC";
            
            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setString(1, startDate);
                stmt.setString(2, endDate);
                
                try (ResultSet rs = stmt.executeQuery()) {
                    while (rs.next()) {
                        Map<String, Object> sale = new HashMap<>();
                        sale.put("orderId", rs.getString("orderId"));
                        sale.put("customerName", rs.getString("customerName"));
                        sale.put("customerPhone", rs.getString("customerPhone"));
                        sale.put("totalAmount", rs.getDouble("totalAmount"));
                        sale.put("status", rs.getString("status"));
                        sale.put("createdAt", rs.getString("createdAt"));
                        sale.put("productName", rs.getString("productName"));
                        sale.put("quantity", rs.getInt("quantity"));
                        sale.put("price", rs.getDouble("price"));
                        salesData.add(sale);
                    }
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error generating sales report data", e);
        }
        
        return salesData;
    }

    private Map<String, Object> generateFinancialReportData(String startDate, String endDate) {
        Map<String, Object> financialData = new HashMap<>();
        
        try (Connection conn = DatabaseConfig.getConnection()) {
            // Get total revenue
            String revenueSql = "SELECT SUM(totalAmount) as totalRevenue FROM orders WHERE createdAt >= ? AND createdAt <= ?";
            try (PreparedStatement stmt = conn.prepareStatement(revenueSql)) {
                stmt.setString(1, startDate);
                stmt.setString(2, endDate);
                
                try (ResultSet rs = stmt.executeQuery()) {
                    if (rs.next()) {
                        financialData.put("totalRevenue", rs.getDouble("totalRevenue"));
                    }
                }
            }
            
            // Get order count
            String orderCountSql = "SELECT COUNT(*) as orderCount FROM orders WHERE createdAt >= ? AND createdAt <= ?";
            try (PreparedStatement stmt = conn.prepareStatement(orderCountSql)) {
                stmt.setString(1, startDate);
                stmt.setString(2, endDate);
                
                try (ResultSet rs = stmt.executeQuery()) {
                    if (rs.next()) {
                        financialData.put("orderCount", rs.getInt("orderCount"));
                    }
                }
            }
            
            // Get average order value
            String avgOrderSql = "SELECT AVG(totalAmount) as avgOrderValue FROM orders WHERE createdAt >= ? AND createdAt <= ?";
            try (PreparedStatement stmt = conn.prepareStatement(avgOrderSql)) {
                stmt.setString(1, startDate);
                stmt.setString(2, endDate);
                
                try (ResultSet rs = stmt.executeQuery()) {
                    if (rs.next()) {
                        financialData.put("avgOrderValue", rs.getDouble("avgOrderValue"));
                    }
                }
            }
            
            // Get top selling products
            String topProductsSql = "SELECT oi.productName, SUM(oi.quantity) as totalQuantity, SUM(oi.quantity * oi.price) as totalRevenue " +
                                   "FROM order_items oi " +
                                   "JOIN orders o ON oi.orderId = o.orderId " +
                                   "WHERE o.createdAt >= ? AND o.createdAt <= ? " +
                                   "GROUP BY oi.productName " +
                                   "ORDER BY totalQuantity DESC " +
                                   "LIMIT 5";
            try (PreparedStatement stmt = conn.prepareStatement(topProductsSql)) {
                stmt.setString(1, startDate);
                stmt.setString(2, endDate);
                
                List<Map<String, Object>> topProducts = new ArrayList<>();
                try (ResultSet rs = stmt.executeQuery()) {
                    while (rs.next()) {
                        Map<String, Object> product = new HashMap<>();
                        product.put("productName", rs.getString("productName"));
                        product.put("totalQuantity", rs.getInt("totalQuantity"));
                        product.put("totalRevenue", rs.getDouble("totalRevenue"));
                        topProducts.add(product);
                    }
                }
                financialData.put("topProducts", topProducts);
            }
            
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error generating financial report data", e);
        }
        
        return financialData;
    }

    private Map<String, String> parseQueryString(String query) {
        Map<String, String> params = new HashMap<>();
        if (query != null) {
            String[] pairs = query.split("&");
            for (String pair : pairs) {
                String[] keyValue = pair.split("=");
                if (keyValue.length == 2) {
                    params.put(keyValue[0], keyValue[1]);
                }
            }
        }
        return params;
    }

    private String getRequestBody(HttpExchange exchange) throws IOException {
        try (InputStream is = exchange.getRequestBody()) {
            return new String(is.readAllBytes(), StandardCharsets.UTF_8);
        }
    }

    private void sendJsonResponse(HttpExchange exchange, int statusCode, Object data) throws IOException {
        String response = JsonUtil.toJson(data);
        exchange.getResponseHeaders().add("Content-Type", "application/json");
        exchange.sendResponseHeaders(statusCode, response.getBytes(StandardCharsets.UTF_8).length);
        
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(response.getBytes(StandardCharsets.UTF_8));
        }
    }

    private void sendErrorResponse(HttpExchange exchange, int statusCode, String message) throws IOException {
        Map<String, Object> error = new HashMap<>();
        error.put("error", message);
        sendJsonResponse(exchange, statusCode, error);
    }

    private void setCorsHeaders(HttpExchange exchange) {
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }

    private Double convertToDouble(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Double) {
            return (Double) value;
        }
        if (value instanceof Long) {
            return ((Long) value).doubleValue();
        }
        if (value instanceof Integer) {
            return ((Integer) value).doubleValue();
        }
        if (value instanceof String) {
            try {
                return Double.parseDouble((String) value);
            } catch (NumberFormatException e) {
                LOGGER.warning("Invalid double format: " + value);
                return null;
            }
        }
        if (value instanceof Number) {
            return ((Number) value).doubleValue();
        }
        return null;
    }

    private Integer convertToInteger(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Integer) {
            return (Integer) value;
        }
        if (value instanceof Long) {
            return ((Long) value).intValue();
        }
        if (value instanceof String) {
            try {
                return Integer.parseInt((String) value);
            } catch (NumberFormatException e) {
                LOGGER.warning("Invalid integer format: " + value);
                return null;
            }
        }
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }
        return null;
    }
} 