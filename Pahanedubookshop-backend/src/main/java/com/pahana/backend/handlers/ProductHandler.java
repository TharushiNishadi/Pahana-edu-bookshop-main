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
            String requestBody = getRequestBody(exchange);
            Map<String, Object> productData = JsonUtil.fromJson(requestBody, Map.class);

            String productName = (String) productData.get("productName");
            String categoryName = (String) productData.get("categoryName");
            Double productPrice = (Double) productData.get("productPrice");
            String productDescription = (String) productData.get("productDescription");

            if (productName == null || categoryName == null || productPrice == null) {
                sendErrorResponse(exchange, 400, "Product name, category, and price are required");
                return;
            }

            Product product = createProduct(productName, categoryName, productPrice, productDescription);
            if (product != null) {
                sendJsonResponse(exchange, 201, product);
            } else {
                sendErrorResponse(exchange, 500, "Failed to create product");
            }
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error creating product", e);
            sendErrorResponse(exchange, 500, "Failed to create product");
        }
    }

    private void handleUpdateProduct(HttpExchange exchange, String productId) throws IOException {
        try {
            String requestBody = getRequestBody(exchange);
            Map<String, Object> productData = JsonUtil.fromJson(requestBody, Map.class);

            boolean updated = updateProduct(productId, productData);
            if (updated) {
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Product updated successfully");
                sendJsonResponse(exchange, 200, response);
            } else {
                sendErrorResponse(exchange, 404, "Product not found");
            }
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error updating product", e);
            sendErrorResponse(exchange, 500, "Failed to update product");
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

    private Product createProduct(String productName, String categoryName, double productPrice, String productDescription) {
        String productId = "prod_" + System.currentTimeMillis();
        String sql = "INSERT INTO products (productId, productName, categoryName, productPrice, productDescription, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)";
        
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, productId);
            stmt.setString(2, productName);
            stmt.setString(3, categoryName);
            stmt.setDouble(4, productPrice);
            stmt.setString(5, productDescription);
            stmt.setString(6, LocalDateTime.now().toString());
            stmt.setString(7, LocalDateTime.now().toString());
            
            int affected = stmt.executeUpdate();
            if (affected > 0) {
                Product product = new Product();
                product.setProductId(productId);
                product.setProductName(productName);
                product.setCategoryName(categoryName);
                product.setProductPrice(productPrice);
                product.setProductDescription(productDescription);
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
        
        if (productData.containsKey("productName")) {
            sql.append("productName = ?, ");
            params.add(productData.get("productName"));
        }
        if (productData.containsKey("categoryName")) {
            sql.append("categoryName = ?, ");
            params.add(productData.get("categoryName"));
        }
        if (productData.containsKey("productPrice")) {
            sql.append("productPrice = ?, ");
            params.add(productData.get("productPrice"));
        }
        if (productData.containsKey("productDescription")) {
            sql.append("productDescription = ?, ");
            params.add(productData.get("productDescription"));
        }
        
        sql.append("updatedAt = ? WHERE productId = ?");
        params.add(LocalDateTime.now().toString());
        params.add(productId);
        
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql.toString())) {
            
            for (int i = 0; i < params.size(); i++) {
                stmt.setObject(i + 1, params.get(i));
            }
            
            int affected = stmt.executeUpdate();
            return affected > 0;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error updating product", e);
        }
        return false;
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
} 