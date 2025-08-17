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
import java.util.*;
import java.util.logging.Logger;
import java.util.logging.Level;
import java.time.LocalDateTime;

public class FavoritesHandler implements HttpHandler {
    private static final Logger LOGGER = Logger.getLogger(FavoritesHandler.class.getName());

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        try {
            String path = exchange.getRequestURI().getPath();
            String method = exchange.getRequestMethod();
            
            LOGGER.info("=== FAVORITES REQUEST ===");
            LOGGER.info("Method: " + method);
            LOGGER.info("Path: " + path);

            setCorsHeaders(exchange);

            if ("OPTIONS".equals(method)) {
                exchange.sendResponseHeaders(200, -1);
                return;
            }

            // Handle different favorites endpoints
            if (path.startsWith("/api/favorites/")) {
                String action = path.substring("/api/favorites/".length());
                
                switch (method) {
                    case "GET":
                        if ("list".equals(action)) {
                            handleGetUserFavorites(exchange);
                        } else {
                            sendErrorResponse(exchange, 404, "Endpoint not found");
                        }
                        break;
                    case "POST":
                        if ("add".equals(action)) {
                            handleAddFavorite(exchange);
                        } else if ("remove".equals(action)) {
                            handleRemoveFavorite(exchange);
                        } else {
                            sendErrorResponse(exchange, 404, "Endpoint not found");
                        }
                        break;
                    default:
                        sendErrorResponse(exchange, 405, "Method not allowed");
                }
            } else if ("/api/favorites".equals(path)) {
                switch (method) {
                    case "GET":
                        handleGetAllFavorites(exchange);
                        break;
                    default:
                        sendErrorResponse(exchange, 405, "Method not allowed");
                }
            } else if ("/test-favorites".equals(path)) {
                handleTestFavorites(exchange);
            } else {
                sendErrorResponse(exchange, 404, "Endpoint not found");
            }
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error handling favorites request", e);
            sendErrorResponse(exchange, 500, "Internal server error");
        }
    }

    private void handleGetUserFavorites(HttpExchange exchange) throws IOException {
        try {
            LOGGER.info("=== GET USER FAVORITES ===");
            
            String query = exchange.getRequestURI().getQuery();
            Map<String, String> params = parseQueryString(query);
            String userId = params.get("userId");
            
            LOGGER.info("userId: " + userId);
            
            if (userId == null) {
                sendErrorResponse(exchange, 400, "Missing userId parameter");
                return;
            }
            
            List<String> favoriteProductIds = getUserFavorites(userId);
            sendJsonResponse(exchange, 200, favoriteProductIds);
            
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error getting user favorites", e);
            sendErrorResponse(exchange, 500, "Failed to get favorites");
        }
    }

    private void handleAddFavorite(HttpExchange exchange) throws IOException {
        try {
            LOGGER.info("=== ADD FAVORITE ===");
            
            String query = exchange.getRequestURI().getQuery();
            Map<String, String> params = parseQueryString(query);
            String userId = params.get("userId");
            String productId = params.get("productId");
            
            LOGGER.info("userId: " + userId);
            LOGGER.info("productId: " + productId);
            
            if (userId == null || productId == null) {
                sendErrorResponse(exchange, 400, "Missing required parameters: userId, productId");
                return;
            }
            
            boolean success = addFavorite(userId, productId);
            
            if (success) {
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Product added to favorites successfully");
                response.put("userId", userId);
                response.put("productId", productId);
                sendJsonResponse(exchange, 200, response);
            } else {
                sendErrorResponse(exchange, 500, "Failed to add to favorites");
            }
            
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error adding favorite", e);
            sendErrorResponse(exchange, 500, "Failed to add favorite");
        }
    }

    private void handleRemoveFavorite(HttpExchange exchange) throws IOException {
        try {
            LOGGER.info("=== REMOVE FAVORITE ===");
            
            String query = exchange.getRequestURI().getQuery();
            Map<String, String> params = parseQueryString(query);
            String userId = params.get("userId");
            String productId = params.get("productId");
            
            LOGGER.info("userId: " + userId);
            LOGGER.info("productId: " + productId);
            
            if (userId == null || productId == null) {
                sendErrorResponse(exchange, 400, "Missing required parameters: userId, productId");
                return;
            }
            
            boolean success = removeFavorite(userId, productId);
            
            if (success) {
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Product removed from favorites successfully");
                response.put("userId", userId);
                response.put("productId", productId);
                sendJsonResponse(exchange, 200, response);
            } else {
                sendErrorResponse(exchange, 500, "Failed to remove from favorites");
            }
            
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error removing favorite", e);
            sendErrorResponse(exchange, 500, "Failed to remove favorite");
        }
    }

    private void handleGetAllFavorites(HttpExchange exchange) throws IOException {
        try {
            LOGGER.info("=== GET ALL FAVORITES ===");
            
            List<Map<String, Object>> allFavorites = getAllFavorites();
            sendJsonResponse(exchange, 200, allFavorites);
            
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error getting all favorites", e);
            sendErrorResponse(exchange, 500, "Failed to get favorites");
        }
    }

    private List<String> getUserFavorites(String userId) {
        List<String> favoriteProductIds = new ArrayList<>();
        String sql = "SELECT productId FROM favorites WHERE userId = ?";
        
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, userId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    favoriteProductIds.add(rs.getString("productId"));
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error getting user favorites", e);
        }
        return favoriteProductIds;
    }

    private boolean addFavorite(String userId, String productId) {
        LOGGER.info("=== ADDING FAVORITE ===");
        LOGGER.info("userId: " + userId);
        LOGGER.info("productId: " + productId);
        
        String sql = "INSERT OR IGNORE INTO favorites (favoriteId, userId, productId, createdAt) VALUES (?, ?, ?, datetime('now'))";
        
        try (Connection conn = DatabaseConfig.getConnection()) {
            LOGGER.info("Database connection established");
            
            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                String favoriteId = "fav_" + System.currentTimeMillis() + "_" + userId + "_" + productId;
                LOGGER.info("Generated favoriteId: " + favoriteId);
                
                stmt.setString(1, favoriteId);
                stmt.setString(2, userId);
                stmt.setString(3, productId);
                
                LOGGER.info("Executing SQL: " + sql);
                int affected = stmt.executeUpdate();
                LOGGER.info("Rows affected: " + affected);
                
                if (affected > 0) {
                    LOGGER.info("✅ Favorite added successfully");
                    return true;
                } else {
                    LOGGER.warning("⚠️ No rows affected - product might already be in favorites");
                    return true; // OR IGNORE means it's already there
                }
                
            } catch (SQLException e) {
                LOGGER.severe("❌ SQL Error in prepared statement: " + e.getMessage());
                LOGGER.severe("SQL State: " + e.getSQLState());
                LOGGER.severe("Error Code: " + e.getErrorCode());
                return false;
            }
        } catch (SQLException e) {
            LOGGER.severe("❌ Database connection error: " + e.getMessage());
            return false;
        }
    }

    private boolean removeFavorite(String userId, String productId) {
        String sql = "DELETE FROM favorites WHERE userId = ? AND productId = ?";
        
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, userId);
            stmt.setString(2, productId);
            
            int affected = stmt.executeUpdate();
            return affected > 0;
            
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error removing favorite", e);
            return false;
        }
    }

    private List<Map<String, Object>> getAllFavorites() {
        List<Map<String, Object>> allFavorites = new ArrayList<>();
        String sql = "SELECT f.*, u.username, p.productName FROM favorites f " +
                     "JOIN users u ON f.userId = u.userId " +
                     "JOIN products p ON f.productId = p.productId " +
                     "ORDER BY f.createdAt DESC";
        
        try (Connection conn = DatabaseConfig.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            
            while (rs.next()) {
                Map<String, Object> favorite = new HashMap<>();
                favorite.put("favoriteId", rs.getString("favoriteId"));
                favorite.put("userId", rs.getString("userId"));
                favorite.put("productId", rs.getString("productId"));
                favorite.put("username", rs.getString("username"));
                favorite.put("productName", rs.getString("productName"));
                favorite.put("createdAt", rs.getString("createdAt"));
                allFavorites.add(favorite);
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error getting all favorites", e);
        }
        return allFavorites;
    }

    private void handleTestFavorites(HttpExchange exchange) throws IOException {
        try {
            LOGGER.info("=== TEST FAVORITES ENDPOINT ===");
            
            Map<String, Object> testResponse = new HashMap<>();
            testResponse.put("message", "Favorites endpoint is working");
            testResponse.put("timestamp", LocalDateTime.now().toString());
            testResponse.put("availableEndpoints", Arrays.asList(
                "GET /api/favorites/list?userId={userId} - Get user favorites",
                "POST /api/favorites/add?userId={userId}&productId={productId} - Add to favorites",
                "POST /api/favorites/remove?userId={userId}&productId={productId} - Remove from favorites",
                "GET /api/favorites - Get all favorites"
            ));
            
            // Test database connection
            try (Connection conn = DatabaseConfig.getConnection()) {
                testResponse.put("database", "Connected successfully");
                
                // Check favorites table
                try (Statement stmt = conn.createStatement();
                     ResultSet rs = stmt.executeQuery("SELECT COUNT(*) as count FROM favorites")) {
                    if (rs.next()) {
                        testResponse.put("favoritesCount", rs.getInt("count"));
                    }
                }
            } catch (SQLException e) {
                testResponse.put("database", "Connection failed: " + e.getMessage());
            }
            
            sendJsonResponse(exchange, 200, testResponse);
            
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error in test favorites endpoint", e);
            sendErrorResponse(exchange, 500, "Test endpoint error");
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