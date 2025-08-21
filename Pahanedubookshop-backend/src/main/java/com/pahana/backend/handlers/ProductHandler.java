package com.pahana.backend.handlers;

import com.pahana.backend.config.DatabaseConfig;
import com.pahana.backend.models.Product;
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
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;

public class ProductHandler implements HttpHandler {
    private static final Logger LOGGER = Logger.getLogger(ProductHandler.class.getName());

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        try {
            String path = exchange.getRequestURI().getPath();
            String method = exchange.getRequestMethod();
            String query = exchange.getRequestURI().getQuery();

            setCorsHeaders(exchange);

            if ("OPTIONS".equals(method)) {
                exchange.sendResponseHeaders(200, -1);
                return;
            }

            if (path.startsWith("/product/")) {
                String productId = path.substring("/product/".length());
                if (productId.contains("/")) {
                    productId = productId.substring(0, productId.indexOf("/"));
                }
                
                switch (method) {
                    case "GET":
                        if (query != null && query.contains("categoryName")) {
                            handleGetProductsByCategory(exchange, query);
                        } else {
                            handleGetProductById(exchange, productId);
                        }
                        break;
                    case "PUT":
                        handleUpdateProduct(exchange, productId);
                        break;
                    case "DELETE":
                        handleDeleteProduct(exchange, productId);
                        break;
                    default:
                        sendErrorResponse(exchange, 405, "Method not allowed");
                }
            } else if ("/product".equals(path)) {
                switch (method) {
                    case "GET":
                        handleGetAllProducts(exchange);
                        break;
                    case "POST":
                        handleCreateProduct(exchange);
                        break;
                    default:
                        sendErrorResponse(exchange, 405, "Method not allowed");
                }
            } else if ("/test-product-db".equals(path)) {
                // Test endpoint to check products table structure
                if ("GET".equals(method)) {
                    handleTestProductDatabase(exchange);
                } else {
                    sendErrorResponse(exchange, 405, "Method not allowed");
                }
            } else {
                sendErrorResponse(exchange, 404, "Endpoint not found");
            }
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error handling product request", e);
            sendErrorResponse(exchange, 500, "Internal server error");
        }
    }

    private void handleGetAllProducts(HttpExchange exchange) throws IOException {
        try {
            List<Product> products = getAllProducts();
            sendJsonResponse(exchange, 200, products);
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error getting all products", e);
            sendErrorResponse(exchange, 500, "Failed to get products");
        }
    }

    private void handleGetProductById(HttpExchange exchange, String productId) throws IOException {
        try {
            Product product = getProductById(productId);
            if (product != null) {
                sendJsonResponse(exchange, 200, product);
            } else {
                sendErrorResponse(exchange, 404, "Product not found");
            }
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error getting product by ID", e);
            sendErrorResponse(exchange, 500, "Failed to get product");
        }
    }

    private void handleGetProductsByCategory(HttpExchange exchange, String query) throws IOException {
        try {
            String categoryName = extractCategoryNameFromQuery(query);
            List<Product> products = getProductsByCategory(categoryName);
            sendJsonResponse(exchange, 200, products);
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error getting products by category", e);
            sendErrorResponse(exchange, 500, "Failed to get products by category");
        }
    }

    private void handleCreateProduct(HttpExchange exchange) throws IOException {
        try {
            // Check if it's multipart form data
            String contentType = exchange.getRequestHeaders().getFirst("Content-Type");
            if (contentType != null && contentType.startsWith("multipart/form-data")) {
                handleMultipartProduct(exchange);
            } else {
                // Handle JSON request (fallback)
                handleJsonProduct(exchange);
            }
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error creating product", e);
            sendErrorResponse(exchange, 500, "Failed to create product");
        }
    }

    private void handleMultipartProduct(HttpExchange exchange) throws IOException {
        try {
            String contentType = exchange.getRequestHeaders().getFirst("Content-Type");
            String boundary = extractBoundary(contentType);
            
            if (boundary == null) {
                sendErrorResponse(exchange, 400, "Invalid multipart boundary");
                return;
            }

            Map<String, String> formData = parseMultipartData(exchange.getRequestBody(), boundary);
            
            String productName = formData.get("productName");
            String categoryName = formData.get("categoryName");
            String productPriceStr = formData.get("productPrice");
            String productDescription = formData.get("productDescription");
            String productImage = formData.get("productImage");

            if (productName == null || productName.trim().isEmpty()) {
                sendErrorResponse(exchange, 400, "Product name is required");
                return;
            }

            if (categoryName == null || categoryName.trim().isEmpty()) {
                sendErrorResponse(exchange, 400, "Category name is required");
                return;
            }

            if (productPriceStr == null || productPriceStr.trim().isEmpty()) {
                sendErrorResponse(exchange, 400, "Product price is required");
                return;
            }

            Double productPrice;
            try {
                productPrice = Double.parseDouble(productPriceStr);
            } catch (NumberFormatException e) {
                sendErrorResponse(exchange, 400, "Invalid product price format");
                return;
            }

            // For now, we'll store the image filename/path as a string
            String imagePath = productImage != null ? productImage : "";

            Product product = createProduct(productName, categoryName, productPrice, productDescription, imagePath, 0, "Active", 0.0);
            if (product != null) {
                sendJsonResponse(exchange, 201, product);
            } else {
                sendErrorResponse(exchange, 500, "Failed to create product");
            }
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error handling multipart product", e);
            sendErrorResponse(exchange, 500, "Failed to create product");
        }
    }

    private void handleJsonProduct(HttpExchange exchange) throws IOException {
        try {
            String requestBody = getRequestBody(exchange);
            Map<String, Object> productData = JsonUtil.fromJson(requestBody, Map.class);

            String productName = (String) productData.get("productName");
            String categoryName = (String) productData.get("categoryName");
            Double productPrice = (Double) productData.get("productPrice");
            String productDescription = (String) productData.get("productDescription");
            String productImage = (String) productData.get("productImage");

            if (productName == null || categoryName == null || productPrice == null) {
                sendErrorResponse(exchange, 400, "Product name, category, and price are required");
                return;
            }

            Product product = createProduct(productName, categoryName, productPrice, productDescription, productImage, 0, "Active", 0.0);
            if (product != null) {
                sendJsonResponse(exchange, 201, product);
            } else {
                sendErrorResponse(exchange, 500, "Failed to create product");
            }
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error creating product from JSON", e);
            sendErrorResponse(exchange, 500, "Failed to create product");
        }
    }

    private void handleUpdateProduct(HttpExchange exchange, String productId) throws IOException {
        try {
            String contentType = exchange.getRequestHeaders().getFirst("Content-Type");
            LOGGER.info("Content-Type: " + contentType);
            
            Map<String, Object> productData = new HashMap<>();
            
            if (contentType != null && contentType.startsWith("multipart/form-data")) {
                // Handle multipart form data
                LOGGER.info("Processing multipart form data");
                String boundary = extractBoundary(contentType);
                if (boundary != null) {
                    Map<String, String> multipartData = parseMultipartData(exchange.getRequestBody(), boundary);
                    // Convert Map<String, String> to Map<String, Object>
                    productData = new HashMap<>();
                    for (Map.Entry<String, String> entry : multipartData.entrySet()) {
                        productData.put(entry.getKey(), entry.getValue());
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
                
                productData = JsonUtil.fromJson(requestBody, Map.class);
            }
            
            LOGGER.info("Parsed product data: " + productData);
            
            if (productData == null || productData.isEmpty()) {
                LOGGER.warning("No valid product data received");
                sendErrorResponse(exchange, 400, "No valid product data provided");
                return;
            }

            // Check if product exists first
            Product existingProduct = getProductById(productId);
            if (existingProduct == null) {
                LOGGER.warning("Product not found with ID: " + productId);
                sendErrorResponse(exchange, 404, "Product not found");
                return;
            }
            LOGGER.info("Found existing product: " + existingProduct.getProductName());

            boolean updated = updateProduct(productId, productData);
            if (updated) {
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Product updated successfully");
                response.put("productId", productId);
                sendJsonResponse(exchange, 200, response);
            } else {
                LOGGER.warning("Product update failed - no changes made or database error");
                sendErrorResponse(exchange, 500, "Failed to update product. Please check the data and try again.");
            }
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error updating product", e);
            String errorMessage = "Failed to update product";
            if (e.getMessage() != null) {
                errorMessage += ": " + e.getMessage();
            }
            sendErrorResponse(exchange, 500, errorMessage);
        }
    }

    private void handleDeleteProduct(HttpExchange exchange, String productId) throws IOException {
        try {
            boolean deleted = deleteProduct(productId);
            if (deleted) {
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Product deleted successfully");
                sendJsonResponse(exchange, 200, response);
            } else {
                sendErrorResponse(exchange, 404, "Product not found");
            }
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error deleting product", e);
            sendErrorResponse(exchange, 500, "Failed to delete product");
        }
    }

    private List<Product> getAllProducts() {
        List<Product> products = new ArrayList<>();
        String sql = "SELECT * FROM products ORDER BY createdAt DESC";
        
        try (Connection conn = DatabaseConfig.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            
            while (rs.next()) {
                Product product = mapResultSetToProduct(rs);
                products.add(product);
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error getting all products", e);
        }
        return products;
    }

    private Product getProductById(String productId) {
        String sql = "SELECT * FROM products WHERE productId = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, productId);
            
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return mapResultSetToProduct(rs);
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error getting product by ID", e);
        }
        return null;
    }

    private List<Product> getProductsByCategory(String categoryName) {
        List<Product> products = new ArrayList<>();
        String sql = "SELECT * FROM products WHERE categoryName = ? ORDER BY createdAt DESC";
        
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, categoryName);
            
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    Product product = mapResultSetToProduct(rs);
                    products.add(product);
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error getting products by category", e);
        }
        return products;
    }

    private Product createProduct(String productName, String categoryName, double productPrice, String productDescription, String productImage, int stockQuantity, String status, double discountPercentage) {
        String productId = "prod_" + System.currentTimeMillis();
        String sql = "INSERT INTO products (productId, productName, categoryName, productPrice, productImage, productDescription, stockQuantity, status, discountPercentage, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, productId);
            stmt.setString(2, productName);
            stmt.setString(3, categoryName);
            stmt.setDouble(4, productPrice);
            stmt.setString(5, productImage);
            stmt.setString(6, productDescription);
            stmt.setInt(7, stockQuantity);
            stmt.setString(8, status);
            stmt.setDouble(9, discountPercentage);
            stmt.setString(10, LocalDateTime.now().toString());
            stmt.setString(11, LocalDateTime.now().toString());
            
            int affected = stmt.executeUpdate();
            if (affected > 0) {
                Product product = new Product();
                product.setProductId(productId);
                product.setProductName(productName);
                product.setCategoryName(categoryName);
                product.setProductPrice(productPrice);
                product.setProductImage(productImage);
                product.setProductDescription(productDescription);
                product.setStockQuantity(stockQuantity);
                product.setStatus(status);
                product.setDiscountPercentage(discountPercentage);
                return product;
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error creating product", e);
        }
        return null;
    }

    private boolean updateProduct(String productId, Map<String, Object> productData) {
        StringBuilder sql = new StringBuilder("UPDATE products SET ");
        List<Object> params = new ArrayList<>();
        
        LOGGER.info("Updating product with ID: " + productId);
        LOGGER.info("Update data: " + productData);
        
        if (productData.containsKey("productName")) {
            sql.append("productName = ?, ");
            params.add(productData.get("productName"));
            LOGGER.info("Adding productName to update");
        }
        if (productData.containsKey("categoryName")) {
            sql.append("categoryName = ?, ");
            params.add(productData.get("categoryName"));
            LOGGER.info("Adding categoryName to update");
        }
        if (productData.containsKey("productPrice")) {
            sql.append("productPrice = ?, ");
            params.add(productData.get("productPrice"));
            LOGGER.info("Adding productPrice to update");
        }
        if (productData.containsKey("productImage")) {
            sql.append("productImage = ?, ");
            params.add(productData.get("productImage"));
            LOGGER.info("Adding productImage to update");
        }
        if (productData.containsKey("productDescription")) {
            sql.append("productDescription = ?, ");
            params.add(productData.get("productDescription"));
            LOGGER.info("Adding productDescription to update");
        }
        if (productData.containsKey("stockQuantity")) {
            sql.append("stockQuantity = ?, ");
            params.add(productData.get("stockQuantity"));
            LOGGER.info("Adding stockQuantity to update");
        }
        if (productData.containsKey("status")) {
            sql.append("status = ?, ");
            params.add(productData.get("status"));
            LOGGER.info("Adding status to update");
        }
        if (productData.containsKey("discountPercentage")) {
            sql.append("discountPercentage = ?, ");
            params.add(productData.get("discountPercentage"));
            LOGGER.info("Adding discountPercentage to update");
        }
        
        // Check if there are any fields to update
        if (params.isEmpty()) {
            LOGGER.warning("No fields provided for update");
            return false;
        }
        
        // Remove trailing comma
        sql.setLength(sql.length() - 2); // Remove ", " from the end
        
        sql.append(", updatedAt = ? WHERE productId = ?");
        params.add(LocalDateTime.now().toString());
        params.add(productId);
        
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
                LOGGER.info("Product updated successfully");
                return true;
            } else {
                LOGGER.warning("No rows affected during update");
                return false;
            }
            
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error updating product", e);
            LOGGER.severe("SQL State: " + e.getSQLState());
            LOGGER.severe("Error Code: " + e.getErrorCode());
            LOGGER.severe("Error Message: " + e.getMessage());
            return false;
        }
    }

    private boolean deleteProduct(String productId) {
        String sql = "DELETE FROM products WHERE productId = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, productId);
            
            int affected = stmt.executeUpdate();
            return affected > 0;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error deleting product", e);
        }
        return false;
    }

    private Product mapResultSetToProduct(ResultSet rs) throws SQLException {
        Product product = new Product();
        product.setProductId(rs.getString("productId"));
        product.setProductName(rs.getString("productName"));
        product.setCategoryName(rs.getString("categoryName"));
        product.setProductPrice(rs.getDouble("productPrice"));
        product.setProductImage(rs.getString("productImage"));
        product.setProductDescription(rs.getString("productDescription"));
        product.setStockQuantity(rs.getInt("stockQuantity"));
        product.setStatus(rs.getString("status"));
        product.setDiscountPercentage(rs.getDouble("discountPercentage"));
        return product;
    }

    private String extractCategoryNameFromQuery(String query) {
        if (query != null && query.contains("categoryName=")) {
            String[] parts = query.split("categoryName=");
            if (parts.length > 1) {
                String categoryName = parts[1];
                if (categoryName.contains("&")) {
                    categoryName = categoryName.substring(0, categoryName.indexOf("&"));
                }
                return categoryName;
            }
        }
        return "";
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
            String filename = "product_" + timestamp + extension;
            
            // Save the file
            File imageFile = new File(imagesDir, filename);
            try (FileOutputStream fos = new FileOutputStream(imageFile)) {
                fos.write(imageData);
            }
            
            LOGGER.info("Product image saved: " + imageFile.getAbsolutePath() + " (size: " + imageData.length + " bytes)");
            return filename; // Return the filename to store in database
            
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error saving product image file: " + originalFilename, e);
            return null;
        }
    }

    private void handleTestProductDatabase(HttpExchange exchange) throws IOException {
        try {
            LOGGER.info("=== TEST PRODUCT DATABASE ===");
            
            Map<String, Object> response = new HashMap<>();
            List<Map<String, Object>> tableInfo = new ArrayList<>();
            
            try (Connection conn = DatabaseConfig.getConnection()) {
                // Check if products table exists
                try (Statement stmt = conn.createStatement()) {
                    try (ResultSet rs = stmt.executeQuery("SELECT name FROM sqlite_master WHERE type='table' AND name='products'")) {
                        if (rs.next()) {
                            response.put("productsTable", "EXISTS");
                            
                            // Check products table structure
                            try (ResultSet schemaRs = stmt.executeQuery("PRAGMA table_info(products)")) {
                                while (schemaRs.next()) {
                                    Map<String, Object> column = new HashMap<>();

                                    column.put("name", schemaRs.getString("name"));
                                    column.put("type", schemaRs.getString("type"));
                                    column.put("notNull", schemaRs.getInt("notnull"));
                                    column.put("defaultValue", schemaRs.getString("dflt_value"));
                                    tableInfo.add(column);
                                }
                            }
                            
                            // Check products table count
                            try (ResultSet countRs = stmt.executeQuery("SELECT COUNT(*) as count FROM products")) {
                                if (countRs.next()) {
                                    response.put("productsCount", countRs.getInt("count"));
                                }
                            }
                            
                            // Check sample product data
                            try (ResultSet sampleRs = stmt.executeQuery("SELECT productId, productName, categoryName, productPrice FROM products LIMIT 3")) {
                                List<Map<String, Object>> sampleProducts = new ArrayList<>();
                                while (sampleRs.next()) {
                                    Map<String, Object> product = new HashMap<>();
                                    product.put("productId", sampleRs.getString("productId"));
                                    product.put("productName", sampleRs.getString("productName"));
                                    product.put("categoryName", sampleRs.getString("categoryName"));
                                    product.put("productPrice", sampleRs.getDouble("productPrice"));
                                    sampleProducts.add(product);
                                }
                                response.put("sampleProducts", sampleProducts);
                            }
                            
                        } else {
                            response.put("productsTable", "NOT_EXISTS");
                        }
                    }
                }
                
                response.put("message", "Product database test completed");
                response.put("tableStructure", tableInfo);
                sendJsonResponse(exchange, 200, response);
                
            } catch (SQLException e) {
                LOGGER.log(Level.SEVERE, "Error checking product database", e);
                response.put("error", "Product database check failed: " + e.getMessage());
                sendJsonResponse(exchange, 500, response);
            }
            
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error in test product database endpoint", e);
            sendErrorResponse(exchange, 500, "Test failed: " + e.getMessage());
        }
    }
} 