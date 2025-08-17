package com.pahana.backend.handlers;

import com.pahana.backend.config.DatabaseConfig;
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
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;

public class GalleryHandler implements HttpHandler {
    private static final Logger LOGGER = Logger.getLogger(GalleryHandler.class.getName());

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

            if (path.startsWith("/gallery/")) {
                String pictureId = path.substring("/gallery/".length());
                switch (method) {
                    case "GET":
                        handleGetImageById(exchange, pictureId);
                        break;
                    case "PUT":
                        handleUpdateImage(exchange, pictureId);
                        break;
                    case "DELETE":
                        handleDeleteImage(exchange, pictureId);
                        break;
                    default:
                        sendErrorResponse(exchange, 405, "Method not allowed");
                }
            } else if ("/gallery".equals(path)) {
                switch (method) {
                    case "GET":
                        handleGetAllImages(exchange);
                        break;
                    case "POST":
                        handleCreateImage(exchange);
                        break;
                    default:
                sendErrorResponse(exchange, 405, "Method not allowed");
                }
            } else if ("/test-gallery-db".equals(path)) {
                // Test endpoint to check gallery database
                if ("GET".equals(method)) {
                    handleTestGalleryDatabase(exchange);
                } else {
                    sendErrorResponse(exchange, 405, "Method not allowed");
                }
            } else if ("/test-gallery-update".equals(path)) {
                // Test endpoint to test gallery update functionality
            if ("GET".equals(method)) {
                    handleTestGalleryUpdate(exchange);
            } else {
                sendErrorResponse(exchange, 405, "Method not allowed");
                }
            } else {
                sendErrorResponse(exchange, 404, "Endpoint not found");
            }
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error handling gallery request", e);
            sendErrorResponse(exchange, 500, "Internal server error");
        }
    }

    private void handleGetAllImages(HttpExchange exchange) throws IOException {
        try {
            List<Map<String, Object>> images = getAllImages();
            sendJsonResponse(exchange, 200, images);
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error getting all images", e);
            sendErrorResponse(exchange, 500, "Failed to get images");
        }
    }

    private void handleGetImageById(HttpExchange exchange, String pictureId) throws IOException {
        try {
            Map<String, Object> image = getImageById(pictureId);
            if (image != null) {
                sendJsonResponse(exchange, 200, image);
            } else {
                sendErrorResponse(exchange, 404, "Image not found");
            }
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error getting image by ID", e);
            sendErrorResponse(exchange, 500, "Failed to get image");
        }
    }

    private void handleCreateImage(HttpExchange exchange) throws IOException {
        try {
            // Check if it's multipart form data
            String contentType = exchange.getRequestHeaders().getFirst("Content-Type");
            if (contentType != null && contentType.startsWith("multipart/form-data")) {
                handleMultipartImage(exchange);
            } else {
                // Handle JSON request (fallback)
                handleJsonImage(exchange);
            }
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error creating image", e);
            sendErrorResponse(exchange, 500, "Failed to create image");
        }
    }

    private void handleMultipartImage(HttpExchange exchange) throws IOException {
        try {
            String contentType = exchange.getRequestHeaders().getFirst("Content-Type");
            String boundary = extractBoundary(contentType);
            
            if (boundary == null) {
                sendErrorResponse(exchange, 400, "Invalid multipart boundary");
                return;
            }

            Map<String, String> formData = parseMultipartData(exchange.getRequestBody(), boundary);
            
            String pictureType = formData.get("pictureType");
            String picturePath = formData.get("picturePath");

            if (pictureType == null || pictureType.trim().isEmpty()) {
                sendErrorResponse(exchange, 400, "Picture type is required");
                return;
            }

            if (picturePath == null || picturePath.trim().isEmpty()) {
                sendErrorResponse(exchange, 400, "Picture file is required");
                return;
            }

            // For now, we'll store the image filename/path as a string
            String imagePath = picturePath != null ? picturePath : "";

            Map<String, Object> image = createImage(pictureType, imagePath);
            if (image != null) {
                sendJsonResponse(exchange, 201, image);
            } else {
                sendErrorResponse(exchange, 500, "Failed to create image");
            }
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error handling multipart image", e);
            sendErrorResponse(exchange, 500, "Failed to create image");
        }
    }

    private void handleJsonImage(HttpExchange exchange) throws IOException {
        try {
            String requestBody = getRequestBody(exchange);
            Map<String, Object> imageData = JsonUtil.fromJson(requestBody, Map.class);

            String pictureType = (String) imageData.get("pictureType");
            String picturePath = (String) imageData.get("picturePath");

            if (pictureType == null || pictureType.trim().isEmpty()) {
                sendErrorResponse(exchange, 400, "Picture type is required");
                return;
            }

            if (picturePath == null || picturePath.trim().isEmpty()) {
                sendErrorResponse(exchange, 400, "Picture path is required");
                return;
            }

            Map<String, Object> image = createImage(pictureType, picturePath);
            if (image != null) {
                sendJsonResponse(exchange, 201, image);
            } else {
                sendErrorResponse(exchange, 500, "Failed to create image");
            }
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error creating image from JSON", e);
            sendErrorResponse(exchange, 500, "Failed to create image");
        }
    }

    private void handleUpdateImage(HttpExchange exchange, String pictureId) throws IOException {
        try {
            String contentType = exchange.getRequestHeaders().getFirst("Content-Type");
            LOGGER.info("Content-Type: " + contentType);
            
            Map<String, Object> imageData = new HashMap<>();
            
            if (contentType != null && contentType.startsWith("multipart/form-data")) {
                // Handle multipart form data
                LOGGER.info("Processing multipart form data");
                String boundary = extractBoundary(contentType);
                if (boundary != null) {
                    Map<String, String> multipartData = parseMultipartData(exchange.getRequestBody(), boundary);
                    // Convert Map<String, String> to Map<String, Object>
                    imageData = new HashMap<>();
                    for (Map.Entry<String, String> entry : multipartData.entrySet()) {
                        imageData.put(entry.getKey(), entry.getValue());
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
                
                imageData = JsonUtil.fromJson(requestBody, Map.class);
            }
            
            LOGGER.info("Parsed image data: " + imageData);
            LOGGER.info("Image data keys: " + imageData.keySet());
            LOGGER.info("Image data values: " + imageData.values());
            
            if (imageData == null || imageData.isEmpty()) {
                LOGGER.warning("No valid image data received");
                sendErrorResponse(exchange, 400, "No valid image data provided");
                return;
            }

            // Check if image exists first
            Map<String, Object> existingImage = getImageById(pictureId);
            if (existingImage == null) {
                LOGGER.warning("Image not found with ID: " + pictureId);
                sendErrorResponse(exchange, 404, "Image not found");
                return;
            }
            LOGGER.info("Found existing image: " + existingImage.get("pictureName"));
            LOGGER.info("Existing image data: " + existingImage);

            boolean updated = updateImage(pictureId, imageData);
            LOGGER.info("Update result: " + updated);
            
            if (updated) {
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Image updated successfully");
                response.put("pictureId", pictureId);
                sendJsonResponse(exchange, 200, response);
            } else {
                LOGGER.warning("Image update failed - no changes made or database error");
                sendErrorResponse(exchange, 500, "Failed to update image. Please check the data and try again.");
            }
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error updating image", e);
            String errorMessage = "Failed to update image";
            if (e.getMessage() != null) {
                errorMessage += ": " + e.getMessage();
            }
            sendErrorResponse(exchange, 500, errorMessage);
        }
    }

    private void handleDeleteImage(HttpExchange exchange, String pictureId) throws IOException {
        try {
            boolean deleted = deleteImage(pictureId);
            if (deleted) {
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Image deleted successfully");
                sendJsonResponse(exchange, 200, response);
            } else {
                sendErrorResponse(exchange, 404, "Image not found");
            }
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error deleting image", e);
            sendErrorResponse(exchange, 500, "Failed to delete image");
        }
    }

    private List<Map<String, Object>> getAllImages() {
        List<Map<String, Object>> images = new ArrayList<>();
        String sql = "SELECT * FROM gallery ORDER BY createdAt DESC";
        
        try (Connection conn = DatabaseConfig.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            
            while (rs.next()) {
                Map<String, Object> image = mapResultSetToImage(rs);
                images.add(image);
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error getting all images", e);
        }
        return images;
    }

    private Map<String, Object> getImageById(String pictureId) {
        String sql = "SELECT * FROM gallery WHERE pictureId = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, pictureId);
            
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return mapResultSetToImage(rs);
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error getting image by ID", e);
        }
        return null;
    }

    private Map<String, Object> createImage(String pictureType, String picturePath) {
        String pictureId = "pic_" + System.currentTimeMillis();
        String pictureName = "Gallery Image " + pictureId;
        String sql = "INSERT INTO gallery (pictureId, pictureName, pictureImage, pictureType, createdAt) VALUES (?, ?, ?, ?, ?)";
        
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, pictureId);
            stmt.setString(2, pictureName);
            stmt.setString(3, picturePath);
            stmt.setString(4, pictureType);
            stmt.setString(5, LocalDateTime.now().toString());
            
            int affected = stmt.executeUpdate();
            if (affected > 0) {
                Map<String, Object> image = new HashMap<>();
                image.put("pictureId", pictureId);
                image.put("pictureName", pictureName);
                image.put("pictureImage", picturePath);
                image.put("pictureType", pictureType);
                image.put("createdAt", LocalDateTime.now().toString());
                return image;
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error creating image", e);
        }
        return null;
    }

    private boolean updateImage(String pictureId, Map<String, Object> imageData) {
        // Test database connection first
        try (Connection testConn = DatabaseConfig.getConnection()) {
            LOGGER.info("Database connection test successful");
        } catch (SQLException e) {
            LOGGER.severe("Database connection test failed: " + e.getMessage());
            return false;
        }
        
        StringBuilder sql = new StringBuilder("UPDATE gallery SET ");
        List<Object> params = new ArrayList<>();
        
        LOGGER.info("Updating image with ID: " + pictureId);
        LOGGER.info("Update data received: " + imageData);
        LOGGER.info("Available keys: " + imageData.keySet());
        
        // Only update fields that are provided and not empty
        if (imageData.containsKey("pictureName") && imageData.get("pictureName") != null && !imageData.get("pictureName").toString().trim().isEmpty()) {
            sql.append("pictureName = ?, ");
            params.add(imageData.get("pictureName"));
            LOGGER.info("Adding pictureName to update");
        }
        if (imageData.containsKey("pictureImage") || imageData.containsKey("picturePath")) {
            Object imageValue = imageData.get("pictureImage");
            if (imageValue == null) {
                imageValue = imageData.get("picturePath");
            }
            if (imageValue != null && !imageValue.toString().trim().isEmpty()) {
                sql.append("pictureImage = ?, ");
                params.add(imageValue);
                LOGGER.info("Adding pictureImage to update");
            }
        }
        if (imageData.containsKey("pictureType") && imageData.get("pictureType") != null && !imageData.get("pictureType").toString().trim().isEmpty()) {
            sql.append("pictureType = ?, ");
            params.add(imageData.get("pictureType"));
            LOGGER.info("Adding pictureType to update");
        }
        
        // Check if there are any fields to update
        if (params.isEmpty()) {
            LOGGER.warning("No fields provided for update");
            return false;
        }
        
        // If only pictureType is provided, also update pictureName to match
        if (params.size() == 1 && imageData.containsKey("pictureType") && 
            (!imageData.containsKey("pictureName") || imageData.get("pictureName") == null || imageData.get("pictureName").toString().trim().isEmpty())) {
            
            String newPictureType = imageData.get("pictureType").toString();
            String defaultPictureName = "Gallery Image - " + newPictureType;
            
            sql.append("pictureName = ?, ");
            params.add(0, defaultPictureName); // Insert at beginning
            LOGGER.info("Adding default pictureName based on pictureType: " + defaultPictureName);
        }
        
        // Remove trailing comma and space safely
        String currentSql = sql.toString();
        if (currentSql.endsWith(", ")) {
            sql.setLength(sql.length() - 2);
            LOGGER.info("Removed trailing comma and space");
        }
        
        LOGGER.info("SQL after field updates: " + sql.toString());
        LOGGER.info("Parameters after field updates: " + params);
        
        // Try to add updatedAt field if it exists
        try {
            // Check if updatedAt column exists
            try (Connection conn = DatabaseConfig.getConnection();
                 Statement checkStmt = conn.createStatement()) {
                checkStmt.execute("SELECT updatedAt FROM gallery LIMIT 1");
                // Column exists, add it to update
                sql.append(", updatedAt = ? WHERE pictureId = ?");
                params.add(LocalDateTime.now().toString());
                LOGGER.info("updatedAt column found, adding to update");
            }
        } catch (SQLException e) {
            // Column doesn't exist, just add WHERE clause
            sql.append(" WHERE pictureId = ?");
            LOGGER.info("updatedAt column not found, skipping it");
        }
        
        params.add(pictureId);
        
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
                LOGGER.info("Image updated successfully");
                return true;
            } else {
                LOGGER.warning("No rows affected during update");
                return false;
            }
            
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error updating image", e);
            LOGGER.severe("SQL State: " + e.getSQLState());
            LOGGER.severe("Error Code: " + e.getErrorCode());
            LOGGER.severe("Error Message: " + e.getMessage());
            return false;
        }
    }

    private boolean deleteImage(String pictureId) {
        String sql = "DELETE FROM gallery WHERE pictureId = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, pictureId);
            
            int affected = stmt.executeUpdate();
            return affected > 0;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error deleting image", e);
        }
        return false;
    }

    private Map<String, Object> mapResultSetToImage(ResultSet rs) throws SQLException {
        Map<String, Object> image = new HashMap<>();
        image.put("pictureId", rs.getString("pictureId"));
        image.put("pictureName", rs.getString("pictureName"));
        image.put("pictureImage", rs.getString("pictureImage"));
        image.put("pictureType", rs.getString("pictureType"));
        image.put("createdAt", rs.getString("createdAt"));
        
        // Add updatedAt field if it exists
        try {
            String updatedAt = rs.getString("updatedAt");
            if (updatedAt != null) {
                image.put("updatedAt", updatedAt);
            }
        } catch (SQLException e) {
            LOGGER.info("updatedAt column not found in gallery table, skipping");
        }
        
        return image;
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
        
        // Read the entire input stream into a byte array for proper parsing
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        byte[] buffer = new byte[4096];
        int bytesRead;
        while ((bytesRead = inputStream.read(buffer)) != -1) {
            baos.write(buffer, 0, bytesRead);
        }
        byte[] data = baos.toByteArray();
        
        // Convert to string for parsing
        String content = new String(data, StandardCharsets.UTF_8);
        String[] parts = content.split(boundaryLine);
        
        for (String part : parts) {
            if (part.trim().isEmpty() || part.contains(endBoundary)) {
                continue;
            }
            
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
                    // Extract field name
                    if (line.contains("name=\"")) {
                        int start = line.indexOf("name=\"") + 6;
                        int end = line.indexOf("\"", start);
                        if (end > start) {
                            fieldName = line.substring(start, end);
                        }
                    }
                    
                    // Check if it's a file
                    if (line.contains("filename=")) {
                        isFile = true;
                        int start = line.indexOf("filename=\"") + 10;
                        int end = line.indexOf("\"", start);
                        if (end > start) {
                            filename = line.substring(start, end);
                        }
                    }
                } else if (line.startsWith("Content-Type:")) {
                    // Skip content type line
                    continue;
                } else if (line.trim().isEmpty()) {
                    // Empty line marks the start of data
                    inData = true;
                    continue;
                } else if (inData) {
                    // This is the actual data
                    if (isFile && filename != null) {
                        // For files, we need to extract the binary data
                        // Find the start of file data (after the empty line)
                        int dataStart = part.indexOf("\r\n\r\n");
                        if (dataStart == -1) {
                            dataStart = part.indexOf("\n\n");
                        }
                        if (dataStart != -1) {
                            dataStart += 4; // Skip the empty line
                            
                            // Extract file data (everything after the empty line)
                            String fileData = part.substring(dataStart);
                            // Remove trailing boundary if present
                            if (fileData.contains("\r\n--")) {
                                fileData = fileData.substring(0, fileData.indexOf("\r\n--"));
                            } else if (fileData.contains("\n--")) {
                                fileData = fileData.substring(0, fileData.indexOf("\n--"));
                            }
                            
                            // Save the file
                            String savedPath = saveImageFile(filename, fileData.getBytes(StandardCharsets.ISO_8859_1));
                            if (savedPath != null) {
                                formData.put(fieldName, savedPath);
                            } else {
                                formData.put(fieldName, filename); // Fallback to filename
                            }
                        }
                    } else {
                        // For text fields, accumulate the value
                        if (fieldValue.length() > 0) {
                            fieldValue.append("\n");
                        }
                        fieldValue.append(line);
                    }
                }
            }
            
            // Save non-file fields
            if (fieldName != null && !isFile && fieldValue.length() > 0) {
                formData.put(fieldName, fieldValue.toString().trim());
            }
        }
        
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
            String filename = "gallery_" + timestamp + extension;
            
            // Save the file
            File imageFile = new File(imagesDir, filename);
            try (FileOutputStream fos = new FileOutputStream(imageFile)) {
                fos.write(imageData);
            }
            
            LOGGER.info("Gallery image saved: " + imageFile.getAbsolutePath() + " (size: " + imageData.length + " bytes)");
            return filename; // Return the filename to store in database
            
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error saving gallery image file: " + originalFilename, e);
            return null;
        }
    }

    private void handleTestGalleryDatabase(HttpExchange exchange) throws IOException {
        try {
            LOGGER.info("=== TEST GALLERY DATABASE ===");
            
            Map<String, Object> response = new HashMap<>();
            List<Map<String, Object>> tableInfo = new ArrayList<>();
            
            try (Connection conn = DatabaseConfig.getConnection()) {
                // Check if gallery table exists
                try (Statement stmt = conn.createStatement()) {
                    try (ResultSet rs = stmt.executeQuery("SELECT name FROM sqlite_master WHERE type='table' AND name='gallery'")) {
                        if (rs.next()) {
                            response.put("galleryTable", "EXISTS");
                            
                            // Check gallery table structure
                            try (ResultSet schemaRs = stmt.executeQuery("PRAGMA table_info(gallery)")) {
                                while (schemaRs.next()) {
                                    Map<String, Object> column = new HashMap<>();
                                    column.put("name", schemaRs.getString("name"));
                                    column.put("type", schemaRs.getString("type"));
                                    column.put("notNull", schemaRs.getInt("notnull"));
                                    column.put("defaultValue", schemaRs.getString("dflt_value"));
                                    tableInfo.add(column);
                                }
                            }
                            
                            // Check gallery table count
                            try (ResultSet countRs = stmt.executeQuery("SELECT COUNT(*) as count FROM gallery")) {
                                if (countRs.next()) {
                                    response.put("galleryCount", countRs.getInt("count"));
                                }
                            }
                            
                            // Check sample gallery data
                            try (ResultSet sampleRs = stmt.executeQuery("SELECT pictureId, pictureName, pictureType FROM gallery LIMIT 3")) {
                                List<Map<String, Object>> sampleImages = new ArrayList<>();
                                while (sampleRs.next()) {
                                    Map<String, Object> image = new HashMap<>();
                                    image.put("pictureId", sampleRs.getString("pictureId"));
                                    image.put("pictureName", sampleRs.getString("pictureName"));
                                    image.put("pictureType", sampleRs.getString("pictureType"));
                                    sampleImages.add(image);
                                }
                                response.put("sampleImages", sampleImages);
                            }
                            
                        } else {
                            response.put("galleryTable", "NOT_EXISTS");
                        }
                    }
                }
                
                response.put("message", "Gallery database test completed");
                response.put("tableStructure", tableInfo);
                sendJsonResponse(exchange, 200, response);
                
            } catch (SQLException e) {
                LOGGER.log(Level.SEVERE, "Error checking gallery database", e);
                response.put("error", "Gallery database check failed: " + e.getMessage());
                sendJsonResponse(exchange, 500, response);
            }
            
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error in test gallery database endpoint", e);
            sendErrorResponse(exchange, 500, "Test failed: " + e.getMessage());
        }
    }

    private void handleTestGalleryUpdate(HttpExchange exchange) throws IOException {
        try {
            LOGGER.info("=== TEST GALLERY UPDATE ===");
            
            // Create a dummy image to update
            String dummyPictureId = "dummy_pic_" + System.currentTimeMillis();
            String dummyPictureName = "Dummy Gallery Image " + dummyPictureId;
            String dummyPicturePath = "dummy_path/to/dummy.jpg";
            String dummyPictureType = "dummy_type";
            String dummyCreatedAt = LocalDateTime.now().toString();

            // Insert the dummy image first
            Map<String, Object> dummyImage = createImage(dummyPictureType, dummyPicturePath);
            if (dummyImage == null) {
                sendErrorResponse(exchange, 500, "Failed to create dummy image for update test");
                return;
            }
            dummyPictureId = (String) dummyImage.get("pictureId");
            dummyPictureName = (String) dummyImage.get("pictureName");
            dummyPicturePath = (String) dummyImage.get("pictureImage");
            dummyCreatedAt = (String) dummyImage.get("createdAt");

            LOGGER.info("Created dummy image with ID: " + dummyPictureId);

            // Now, try to update the dummy image
            Map<String, Object> updateData = new HashMap<>();
            updateData.put("pictureName", "Updated Dummy Name");
            updateData.put("pictureImage", "updated_dummy_path/to/dummy.jpg");
            updateData.put("pictureType", "updated_dummy_type");

            boolean updated = updateImage(dummyPictureId, updateData);

            if (updated) {
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Gallery update test successful");
                response.put("updatedImageId", dummyPictureId);
                response.put("updatedImageName", updateData.get("pictureName"));
                response.put("updatedImagePath", updateData.get("pictureImage"));
                response.put("updatedImageType", updateData.get("pictureType"));
                sendJsonResponse(exchange, 200, response);
            } else {
                sendErrorResponse(exchange, 500, "Gallery update test failed. No rows affected or database error.");
            }

            // Clean up the dummy image
            deleteImage(dummyPictureId);
            LOGGER.info("Cleaned up dummy image with ID: " + dummyPictureId);

        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error in gallery update test endpoint", e);
            sendErrorResponse(exchange, 500, "Test failed: " + e.getMessage());
        }
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