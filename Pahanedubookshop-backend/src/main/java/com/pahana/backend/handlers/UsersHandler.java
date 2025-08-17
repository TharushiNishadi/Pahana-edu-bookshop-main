package com.pahana.backend.handlers;

import com.pahana.backend.config.DatabaseConfig;
import com.pahana.backend.models.User;
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

public class UsersHandler implements HttpHandler {
    private static final Logger LOGGER = Logger.getLogger(UsersHandler.class.getName());

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

            if (path.startsWith("/users/")) {
                String userId = path.substring("/users/".length());
                switch (method) {
                    case "GET":
                        handleGetUserById(exchange, userId);
                        break;
                    case "PUT":
                        handleUpdateUser(exchange, userId);
                        break;
                    case "DELETE":
                        handleDeleteUser(exchange, userId);
                        break;
                    default:
                        sendErrorResponse(exchange, 405, "Method not allowed");
                }
            } else if ("/users".equals(path)) {
                switch (method) {
                    case "GET":
                        handleGetAllUsers(exchange);
                        break;
                    case "POST":
                        handleCreateUser(exchange);
                        break;
                    default:
                        sendErrorResponse(exchange, 405, "Method not allowed");
                }
            } else if ("/test-users-db".equals(path)) {
                // Test endpoint to check users table structure
                if ("GET".equals(method)) {
                    handleTestUsersDatabase(exchange);
                } else {
                    sendErrorResponse(exchange, 405, "Method not allowed");
                }
            } else {
                sendErrorResponse(exchange, 404, "Endpoint not found");
            }
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error handling user request", e);
            sendErrorResponse(exchange, 500, "Internal server error");
        }
    }

    private void handleGetAllUsers(HttpExchange exchange) throws IOException {
        try {
            List<User> users = getAllUsers();
            sendJsonResponse(exchange, 200, users);
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error getting all users", e);
            sendErrorResponse(exchange, 500, "Failed to get users");
        }
    }

    private void handleGetUserById(HttpExchange exchange, String userId) throws IOException {
        try {
            User user = getUserById(userId);
            if (user != null) {
                sendJsonResponse(exchange, 200, user);
            } else {
                sendErrorResponse(exchange, 404, "User not found");
            }
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error getting user by ID", e);
            sendErrorResponse(exchange, 500, "Failed to get user");
        }
    }

    private void handleCreateUser(HttpExchange exchange) throws IOException {
        try {
            String requestBody = getRequestBody(exchange);
            Map<String, Object> userData = JsonUtil.fromJson(requestBody, Map.class);
            
            LOGGER.info("Creating user with data: " + userData);

            // Handle both field name variations
            String username = (String) userData.get("username");
            String email = (String) userData.get("email") != null ? 
                          (String) userData.get("email") : 
                          (String) userData.get("userEmail");
            String password = (String) userData.get("password");
            String phoneNumber = (String) userData.get("phoneNumber");
            String userType = (String) userData.get("userType");
            String profilePicture = (String) userData.get("profilePicture");

            if (username == null || email == null || password == null) {
                sendErrorResponse(exchange, 400, "Missing required fields: username, email, password");
                return;
            }

            // Set default values for optional fields
            if (phoneNumber == null) phoneNumber = "N/A";
            if (userType == null) userType = "Customer";
            if (profilePicture == null) profilePicture = "default.jpg";

            LOGGER.info("Processed user data - username: " + username + ", email: " + email + 
                       ", phoneNumber: " + phoneNumber + ", userType: " + userType);

            User user = createUser(username, email, password, phoneNumber, userType, profilePicture);
            if (user != null) {
                sendJsonResponse(exchange, 201, user);
            } else {
                sendErrorResponse(exchange, 500, "Failed to create user");
            }
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error creating user", e);
            sendErrorResponse(exchange, 500, "Failed to create user: " + e.getMessage());
        }
    }

    private void handleUpdateUser(HttpExchange exchange, String userId) throws IOException {
        try {
            String requestBody = getRequestBody(exchange);
            Map<String, Object> userData = JsonUtil.fromJson(requestBody, Map.class);

            User user = updateUser(userId, userData);
            if (user != null) {
                sendJsonResponse(exchange, 200, user);
            } else {
                sendErrorResponse(exchange, 404, "User not found");
            }
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error updating user", e);
            sendErrorResponse(exchange, 500, "Failed to update user");
        }
    }

    private void handleDeleteUser(HttpExchange exchange, String userId) throws IOException {
        try {
            boolean deleted = deleteUser(userId);
            if (deleted) {
                exchange.sendResponseHeaders(204, -1);
            } else {
                sendErrorResponse(exchange, 404, "User not found");
            }
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error deleting user", e);
            sendErrorResponse(exchange, 500, "Failed to delete user");
        }
    }

    private List<User> getAllUsers() throws SQLException {
        List<User> users = new ArrayList<>();
        String sql = "SELECT userId, username, userEmail, phoneNumber, userType, profilePicture, createdAt, updatedAt FROM users";
        
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            
            while (rs.next()) {
                User user = new User();
                user.setUserId(rs.getString("userId"));
                user.setUsername(rs.getString("username"));
                user.setUserEmail(rs.getString("userEmail"));
                user.setPhoneNumber(rs.getString("phoneNumber"));
                user.setUserType(rs.getString("userType"));
                user.setProfilePicture(rs.getString("profilePicture"));
                
                // Handle date fields
                String createdAtStr = rs.getString("createdAt");
                if (createdAtStr != null) {
                    try {
                        user.setCreatedAt(java.time.LocalDateTime.parse(createdAtStr));
                    } catch (Exception e) {
                        LOGGER.warning("Could not parse createdAt: " + createdAtStr);
                    }
                }
                
                String updatedAtStr = rs.getString("updatedAt");
                if (updatedAtStr != null) {
                    try {
                        user.setUpdatedAt(java.time.LocalDateTime.parse(updatedAtStr));
                    } catch (Exception e) {
                        LOGGER.warning("Could not parse updatedAt: " + updatedAtStr);
                    }
                }
                
                users.add(user);
            }
        }
        return users;
    }

    private User getUserById(String userId) throws SQLException {
        String sql = "SELECT * FROM users WHERE userId = ?";
        
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, userId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    User user = new User();
                    user.setUserId(rs.getString("userId"));
                    user.setUsername(rs.getString("username"));
                    user.setUserEmail(rs.getString("userEmail"));
                    user.setUserType(rs.getString("userType"));
                    return user;
                }
            }
        }
        return null;
    }

    private User createUser(String username, String email, String password, String phoneNumber, String userType, String profilePicture) throws SQLException {
        String sql = "INSERT INTO users (userId, username, userEmail, password, phoneNumber, userType, profilePicture, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            
            String userId = "user_" + System.currentTimeMillis();
            String currentTime = java.time.LocalDateTime.now().toString();
            
            stmt.setString(1, userId);
            stmt.setString(2, username);
            stmt.setString(3, email);
            stmt.setString(4, password);
            stmt.setString(5, phoneNumber);
            stmt.setString(6, userType);
            stmt.setString(7, profilePicture);
            stmt.setString(8, currentTime);
            stmt.setString(9, currentTime);
            
            int affectedRows = stmt.executeUpdate();
            if (affectedRows > 0) {
                User user = new User();
                user.setUserId(userId);
                user.setUsername(username);
                user.setUserEmail(email);
                user.setUserType(userType);
                user.setPhoneNumber(phoneNumber);
                user.setProfilePicture(profilePicture);
                user.setCreatedAt(java.time.LocalDateTime.parse(currentTime));
                user.setUpdatedAt(java.time.LocalDateTime.parse(currentTime));
                return user;
            }
        }
        return null;
    }

    private User updateUser(String userId, Map<String, Object> userData) throws SQLException {
        StringBuilder sql = new StringBuilder("UPDATE users SET ");
        List<Object> params = new ArrayList<>();
        
        if (userData.containsKey("username")) {
            sql.append("username = ?, ");
            params.add(userData.get("username"));
        }
        if (userData.containsKey("email")) {
            sql.append("userEmail = ?, ");
            params.add(userData.get("email"));
        }
        if (userData.containsKey("userType")) {
            sql.append("userType = ?, ");
            params.add(userData.get("userType"));
        }
        
        if (params.isEmpty()) {
            return getUserById(userId);
        }
        
        sql.setLength(sql.length() - 2); // Remove last ", "
        sql.append(" WHERE userId = ?");
        params.add(userId);
        
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql.toString())) {
            
            for (int i = 0; i < params.size(); i++) {
                stmt.setObject(i + 1, params.get(i));
            }
            
            int affectedRows = stmt.executeUpdate();
            if (affectedRows > 0) {
                return getUserById(userId);
            }
        }
        return null;
    }

    private boolean deleteUser(String userId) throws SQLException {
        String sql = "DELETE FROM users WHERE userId = ?";
        
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, userId);
            int affectedRows = stmt.executeUpdate();
            return affectedRows > 0;
        }
    }

    private void handleTestUsersDatabase(HttpExchange exchange) throws IOException {
        try {
            LOGGER.info("=== TEST USERS DATABASE ===");
            
            Map<String, Object> response = new HashMap<>();
            List<Map<String, Object>> tableInfo = new ArrayList<>();
            
            try (Connection conn = DatabaseConfig.getConnection()) {
                // Check if users table exists
                try (Statement stmt = conn.createStatement()) {
                    try (ResultSet rs = stmt.executeQuery("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")) {
                        if (rs.next()) {
                            response.put("usersTable", "EXISTS");
                            
                            // Check users table structure
                            try (ResultSet schemaRs = stmt.executeQuery("PRAGMA table_info(users)")) {
                                while (schemaRs.next()) {
                                    Map<String, Object> column = new HashMap<>();
                                    column.put("name", schemaRs.getString("name"));
                                    column.put("type", schemaRs.getString("type"));
                                    column.put("notNull", schemaRs.getInt("notnull"));
                                    column.put("defaultValue", schemaRs.getString("dflt_value"));
                                    tableInfo.add(column);
                                }
                            }
                            
                            // Check users table count
                            try (ResultSet countRs = stmt.executeQuery("SELECT COUNT(*) as count FROM users")) {
                                if (countRs.next()) {
                                    response.put("usersCount", countRs.getInt("count"));
                                }
                            }
                            
                            // Check sample user data
                            try (ResultSet sampleRs = stmt.executeQuery("SELECT userId, username, userEmail, userType FROM users LIMIT 3")) {
                                List<Map<String, Object>> sampleUsers = new ArrayList<>();
                                while (sampleRs.next()) {
                                    Map<String, Object> user = new HashMap<>();
                                    user.put("userId", sampleRs.getString("userId"));
                                    user.put("username", sampleRs.getString("username"));
                                    user.put("userEmail", sampleRs.getString("userEmail"));
                                    user.put("userType", sampleRs.getString("userType"));
                                    sampleUsers.add(user);
                                }
                                response.put("sampleUsers", sampleUsers);
                            }
                            
                        } else {
                            response.put("usersTable", "NOT_EXISTS");
                        }
                    }
                }
                
                response.put("message", "Users database test completed");
                response.put("tableStructure", tableInfo);
                sendJsonResponse(exchange, 200, response);
                
            } catch (SQLException e) {
                LOGGER.severe("Database connection failed: " + e.getMessage());
                response.put("error", "Database connection failed: " + e.getMessage());
                response.put("sqlState", e.getSQLState());
                response.put("errorCode", e.getErrorCode());
                sendJsonResponse(exchange, 500, response);
            }
            
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error testing users database", e);
            sendErrorResponse(exchange, 500, "Failed to test users database: " + e.getMessage());
        }
    }

    private void setCorsHeaders(HttpExchange exchange) {
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type, Authorization");
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
        Map<String, String> error = Map.of("error", message);
        sendJsonResponse(exchange, statusCode, error);
    }
}
