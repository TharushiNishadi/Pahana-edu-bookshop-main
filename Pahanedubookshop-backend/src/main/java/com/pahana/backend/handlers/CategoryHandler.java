package com.pahana.backend.handlers;

import com.pahana.backend.config.DatabaseConfig;
import com.pahana.backend.models.Category;
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

public class CategoryHandler implements HttpHandler {
    private static final Logger LOGGER = Logger.getLogger(CategoryHandler.class.getName());

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        try {
            String path = exchange.getRequestURI().getPath();
            String method = exchange.getRequestMethod();

            setCorsHeaders(exchange);

            if ("OPTIONS".equals(method)) {
                exchange.sendResponseHeaders(200, -1);
                return;
            }

            if (path.startsWith("/category/")) {
                String categoryId = path.substring("/category/".length());
                switch (method) {
                    case "GET":
                        handleGetCategoryById(exchange, categoryId);
                        break;
                    case "PUT":
                        handleUpdateCategory(exchange, categoryId);
                        break;
                    case "DELETE":
                        handleDeleteCategory(exchange, categoryId);
                        break;
                    default:
                        sendErrorResponse(exchange, 405, "Method not allowed");
                }
            } else if ("/category".equals(path)) {
                switch (method) {
                    case "GET":
                        handleGetAllCategories(exchange);
                        break;
                    case "POST":
                        handleCreateCategory(exchange);
                        break;
                    default:
                        sendErrorResponse(exchange, 405, "Method not allowed");
                }
            } else {
                sendErrorResponse(exchange, 404, "Endpoint not found");
            }
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error handling category request", e);
            sendErrorResponse(exchange, 500, "Internal server error");
        }
    }

    private void handleGetAllCategories(HttpExchange exchange) throws IOException {
        try {
            List<Category> categories = getAllCategories();
            sendJsonResponse(exchange, 200, categories);
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error getting all categories", e);
            sendErrorResponse(exchange, 500, "Failed to get categories");
        }
    }

    private void handleGetCategoryById(HttpExchange exchange, String categoryId) throws IOException {
        try {
            Category category = getCategoryById(categoryId);
            if (category != null) {
                sendJsonResponse(exchange, 200, category);
            } else {
                sendErrorResponse(exchange, 404, "Category not found");
            }
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error getting category by ID", e);
            sendErrorResponse(exchange, 500, "Failed to get category");
        }
    }

    private void handleCreateCategory(HttpExchange exchange) throws IOException {
        try {
            String requestBody = getRequestBody(exchange);
            Map<String, Object> categoryData = JsonUtil.fromJson(requestBody, Map.class);

            String categoryName = (String) categoryData.get("categoryName");
            String categoryImage = (String) categoryData.get("categoryImage");

            if (categoryName == null) {
                sendErrorResponse(exchange, 400, "Category name is required");
                return;
            }

            Category category = createCategory(categoryName, categoryImage);
            if (category != null) {
                sendJsonResponse(exchange, 201, category);
            } else {
                sendErrorResponse(exchange, 500, "Failed to create category");
            }
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error creating category", e);
            sendErrorResponse(exchange, 500, "Failed to create category");
        }
    }

    private void handleUpdateCategory(HttpExchange exchange, String categoryId) throws IOException {
        try {
            String requestBody = getRequestBody(exchange);
            Map<String, Object> categoryData = JsonUtil.fromJson(requestBody, Map.class);

            boolean updated = updateCategory(categoryId, categoryData);
            if (updated) {
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Category updated successfully");
                sendJsonResponse(exchange, 200, response);
            } else {
                sendErrorResponse(exchange, 404, "Category not found");
            }
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error updating category", e);
            sendErrorResponse(exchange, 500, "Failed to update category");
        }
    }

    private void handleDeleteCategory(HttpExchange exchange, String categoryId) throws IOException {
        try {
            boolean deleted = deleteCategory(categoryId);
            if (deleted) {
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Category deleted successfully");
                sendJsonResponse(exchange, 200, response);
            } else {
                sendErrorResponse(exchange, 404, "Category not found");
            }
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error deleting category", e);
            sendErrorResponse(exchange, 500, "Failed to delete category");
        }
    }

    private List<Category> getAllCategories() {
        List<Category> categories = new ArrayList<>();
        String sql = "SELECT * FROM categories ORDER BY createdAt DESC";
        
        try (Connection conn = DatabaseConfig.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            
            while (rs.next()) {
                Category category = mapResultSetToCategory(rs);
                categories.add(category);
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error getting all categories", e);
        }
        return categories;
    }

    private Category getCategoryById(String categoryId) {
        String sql = "SELECT * FROM categories WHERE categoryId = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, categoryId);
            
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return mapResultSetToCategory(rs);
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error getting category by ID", e);
        }
        return null;
    }

    private Category createCategory(String categoryName, String categoryImage) {
        String categoryId = "cat_" + System.currentTimeMillis();
        String sql = "INSERT INTO categories (categoryId, categoryName, categoryImage, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)";
        
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, categoryId);
            stmt.setString(2, categoryName);
            stmt.setString(3, categoryImage);
            stmt.setString(4, LocalDateTime.now().toString());
            stmt.setString(5, LocalDateTime.now().toString());
            
            int affected = stmt.executeUpdate();
            if (affected > 0) {
                Category category = new Category();
                category.setCategoryId(categoryId);
                category.setCategoryName(categoryName);
                category.setCategoryImage(categoryImage);
                return category;
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error creating category", e);
        }
        return null;
    }

    private boolean updateCategory(String categoryId, Map<String, Object> categoryData) {
        StringBuilder sql = new StringBuilder("UPDATE categories SET ");
        List<Object> params = new ArrayList<>();
        
        if (categoryData.containsKey("categoryName")) {
            sql.append("categoryName = ?, ");
            params.add(categoryData.get("categoryName"));
        }
        if (categoryData.containsKey("categoryImage")) {
            sql.append("categoryImage = ?, ");
            params.add(categoryData.get("categoryImage"));
        }
        
        sql.append("updatedAt = ? WHERE categoryId = ?");
        params.add(LocalDateTime.now().toString());
        params.add(categoryId);
        
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql.toString())) {
            
            for (int i = 0; i < params.size(); i++) {
                stmt.setObject(i + 1, params.get(i));
            }
            
            int affected = stmt.executeUpdate();
            return affected > 0;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error updating category", e);
        }
        return false;
    }

    private boolean deleteCategory(String categoryId) {
        String sql = "DELETE FROM categories WHERE categoryId = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, categoryId);
            
            int affected = stmt.executeUpdate();
            return affected > 0;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error deleting category", e);
        }
        return false;
    }

    private Category mapResultSetToCategory(ResultSet rs) throws SQLException {
        Category category = new Category();
        category.setCategoryId(rs.getString("categoryId"));
        category.setCategoryName(rs.getString("categoryName"));
        category.setCategoryImage(rs.getString("categoryImage"));
        return category;
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
} 