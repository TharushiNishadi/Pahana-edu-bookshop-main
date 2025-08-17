package com.pahana.backend.handlers;

import com.pahana.backend.config.DatabaseConfig;
import com.pahana.backend.models.Category;
import com.pahana.backend.utils.JsonUtil;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.sql.*;
import java.time.LocalDateTime;
import java.util.*;
import java.util.logging.Logger;
import java.util.logging.Level;
import java.io.File;
import java.io.FileOutputStream;

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
            } else if ("/test-db".equals(path)) {
                if ("GET".equals(method)) {
                    handleTestDatabase(exchange);
                } else {
                    sendErrorResponse(exchange, 405, "Method not allowed");
                }
            } else if ("/test-category-db".equals(path)) {
                // Test endpoint to check categories table structure
                if ("GET".equals(method)) {
                    handleTestCategoryDatabase(exchange);
                } else {
                    sendErrorResponse(exchange, 405, "Method not allowed");
                }
            } else if ("/test-multipart".equals(path)) {
                // Test endpoint to debug multipart parsing
                if ("POST".equals(method)) {
                    handleTestMultipart(exchange);
                } else {
                    sendErrorResponse(exchange, 405, "Method not allowed");
                }
            } else if ("/test-create-category".equals(path)) {
                // Test endpoint to create category without multipart
                if ("POST".equals(method)) {
                    handleTestCreateCategory(exchange);
                } else {
                    sendErrorResponse(exchange, 405, "Method not allowed");
                }
            } else if ("/test-simple-category".equals(path)) {
                // Test endpoint to create a simple category with hardcoded values
                if ("GET".equals(method)) {
                    handleTestSimpleCategory(exchange);
                } else {
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
            // Check if it's multipart form data
            String contentType = exchange.getRequestHeaders().getFirst("Content-Type");
            if (contentType != null && contentType.startsWith("multipart/form-data")) {
                handleMultipartCategory(exchange);
            } else {
                // Handle JSON request (fallback)
                handleJsonCategory(exchange);
            }
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error creating category", e);
            sendErrorResponse(exchange, 500, "Failed to create category");
        }
    }

    private void handleMultipartCategory(HttpExchange exchange) throws IOException {
        try {
            String contentType = exchange.getRequestHeaders().getFirst("Content-Type");
            LOGGER.info("Content-Type: " + contentType);
            
            if (contentType == null) {
                LOGGER.severe("Content-Type header is missing");
                sendErrorResponse(exchange, 400, "Content-Type header is required");
                return;
            }
            
            String boundary = extractBoundary(contentType);
            LOGGER.info("Boundary: " + boundary);
            
            if (boundary == null) {
                LOGGER.severe("Could not extract boundary from Content-Type: " + contentType);
                sendErrorResponse(exchange, 400, "Invalid multipart boundary");
                return;
            }

            LOGGER.info("Starting multipart data parsing...");
            Map<String, String> formData = parseMultipartData(exchange.getRequestBody(), boundary);
            LOGGER.info("Parsed form data: " + formData);
            LOGGER.info("Form data keys: " + formData.keySet());
            
            String categoryName = formData.get("categoryName");
            String categoryDescription = formData.get("categoryDescription");
            String categoryImage = formData.get("categoryImage");

            LOGGER.info("Category Name: " + categoryName);
            LOGGER.info("Category Description: " + categoryDescription);
            LOGGER.info("Category Image: " + categoryImage);

            if (categoryName == null || categoryName.trim().isEmpty()) {
                LOGGER.warning("Category name is missing or empty");
                sendErrorResponse(exchange, 400, "Category name is required");
                return;
            }

            if (categoryDescription == null || categoryDescription.trim().isEmpty()) {
                LOGGER.warning("Category description is missing or empty");
                sendErrorResponse(exchange, 400, "Category description is required");
                return;
            }

            // For now, we'll store the image filename/path as a string
            // In a real application, you'd want to save the actual file and store the path
            String imagePath = categoryImage != null ? categoryImage : "";

            LOGGER.info("Creating category with - Name: " + categoryName + ", Description: " + categoryDescription + ", Image: " + imagePath);
            
            Category category = createCategory(categoryName, imagePath, categoryDescription, "Active", 0, null);
            if (category != null) {
                LOGGER.info("Category created successfully: " + category.getCategoryId());
                sendJsonResponse(exchange, 201, category);
            } else {
                LOGGER.severe("Failed to create category in database");
                sendErrorResponse(exchange, 500, "Failed to create category in database");
            }
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error handling multipart category", e);
            LOGGER.severe("Exception type: " + e.getClass().getName());
            LOGGER.severe("Exception message: " + e.getMessage());
            if (e.getCause() != null) {
                LOGGER.severe("Caused by: " + e.getCause().getMessage());
            }
            sendErrorResponse(exchange, 500, "Failed to create category: " + e.getMessage());
        }
    }

    private void handleJsonCategory(HttpExchange exchange) throws IOException {
        try {
            String requestBody = getRequestBody(exchange);
            Map<String, Object> categoryData = JsonUtil.fromJson(requestBody, Map.class);

            String categoryName = (String) categoryData.get("categoryName");
            String categoryImage = (String) categoryData.get("categoryImage");
            String categoryDescription = (String) categoryData.get("categoryDescription");

            if (categoryName == null) {
                sendErrorResponse(exchange, 400, "Category name is required");
                return;
            }

            Category category = createCategory(categoryName, categoryImage, categoryDescription, "Active", 0, null);
            if (category != null) {
                sendJsonResponse(exchange, 201, category);
            } else {
                sendErrorResponse(exchange, 500, "Failed to create category");
            }
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error creating category from JSON", e);
            sendErrorResponse(exchange, 500, "Failed to create category");
        }
    }

    private String extractBoundary(String contentType) {
        if (contentType == null) return null;
        String[] parts = contentType.split(";");
        for (String part : parts) {
            part = part.trim();
            if (part.startsWith("boundary=")) {
                return part.substring("boundary=".length());
            }
        }
        return null;
    }

    private Map<String, String> parseMultipartData(InputStream inputStream, String boundary) throws IOException {
        Map<String, String> formData = new HashMap<>();
        String boundaryLine = "--" + boundary;
        String endBoundary = "--" + boundary + "--";
        
        LOGGER.info("Parsing multipart data with boundary: " + boundary);
        
        // Read the entire input stream into a byte array for proper parsing
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        byte[] buffer = new byte[4096];
        int bytesRead;
        while ((bytesRead = inputStream.read(buffer)) != -1) {
            baos.write(buffer, 0, bytesRead);
        }
        byte[] data = baos.toByteArray();
        
        LOGGER.info("Read " + data.length + " bytes from input stream");
        
        // Convert to string for parsing
        String content = new String(data, StandardCharsets.UTF_8);
        LOGGER.info("Content length: " + content.length());
        LOGGER.info("Content preview: " + content.substring(0, Math.min(200, content.length())));
        
        String[] parts = content.split(boundaryLine);
        LOGGER.info("Split into " + parts.length + " parts");
        
        for (int partIndex = 0; partIndex < parts.length; partIndex++) {
            String part = parts[partIndex];
            if (part.trim().isEmpty() || part.contains(endBoundary)) {
                LOGGER.info("Skipping empty part or end boundary at index " + partIndex);
                continue;
            }
            
            LOGGER.info("Processing part " + partIndex + ": " + part.substring(0, Math.min(100, part.length())));
            
            // Parse each part
            String[] lines = part.split("\r?\n");
            String fieldName = null;
            String filename = null;
            boolean isFile = false;
            StringBuilder fieldValue = new StringBuilder();
            boolean inData = false;
            
            for (int i = 0; i < lines.length; i++) {
                String line = lines[i];
                
                if (line.startsWith("Content-Disposition:")) {
                    LOGGER.info("Processing Content-Disposition line: " + line);
                    
                    // Extract field name
                    if (line.contains("name=\"")) {
                        int start = line.indexOf("name=\"") + 6;
                        int end = line.indexOf("\"", start);
                        if (end > start) {
                            fieldName = line.substring(start, end);
                            LOGGER.info("Extracted field name: " + fieldName);
                        }
                    }
                    
                    // Check if it's a file
                    if (line.contains("filename=")) {
                        isFile = true;
                        int start = line.indexOf("filename=\"") + 10;
                        int end = line.indexOf("\"", start);
                        if (end > start) {
                            filename = line.substring(start, end);
                            LOGGER.info("Extracted filename: " + filename);
                        }
                    }
                } else if (line.startsWith("Content-Type:")) {
                    LOGGER.info("Skipping Content-Type line: " + line);
                    continue;
                } else if (line.trim().isEmpty()) {
                    LOGGER.info("Empty line found, starting data collection");
                    inData = true;
                    continue;
                } else if (inData) {
                    // This is the actual data
                    if (isFile && filename != null) {
                        LOGGER.info("Processing file data for: " + filename);
                        // For now, just store the filename to get basic functionality working
                        formData.put(fieldName, filename);
                        LOGGER.info("Stored filename: " + filename);
                    } else {
                        // For text fields, accumulate the value
                        if (fieldValue.length() > 0) {
                            fieldValue.append("\n");
                        }
                        fieldValue.append(line);
                        LOGGER.info("Accumulating text data: " + line);
                    }
                }
            }
            
            // Save non-file fields
            if (fieldName != null && !isFile && fieldValue.length() > 0) {
                String value = fieldValue.toString().trim();
                formData.put(fieldName, value);
                LOGGER.info("Stored text field - " + fieldName + ": " + value);
            }
        }
        
        LOGGER.info("Final form data: " + formData);
        return formData;
    }
    
    private String saveImageFile(String originalFilename, byte[] imageData) {
        try {
            // Create images directory if it doesn't exist
            File imagesDir = new File("images");
            if (!imagesDir.exists()) {
                imagesDir.mkdirs();
            }
            
            // Generate a unique filename to avoid conflicts
            String timestamp = String.valueOf(System.currentTimeMillis());
            String extension = "";
            if (originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String filename = "category_" + timestamp + extension;
            
            // Save the file
            File imageFile = new File(imagesDir, filename);
            try (FileOutputStream fos = new FileOutputStream(imageFile)) {
                fos.write(imageData);
            }
            
            LOGGER.info("Image saved: " + imageFile.getAbsolutePath() + " (size: " + imageData.length + " bytes)");
            return filename; // Return the filename to store in database
            
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error saving image file: " + originalFilename, e);
            return null;
        }
    }

    private void handleUpdateCategory(HttpExchange exchange, String categoryId) throws IOException {
        try {
            String contentType = exchange.getRequestHeaders().getFirst("Content-Type");
            LOGGER.info("Content-Type: " + contentType);
            
            Map<String, Object> categoryData = new HashMap<>();
            
            if (contentType != null && contentType.startsWith("multipart/form-data")) {
                // Handle multipart form data
                LOGGER.info("Processing multipart form data");
                String boundary = extractBoundary(contentType);
                if (boundary != null) {
                    Map<String, String> multipartData = parseMultipartData(exchange.getRequestBody(), boundary);
                    // Convert Map<String, String> to Map<String, Object>
                    categoryData = new HashMap<>();
                    for (Map.Entry<String, String> entry : multipartData.entrySet()) {
                        categoryData.put(entry.getKey(), entry.getValue());
                    }
                } else {
                    LOGGER.warning("No boundary found in multipart content type");
                    sendErrorResponse(exchange, 400, "Invalid multipart form data");
                    return;
                }
            } else {
                // Handle JSON data
                LOGGER.info("Processing JSON data");
                String requestBody = getRequestBody(exchange);
                LOGGER.info("Request body: " + requestBody);
                
                if (requestBody == null || requestBody.trim().isEmpty()) {
                    LOGGER.warning("Empty request body received");
                    sendErrorResponse(exchange, 400, "Request body is empty");
                    return;
                }
                
                categoryData = JsonUtil.fromJson(requestBody, Map.class);
            }
            
            LOGGER.info("Parsed category data: " + categoryData);
            
            if (categoryData == null || categoryData.isEmpty()) {
                LOGGER.warning("No valid category data received");
                sendErrorResponse(exchange, 400, "No valid category data provided");
                return;
            }

            // Check if category exists first
            Category existingCategory = getCategoryById(categoryId);
            if (existingCategory == null) {
                LOGGER.warning("Category not found with ID: " + categoryId);
                sendErrorResponse(exchange, 404, "Category not found");
                return;
            }
            LOGGER.info("Found existing category: " + existingCategory.getCategoryName());

            boolean updated = updateCategory(categoryId, categoryData);
            if (updated) {
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Category updated successfully");
                response.put("categoryId", categoryId);
                sendJsonResponse(exchange, 200, response);
            } else {
                LOGGER.warning("Category update failed - no changes made or database error");
                sendErrorResponse(exchange, 500, "Failed to update category. Please check the data and try again.");
            }
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error updating category", e);
            String errorMessage = "Failed to update category";
            if (e.getMessage() != null) {
                errorMessage += ": " + e.getMessage();
            }
            sendErrorResponse(exchange, 500, errorMessage);
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

    private Category createCategory(String categoryName, String categoryImage, String categoryDescription, String status, int displayOrder, String parentCategoryId) {
        String categoryId = "cat_" + System.currentTimeMillis();
        String sql = "INSERT INTO categories (categoryId, categoryName, categoryImage, categoryDescription, status, displayOrder, parentCategoryId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        LOGGER.info("Creating category with SQL: " + sql);
        LOGGER.info("Parameters: ID=" + categoryId + ", Name=" + categoryName + ", Image=" + categoryImage + ", Description=" + categoryDescription + ", Status=" + status + ", Order=" + displayOrder + ", Parent=" + parentCategoryId);
        
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, categoryId);
            stmt.setString(2, categoryName);
            stmt.setString(3, categoryImage);
            stmt.setString(4, categoryDescription);
            stmt.setString(5, status);
            stmt.setInt(6, displayOrder);
            stmt.setString(7, parentCategoryId);
            
            // Convert LocalDateTime to string for SQLite
            LocalDateTime now = LocalDateTime.now();
            stmt.setString(8, now.toString());
            stmt.setString(9, now.toString());
            
            LOGGER.info("Executing database insert...");
            int affected = stmt.executeUpdate();
            LOGGER.info("Rows affected: " + affected);
            
            if (affected > 0) {
                LOGGER.info("Category inserted successfully, creating Category object...");
                Category category = new Category();
                category.setCategoryId(categoryId);
                category.setCategoryName(categoryName);
                category.setCategoryImage(categoryImage);
                category.setCategoryDescription(categoryDescription);
                category.setStatus(status);
                category.setDisplayOrder(displayOrder);
                category.setParentCategoryId(parentCategoryId);
                category.setCreatedAt(now);
                category.setUpdatedAt(now);
                LOGGER.info("Category object created: " + category);
                return category;
            } else {
                LOGGER.warning("No rows were affected during insert");
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "SQL Error creating category", e);
            LOGGER.severe("SQL State: " + e.getSQLState());
            LOGGER.severe("Error Code: " + e.getErrorCode());
            LOGGER.severe("Error Message: " + e.getMessage());
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Unexpected error creating category", e);
        }
        LOGGER.severe("Failed to create category, returning null");
        return null;
    }

    private boolean updateCategory(String categoryId, Map<String, Object> categoryData) {
        StringBuilder sql = new StringBuilder("UPDATE categories SET ");
        List<Object> params = new ArrayList<>();
        
        LOGGER.info("Updating category with ID: " + categoryId);
        LOGGER.info("Update data: " + categoryData);
        
        if (categoryData.containsKey("categoryName")) {
            sql.append("categoryName = ?, ");
            params.add(categoryData.get("categoryName"));
            LOGGER.info("Adding categoryName to update");
        }
        if (categoryData.containsKey("categoryImage")) {
            sql.append("categoryImage = ?, ");
            params.add(categoryData.get("categoryImage"));
            LOGGER.info("Adding categoryImage to update");
        }
        if (categoryData.containsKey("categoryDescription")) {
            sql.append("categoryDescription = ?, ");
            params.add(categoryData.get("categoryDescription"));
            LOGGER.info("Adding categoryDescription to update");
        }
        if (categoryData.containsKey("status")) {
            sql.append("status = ?, ");
            params.add(categoryData.get("status"));
            LOGGER.info("Adding status to update");
        }
        if (categoryData.containsKey("displayOrder")) {
            sql.append("displayOrder = ?, ");
            params.add(categoryData.get("displayOrder"));
            LOGGER.info("Adding displayOrder to update");
        }
        if (categoryData.containsKey("parentCategoryId")) {
            sql.append("parentCategoryId = ?, ");
            params.add(categoryData.get("parentCategoryId"));
            LOGGER.info("Adding parentCategoryId to update");
        }
        
        // Check if there are any fields to update
        if (params.isEmpty()) {
            LOGGER.warning("No fields provided for update");
            return false;
        }
        
        // Remove trailing comma
        sql.setLength(sql.length() - 2); // Remove ", " from the end
        
        sql.append(", updatedAt = ? WHERE categoryId = ?");
        params.add(LocalDateTime.now().toString());
        params.add(categoryId);
        
        LOGGER.info("Final SQL: " + sql.toString());
        LOGGER.info("Parameters: " + params);
        
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql.toString())) {
            
            for (int i = 0; i < params.size(); i++) {
                stmt.setObject(i + 1, params.get(i));
            }
            
            int affected = stmt.executeUpdate();
            LOGGER.info("Rows affected: " + affected);
            
            if (affected > 0) {
                LOGGER.info("Category updated successfully");
                return true;
            } else {
                LOGGER.warning("No rows affected during update");
                return false;
            }
            
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error updating category", e);
            LOGGER.severe("SQL State: " + e.getSQLState());
            LOGGER.severe("Error Code: " + e.getErrorCode());
            LOGGER.severe("Error Message: " + e.getMessage());
            return false;
        }
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
        category.setCategoryDescription(rs.getString("categoryDescription"));
        category.setStatus(rs.getString("status"));
        category.setDisplayOrder(rs.getInt("displayOrder"));
        category.setParentCategoryId(rs.getString("parentCategoryId"));
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

    private void handleTestDatabase(HttpExchange exchange) throws IOException {
        try {
            Map<String, Object> result = new HashMap<>();
            
            // Test if new columns exist
            try (Connection conn = DatabaseConfig.getConnection();
                 Statement stmt = conn.createStatement()) {
                
                // Test categories table structure
                try {
                    stmt.execute("SELECT categoryDescription, status, displayOrder, parentCategoryId FROM categories LIMIT 1");
                    result.put("categories_table", "✅ All new columns exist");
                } catch (SQLException e) {
                    result.put("categories_table", "❌ Missing columns: " + e.getMessage());
                }
                
                // Test products table structure
                try {
                    stmt.execute("SELECT stockQuantity, status, discountPercentage FROM products LIMIT 1");
                    result.put("products_table", "✅ All new columns exist");
                } catch (SQLException e) {
                    result.put("products_table", "❌ Missing columns: " + e.getMessage());
                }
                
                // Get table info
                try (ResultSet rs = stmt.executeQuery("PRAGMA table_info(categories)")) {
                    List<String> columns = new ArrayList<>();
                    while (rs.next()) {
                        columns.add(rs.getString("name"));
                    }
                    result.put("categories_columns", columns);
                }
                
                try (ResultSet rs = stmt.executeQuery("PRAGMA table_info(products)")) {
                    List<String> columns = new ArrayList<>();
                    while (rs.next()) {
                        columns.add(rs.getString("name"));
                    }
                    result.put("products_columns", columns);
                }
                
            }
            
            sendJsonResponse(exchange, 200, result);
            
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error testing database", e);
            sendErrorResponse(exchange, 500, "Failed to test database: " + e.getMessage());
        }
    }

    private void handleTestCategoryDatabase(HttpExchange exchange) throws IOException {
        try {
            StringBuilder result = new StringBuilder();
            result.append("=== CATEGORIES TABLE STRUCTURE ===\n");
            
            try (Connection conn = DatabaseConfig.getConnection();
                 Statement stmt = conn.createStatement()) {
                
                // Check if table exists
                try {
                    ResultSet rs = stmt.executeQuery("PRAGMA table_info(categories)");
                    result.append("Categories table columns:\n");
                    while (rs.next()) {
                        String colName = rs.getString("name");
                        String colType = rs.getString("type");
                        String notNull = rs.getString("notnull");
                        String defaultValue = rs.getString("dflt_value");
                        String pk = rs.getString("pk");
                        
                        result.append("  - ").append(colName)
                              .append(" (").append(colType).append(")")
                              .append(notNull.equals("1") ? " NOT NULL" : "")
                              .append(defaultValue != null ? " DEFAULT " + defaultValue : "")
                              .append(pk.equals("1") ? " PRIMARY KEY" : "")
                              .append("\n");
                    }
                } catch (SQLException e) {
                    result.append("Error getting table info: ").append(e.getMessage()).append("\n");
                }
                
                // Check table count
                try {
                    ResultSet rs = stmt.executeQuery("SELECT COUNT(*) as count FROM categories");
                    if (rs.next()) {
                        result.append("Current categories count: ").append(rs.getInt("count")).append("\n");
                    }
                } catch (SQLException e) {
                    result.append("Error getting count: ").append(e.getMessage()).append("\n");
                }
                
                // Test a simple insert
                try {
                    String testSql = "INSERT INTO categories (categoryId, categoryName, categoryImage, categoryDescription, status, displayOrder, parentCategoryId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
                    try (PreparedStatement testStmt = conn.prepareStatement(testSql)) {
                        testStmt.setString(1, "test_" + System.currentTimeMillis());
                        testStmt.setString(2, "Test Category");
                        testStmt.setString(3, "test.jpg");
                        testStmt.setString(4, "Test Description");
                        testStmt.setString(5, "Active");
                        testStmt.setInt(6, 0);
                        testStmt.setString(7, null);
                        testStmt.setString(8, LocalDateTime.now().toString());
                        testStmt.setString(9, LocalDateTime.now().toString());
                        
                        int affected = testStmt.executeUpdate();
                        result.append("Test insert successful, rows affected: ").append(affected).append("\n");
                        
                        // Clean up test data
                        testStmt.execute("DELETE FROM categories WHERE categoryName = 'Test Category'");
                        result.append("Test data cleaned up\n");
                    }
                } catch (SQLException e) {
                    result.append("Test insert failed: ").append(e.getMessage()).append("\n");
                    result.append("SQL State: ").append(e.getSQLState()).append("\n");
                    result.append("Error Code: ").append(e.getErrorCode()).append("\n");
                }
                
            } catch (SQLException e) {
                result.append("Database connection error: ").append(e.getMessage()).append("\n");
            }
            
            sendJsonResponse(exchange, 200, result.toString());
            
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error testing category database", e);
            sendErrorResponse(exchange, 500, "Failed to test database: " + e.getMessage());
        }
    }

    private void handleTestMultipart(HttpExchange exchange) throws IOException {
        try {
            String contentType = exchange.getRequestHeaders().getFirst("Content-Type");
            LOGGER.info("Content-Type for test-multipart: " + contentType);

            String boundary = extractBoundary(contentType);
            LOGGER.info("Boundary for test-multipart: " + boundary);

            if (boundary == null) {
                sendErrorResponse(exchange, 400, "Invalid multipart boundary for test");
                return;
            }

            Map<String, String> formData = parseMultipartData(exchange.getRequestBody(), boundary);
            LOGGER.info("Parsed form data for test-multipart: " + formData);
            LOGGER.info("Form data keys for test-multipart: " + formData.keySet());

            sendJsonResponse(exchange, 200, formData);

        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error handling test-multipart", e);
            sendErrorResponse(exchange, 500, "Failed to parse multipart data for test: " + e.getMessage());
        }
    }

    private void handleTestCreateCategory(HttpExchange exchange) throws IOException {
        try {
            String requestBody = getRequestBody(exchange);
            Map<String, Object> categoryData = JsonUtil.fromJson(requestBody, Map.class);

            String categoryName = (String) categoryData.get("categoryName");
            String categoryImage = (String) categoryData.get("categoryImage");
            String categoryDescription = (String) categoryData.get("categoryDescription");

            if (categoryName == null || categoryName.trim().isEmpty()) {
                sendErrorResponse(exchange, 400, "Category name is required");
                return;
            }

            if (categoryDescription == null || categoryDescription.trim().isEmpty()) {
                sendErrorResponse(exchange, 400, "Category description is required");
                return;
            }

            Category category = createCategory(categoryName, categoryImage, categoryDescription, "Active", 0, null);
            if (category != null) {
                sendJsonResponse(exchange, 201, category);
            } else {
                sendErrorResponse(exchange, 500, "Failed to create category");
            }
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error handling test-create-category", e);
            sendErrorResponse(exchange, 500, "Failed to create category: " + e.getMessage());
        }
    }

    private void handleTestSimpleCategory(HttpExchange exchange) throws IOException {
        try {
            String categoryName = "Test Category " + System.currentTimeMillis();
            String categoryDescription = "This is a test category for the simple endpoint.";
            String categoryImage = "test.jpg"; // Placeholder for a simple image

            Category category = createCategory(categoryName, categoryImage, categoryDescription, "Active", 0, null);
            if (category != null) {
                sendJsonResponse(exchange, 201, category);
            } else {
                sendErrorResponse(exchange, 500, "Failed to create simple category");
            }
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error handling test-simple-category", e);
            sendErrorResponse(exchange, 500, "Failed to create simple category: " + e.getMessage());
        }
    }

    private void setCorsHeaders(HttpExchange exchange) {
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }
} 