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
import java.util.Date;

public class BranchHandler implements HttpHandler {
    private static final Logger LOGGER = Logger.getLogger(BranchHandler.class.getName());

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        try {
            String path = exchange.getRequestURI().getPath();
            String method = exchange.getRequestMethod();
            
            LOGGER.info("=== BRANCH REQUEST ===");
            LOGGER.info("Method: " + method);
            LOGGER.info("Path: " + path);

            setCorsHeaders(exchange);

            if ("OPTIONS".equals(method)) {
                exchange.sendResponseHeaders(200, -1);
                return;
            }

            // Check if this is the test-branch context
            if ("/test-branch".equals(path)) {
                if ("POST".equals(method)) {
                    handleTestBranch(exchange);
                } else {
                    sendErrorResponse(exchange, 405, "Method not allowed for test endpoint");
                }
            } else if (path.startsWith("/branch/")) {
                // Handle individual branch operations (GET, PUT, DELETE)
                String branchId = path.substring("/branch/".length());
                switch (method) {
                    case "GET":
                        handleGetBranchById(exchange, branchId);
                        break;
                    case "PUT":
                        handleUpdateBranch(exchange, branchId);
                        break;
                    case "DELETE":
                        handleDeleteBranch(exchange, branchId);
                        break;
                    default:
                        sendErrorResponse(exchange, 405, "Method not allowed");
                }
            } else if ("/branch".equals(path)) {
                // Main branch context
                switch (method) {
                    case "GET":
                        handleGetBranches(exchange);
                        break;
                    case "POST":
                        handleCreateBranch(exchange);
                        break;
                    default:
                        sendErrorResponse(exchange, 405, "Method not allowed");
                }
            } else {
                sendErrorResponse(exchange, 404, "Endpoint not found");
            }
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error handling branch request", e);
            sendErrorResponse(exchange, 500, "Internal server error");
        }
    }

    private void handleGetBranches(HttpExchange exchange) throws IOException {
        try {
            LOGGER.info("=== FETCHING BRANCHES ===");
            
            List<Map<String, Object>> branches = getAllBranches();
            LOGGER.info("Found " + branches.size() + " branches");
            
            sendJsonResponse(exchange, 200, branches);
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error fetching branches", e);
            sendErrorResponse(exchange, 500, "Failed to fetch branches");
        }
    }

    private void handleGetBranchById(HttpExchange exchange, String branchId) throws IOException {
        try {
            LOGGER.info("=== FETCHING BRANCH BY ID ===");
            LOGGER.info("Branch ID: " + branchId);
            
            Map<String, Object> branch = getBranchById(branchId);
            if (branch != null) {
                sendJsonResponse(exchange, 200, branch);
            } else {
                sendErrorResponse(exchange, 404, "Branch not found");
            }
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error fetching branch by ID", e);
            sendErrorResponse(exchange, 500, "Failed to fetch branch");
        }
    }

    private void handleCreateBranch(HttpExchange exchange) throws IOException {
        try {
            LOGGER.info("=== CREATING BRANCH ===");
            
            String requestBody = getRequestBody(exchange);
            Map<String, Object> branchData = JsonUtil.fromJson(requestBody, Map.class);
            
            String branchName = (String) branchData.get("branchName");
            String branchAddress = (String) branchData.get("branchAddress");
            String branchPhone = (String) branchData.get("branchPhone");
            String branchEmail = (String) branchData.get("branchEmail");
            
            if (branchName == null || branchAddress == null) {
                sendErrorResponse(exchange, 400, "Branch name and address are required");
                return;
            }
            
            Map<String, Object> newBranch = createBranch(branchName, branchAddress, branchPhone, branchEmail);
            if (newBranch != null) {
                sendJsonResponse(exchange, 201, newBranch);
            } else {
                sendErrorResponse(exchange, 500, "Failed to create branch");
            }
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error creating branch", e);
            sendErrorResponse(exchange, 500, "Failed to create branch");
        }
    }

    private void handleUpdateBranch(HttpExchange exchange, String branchId) throws IOException {
        try {
            LOGGER.info("=== UPDATING BRANCH ===");
            LOGGER.info("Branch ID: " + branchId);
            
            String requestBody = getRequestBody(exchange);
            Map<String, Object> branchData = JsonUtil.fromJson(requestBody, Map.class);
            
            boolean updated = updateBranch(branchId, branchData);
            if (updated) {
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Branch updated successfully");
                response.put("branchId", branchId);
                sendJsonResponse(exchange, 200, response);
            } else {
                sendErrorResponse(exchange, 404, "Branch not found");
            }
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error updating branch", e);
            sendErrorResponse(exchange, 500, "Failed to update branch");
        }
    }

    private void handleDeleteBranch(HttpExchange exchange, String branchId) throws IOException {
        try {
            LOGGER.info("=== DELETING BRANCH ===");
            LOGGER.info("Branch ID: " + branchId);
            
            boolean deleted = deleteBranch(branchId);
            if (deleted) {
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Branch deleted successfully");
                sendJsonResponse(exchange, 200, response);
            } else {
                sendErrorResponse(exchange, 404, "Branch not found");
            }
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error deleting branch", e);
            sendErrorResponse(exchange, 500, "Failed to delete branch");
        }
    }

    private List<Map<String, Object>> getAllBranches() throws SQLException {
        List<Map<String, Object>> branches = new ArrayList<>();
        
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement("SELECT * FROM branches ORDER BY branchName")) {
            
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> branch = new HashMap<>();
                    branch.put("branchId", rs.getString("branchId"));
                    branch.put("branchName", rs.getString("branchName"));
                    branch.put("branchAddress", rs.getString("branchAddress"));
                    branch.put("branchPhone", rs.getString("branchPhone"));
                    branch.put("branchEmail", rs.getString("branchEmail"));
                    branch.put("createdAt", rs.getString("createdAt"));
                    
                    branches.add(branch);
                    LOGGER.info("Branch: " + branch.get("branchName"));
                }
            }
        }
        
        return branches;
    }

    private Map<String, Object> getBranchById(String branchId) throws SQLException {
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement("SELECT * FROM branches WHERE branchId = ?")) {
            
            stmt.setString(1, branchId);
            
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    Map<String, Object> branch = new HashMap<>();
                    branch.put("branchId", rs.getString("branchId"));
                    branch.put("branchName", rs.getString("branchName"));
                    branch.put("branchAddress", rs.getString("branchAddress"));
                    branch.put("branchPhone", rs.getString("branchPhone"));
                    branch.put("branchEmail", rs.getString("branchEmail"));
                    branch.put("createdAt", rs.getString("createdAt"));
                    return branch;
                }
            }
        }
        return null;
    }

    private Map<String, Object> createBranch(String branchName, String branchAddress, String branchPhone, String branchEmail) throws SQLException {
        String branchId = UUID.randomUUID().toString();
        String createdAt = new Date().toString();

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(
                 "INSERT INTO branches (branchId, branchName, branchAddress, branchPhone, branchEmail, createdAt) VALUES (?, ?, ?, ?, ?, ?)")) {
            
            stmt.setString(1, branchId);
            stmt.setString(2, branchName);
            stmt.setString(3, branchAddress);
            stmt.setString(4, branchPhone);
            stmt.setString(5, branchEmail);
            stmt.setString(6, createdAt);
            
            int rowsAffected = stmt.executeUpdate();
            if (rowsAffected > 0) {
                Map<String, Object> newBranch = new HashMap<>();
                newBranch.put("branchId", branchId);
                newBranch.put("branchName", branchName);
                newBranch.put("branchAddress", branchAddress);
                newBranch.put("branchPhone", branchPhone);
                newBranch.put("branchEmail", branchEmail);
                newBranch.put("createdAt", createdAt);
                return newBranch;
            }
        }
        return null;
    }

    private boolean updateBranch(String branchId, Map<String, Object> branchData) throws SQLException {
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(
                 "UPDATE branches SET branchName = ?, branchAddress = ?, branchPhone = ?, branchEmail = ? WHERE branchId = ?")) {
            
            stmt.setString(1, (String) branchData.get("branchName"));
            stmt.setString(2, (String) branchData.get("branchAddress"));
            stmt.setString(3, (String) branchData.get("branchPhone"));
            stmt.setString(4, (String) branchData.get("branchEmail"));
            stmt.setString(5, branchId);
            
            int rowsAffected = stmt.executeUpdate();
            return rowsAffected > 0;
        }
    }

    private boolean deleteBranch(String branchId) throws SQLException {
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement("DELETE FROM branches WHERE branchId = ?")) {
            
            stmt.setString(1, branchId);
            
            int rowsAffected = stmt.executeUpdate();
            return rowsAffected > 0;
        }
    }

    private String getRequestBody(HttpExchange exchange) throws IOException {
        StringBuilder requestBody = new StringBuilder();
        try (InputStream is = exchange.getRequestBody()) {
            byte[] buffer = new byte[1024];
            int bytesRead;
            while ((bytesRead = is.read(buffer)) != -1) {
                requestBody.append(new String(buffer, 0, bytesRead, StandardCharsets.UTF_8));
            }
        }
        return requestBody.toString();
    }

    private void handleTestBranch(HttpExchange exchange) throws IOException {
        try {
            LOGGER.info("=== TESTING BRANCH HANDLER ===");
            
            // Test database connection
            try (Connection conn = DatabaseConfig.getConnection()) {
                LOGGER.info("Database connection successful");
                
                // Check if branches table exists
                try (Statement stmt = conn.createStatement()) {
                    boolean tableExists = stmt.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='branches'");
                    if (tableExists) {
                        try (ResultSet rs = stmt.getResultSet()) {
                            if (rs.next()) {
                                LOGGER.info("Branches table exists");
                            } else {
                                LOGGER.warning("Branches table does not exist");
                            }
                        }
                    }
                }
                
                // Count branches
                try (Statement stmt = conn.createStatement()) {
                    boolean hasResults = stmt.execute("SELECT COUNT(*) as count FROM branches");
                    if (hasResults) {
                        try (ResultSet rs = stmt.getResultSet()) {
                            if (rs.next()) {
                                int count = rs.getInt("count");
                                LOGGER.info("Number of branches in database: " + count);
                            }
                        }
                    }
                }
                
                // Show sample branch data
                try (Statement stmt = conn.createStatement()) {
                    boolean hasResults = stmt.execute("SELECT * FROM branches LIMIT 3");
                    if (hasResults) {
                        try (ResultSet rs = stmt.getResultSet()) {
                            while (rs.next()) {
                                LOGGER.info("Branch: " + rs.getString("branchName") + " at " + rs.getString("branchAddress"));
                            }
                        }
                    }
                }
                
            } catch (SQLException e) {
                LOGGER.log(Level.SEVERE, "Database error in test", e);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Branch test completed - check server logs");
            response.put("timestamp", new Date().toString());
            sendJsonResponse(exchange, 200, response);
            
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error in branch test", e);
            sendErrorResponse(exchange, 500, "Test failed");
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