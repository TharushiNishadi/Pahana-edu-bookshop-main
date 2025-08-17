package com.pahana.backend.handlers;

import com.pahana.backend.config.DatabaseConfig;
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

public class CartHandler implements HttpHandler {
    private static final Logger LOGGER = Logger.getLogger(CartHandler.class.getName());

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        try {
            String path = exchange.getRequestURI().getPath();
            String method = exchange.getRequestMethod();
            
            LOGGER.info("=== CART REQUEST ===");
            LOGGER.info("Method: " + method);
            LOGGER.info("Path: " + path);

            setCorsHeaders(exchange);

            if ("OPTIONS".equals(method)) {
                exchange.sendResponseHeaders(200, -1);
                return;
            }

            // Handle different cart endpoints
            if (path.startsWith("/api/cart/")) {
                String endpoint = path.substring("/api/cart/".length());
                
                switch (endpoint) {
                    case "add":
                        if ("POST".equals(method)) {
                            handleAddToCart(exchange);
                        } else {
                            sendErrorResponse(exchange, 405, "Method not allowed");
                        }
                        break;
                    case "remove":
                        if ("DELETE".equals(method)) {
                            handleRemoveFromCart(exchange);
                        } else {
                            sendErrorResponse(exchange, 405, "Method not allowed");
                        }
                        break;
                    case "details":
                        if ("GET".equals(method)) {
                            handleGetCartDetails(exchange);
                        } else {
                            sendErrorResponse(exchange, 405, "Method not allowed");
                        }
                        break;
                    case "detailsInfo":
                        if ("GET".equals(method)) {
                            handleGetCartDetailsInfo(exchange);
                        } else {
                            sendErrorResponse(exchange, 405, "Method not allowed");
                        }
                        break;
                    case "test":
            if ("GET".equals(method)) {
                            handleTestCart(exchange);
            } else {
                sendErrorResponse(exchange, 405, "Method not allowed");
                        }
                        break;
                    default:
                        sendErrorResponse(exchange, 404, "Endpoint not found");
                }
            } else {
                sendErrorResponse(exchange, 404, "Endpoint not found");
            }
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error handling cart request", e);
            sendErrorResponse(exchange, 500, "Internal server error");
        }
    }

    private void handleAddToCart(HttpExchange exchange) throws IOException {
        try {
            LOGGER.info("=== ADD TO CART ===");
            
            // Get query parameters
            String query = exchange.getRequestURI().getQuery();
            Map<String, String> params = parseQueryString(query);
            
            String userId = params.get("userId");
            String productId = params.get("productId");
            String quantityStr = params.get("quantity");
            
            LOGGER.info("userId: " + userId);
            LOGGER.info("productId: " + productId);
            LOGGER.info("quantity: " + quantityStr);
            
            if (userId == null || productId == null || quantityStr == null) {
                sendErrorResponse(exchange, 400, "Missing required parameters: userId, productId, quantity");
                return;
            }
            
            int quantity;
            try {
                quantity = Integer.parseInt(quantityStr);
                if (quantity <= 0) {
                    sendErrorResponse(exchange, 400, "Quantity must be greater than 0");
                    return;
                }
            } catch (NumberFormatException e) {
                sendErrorResponse(exchange, 400, "Invalid quantity format");
                return;
            }
            
            // Check if product exists
            if (!productExists(productId)) {
                sendErrorResponse(exchange, 404, "Product not found");
                return;
            }
            
            // Add or update cart item
            boolean success = addOrUpdateCartItem(userId, productId, quantity);
            
            if (success) {
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Product added to cart successfully");
                response.put("userId", userId);
                response.put("productId", productId);
                response.put("quantity", quantity);
                sendJsonResponse(exchange, 200, response);
            } else {
                sendErrorResponse(exchange, 500, "Failed to add product to cart");
            }
            
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error adding to cart", e);
            sendErrorResponse(exchange, 500, "Failed to add to cart");
        }
    }

    private void handleRemoveFromCart(HttpExchange exchange) throws IOException {
        try {
            LOGGER.info("=== REMOVE FROM CART ===");
            LOGGER.info("Request method: " + exchange.getRequestMethod());
            LOGGER.info("Request URI: " + exchange.getRequestURI());
            
            // Get query parameters
            String query = exchange.getRequestURI().getQuery();
            LOGGER.info("Query string: " + query);
            Map<String, String> params = parseQueryString(query);
            LOGGER.info("Parsed params: " + params);
            
            String userId = params.get("userId");
            String productId = params.get("productId");
            String quantityStr = params.get("quantity");
            
            LOGGER.info("userId: " + userId);
            LOGGER.info("productId: " + productId);
            LOGGER.info("quantity: " + quantityStr);
            
            if (userId == null || productId == null) {
                LOGGER.warning("Missing required parameters: userId=" + userId + ", productId=" + productId);
                sendErrorResponse(exchange, 400, "Missing required parameters: userId, productId");
                return;
            }
            
            LOGGER.info("Attempting to remove cart item for userId: " + userId + ", productId: " + productId);
            boolean success = removeFromCart(userId, productId);
            LOGGER.info("Remove operation result: " + success);
            
            if (success) {
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Product removed from cart successfully");
                response.put("userId", userId);
                response.put("productId", productId);
                LOGGER.info("Sending success response");
                sendJsonResponse(exchange, 200, response);
            } else {
                LOGGER.warning("Cart item not found for removal");
                sendErrorResponse(exchange, 404, "Cart item not found");
            }
            
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error removing from cart", e);
            sendErrorResponse(exchange, 500, "Failed to remove from cart");
        }
    }

    private void handleGetCartDetails(HttpExchange exchange) throws IOException {
        try {
            LOGGER.info("=== GET CART DETAILS ===");
            
            // Get query parameters
            String query = exchange.getRequestURI().getQuery();
            Map<String, String> params = parseQueryString(query);
            
            String userId = params.get("userId");
            
            LOGGER.info("userId: " + userId);
            
            if (userId == null) {
                sendErrorResponse(exchange, 400, "Missing required parameter: userId");
                return;
            }
            
            Map<String, Object> cartDetails = getCartDetails(userId);
            sendJsonResponse(exchange, 200, cartDetails);
            
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error getting cart details", e);
            sendErrorResponse(exchange, 500, "Failed to get cart details");
        }
    }

    private void handleGetCartDetailsInfo(HttpExchange exchange) throws IOException {
        try {
            LOGGER.info("=== GET CART DETAILS INFO ===");
            
            // Get query parameters
            String query = exchange.getRequestURI().getQuery();
            Map<String, String> params = parseQueryString(query);
            
            String userId = params.get("userId");
            
            LOGGER.info("userId: " + userId);
            
            if (userId == null) {
                sendErrorResponse(exchange, 400, "Missing required parameter: userId");
                return;
            }
            
            Map<String, Object> cartDetailsInfo = getCartDetailsInfo(userId);
            sendJsonResponse(exchange, 200, cartDetailsInfo);
            
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error getting cart details info", e);
            sendErrorResponse(exchange, 500, "Failed to get cart details info");
        }
    }

    private boolean productExists(String productId) {
        String sql = "SELECT COUNT(*) FROM products WHERE productId = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, productId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1) > 0;
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error checking if product exists", e);
        }
        return false;
    }

    private boolean addOrUpdateCartItem(String userId, String productId, int quantity) {
        // First check if item already exists in cart
        String checkSql = "SELECT quantity FROM cart WHERE userId = ? AND productId = ?";
        String insertSql = "INSERT INTO cart (cartId, userId, productId, quantity, createdAt) VALUES (?, ?, ?, ?, ?)";
        String updateSql = "UPDATE cart SET quantity = ?, createdAt = ? WHERE userId = ? AND productId = ?";
        
        try (Connection conn = DatabaseConfig.getConnection()) {
            
            // Check if item exists
            try (PreparedStatement checkStmt = conn.prepareStatement(checkSql)) {
                checkStmt.setString(1, userId);
                checkStmt.setString(2, productId);
                
                try (ResultSet rs = checkStmt.executeQuery()) {
                    if (rs.next()) {
                        // Item exists, update quantity
                        int currentQuantity = rs.getInt("quantity");
                        int newQuantity = currentQuantity + quantity;
                        
                        try (PreparedStatement updateStmt = conn.prepareStatement(updateSql)) {
                            updateStmt.setInt(1, newQuantity);
                            updateStmt.setString(2, LocalDateTime.now().toString());
                            updateStmt.setString(3, userId);
                            updateStmt.setString(4, productId);
                            
                            int affected = updateStmt.executeUpdate();
                            LOGGER.info("Updated cart item. Rows affected: " + affected);
                            return affected > 0;
                        }
                    } else {
                        // Item doesn't exist, insert new
                        String cartId = "cart_" + System.currentTimeMillis();
                        
                        try (PreparedStatement insertStmt = conn.prepareStatement(insertSql)) {
                            insertStmt.setString(1, cartId);
                            insertStmt.setString(2, userId);
                            insertStmt.setString(3, productId);
                            insertStmt.setInt(4, quantity);
                            insertStmt.setString(5, LocalDateTime.now().toString());
                            
                            int affected = insertStmt.executeUpdate();
                            LOGGER.info("Inserted new cart item. Rows affected: " + affected);
                            return affected > 0;
                        }
                    }
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error adding/updating cart item", e);
        }
        return false;
    }

    private boolean removeFromCart(String userId, String productId) {
        LOGGER.info("=== EXECUTING REMOVE FROM CART ===");
        LOGGER.info("userId: " + userId);
        LOGGER.info("productId: " + productId);
        
        String sql = "DELETE FROM cart WHERE userId = ? AND productId = ?";
        LOGGER.info("SQL: " + sql);
        
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, userId);
            stmt.setString(2, productId);
            
            LOGGER.info("Executing DELETE with parameters: [" + userId + ", " + productId + "]");
            int affected = stmt.executeUpdate();
            LOGGER.info("DELETE executed. Rows affected: " + affected);
            
            if (affected > 0) {
                LOGGER.info("Successfully removed cart item");
            } else {
                LOGGER.warning("No rows were affected - item might not exist");
            }
            
            return affected > 0;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error removing from cart", e);
            LOGGER.severe("SQL State: " + e.getSQLState());
            LOGGER.severe("Error Code: " + e.getErrorCode());
            LOGGER.severe("Error Message: " + e.getMessage());
        }
        return false;
    }

    private Map<String, Object> getCartDetails(String userId) {
        Map<String, Object> cartDetails = new HashMap<>();
        Map<String, Integer> productQuantities = new HashMap<>();
        
        String sql = "SELECT productId, quantity FROM cart WHERE userId = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, userId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    String productId = rs.getString("productId");
                    int quantity = rs.getInt("quantity");
                    productQuantities.put(productId, quantity);
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error getting cart details", e);
        }
        
        cartDetails.put("productId", productQuantities);
        return cartDetails;
    }

    private Map<String, Object> getCartDetailsInfo(String userId) {
        Map<String, Object> cartDetailsInfo = new HashMap<>();
        List<Map<String, Object>> products = new ArrayList<>();
        double totalAmount = 0.0;
        
        String sql = """
            SELECT c.productId, c.quantity, p.productName, p.productPrice, p.productImage, p.productDescription
            FROM cart c
            JOIN products p ON c.productId = p.productId
            WHERE c.userId = ?
        """;
        
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, userId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> product = new HashMap<>();
                    product.put("productId", rs.getString("productId"));
                    product.put("quantity", rs.getInt("quantity"));
                    product.put("productName", rs.getString("productName"));
                    product.put("productPrice", rs.getDouble("productPrice"));
                    product.put("productImage", rs.getString("productImage"));
                    product.put("productDescription", rs.getString("productDescription"));
                    
                    double price = rs.getDouble("productPrice");
                    int quantity = rs.getInt("quantity");
                    totalAmount += price * quantity;
                    
                    products.add(product);
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error getting cart details info", e);
        }
        
        cartDetailsInfo.put("products", products);
        cartDetailsInfo.put("totalAmount", totalAmount);
        return cartDetailsInfo;
    }

    private void handleTestCart(HttpExchange exchange) throws IOException {
        try {
            Map<String, Object> result = new HashMap<>();
            
            // Test database connection and cart table
            try (Connection conn = DatabaseConfig.getConnection();
                 Statement stmt = conn.createStatement()) {
                
                // Test cart table structure
                try (ResultSet rs = stmt.executeQuery("PRAGMA table_info(cart)")) {
                    List<String> columns = new ArrayList<>();
                    while (rs.next()) {
                        columns.add(rs.getString("name"));
                    }
                    result.put("cart_columns", columns);
                }
                
                // Test if cart table has any data
                try (ResultSet rs = stmt.executeQuery("SELECT COUNT(*) as count FROM cart")) {
                    if (rs.next()) {
                        result.put("cart_items_count", rs.getInt("count"));
                    }
                }
                
                result.put("status", "Cart system is working!");
                result.put("timestamp", LocalDateTime.now().toString());
                
            }
            
            sendJsonResponse(exchange, 200, result);
            
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error testing cart", e);
            sendErrorResponse(exchange, 500, "Failed to test cart: " + e.getMessage());
        }
    }

    private Map<String, String> parseQueryString(String query) {
        Map<String, String> params = new HashMap<>();
        if (query != null && !query.isEmpty()) {
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
} 