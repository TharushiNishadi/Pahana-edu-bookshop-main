package com.pahana.backend.handlers;

import com.pahana.backend.config.DatabaseConfig;
import com.pahana.backend.models.User;
import com.pahana.backend.utils.JsonUtil;
import com.pahana.backend.utils.JwtUtil;
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

public class AuthHandler implements HttpHandler {
    private static final Logger LOGGER = Logger.getLogger(AuthHandler.class.getName());

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        try {
            String path = exchange.getRequestURI().getPath();
            String method = exchange.getRequestMethod();

            // Set CORS headers
            setCorsHeaders(exchange);

            if ("OPTIONS".equals(method)) {
                exchange.sendResponseHeaders(200, -1);
                return;
            }

            switch (path) {
                case "/user/login":
                    handleLogin(exchange);
                    break;
                case "/user/register":
                    handleRegister(exchange);
                    break;
                case "/api/password/request":
                    handlePasswordRequest(exchange);
                    break;
                case "/api/password/verify":
                    handlePasswordVerify(exchange);
                    break;
                case "/api/password/reset":
                    handlePasswordReset(exchange);
                    break;
                default:
                    sendErrorResponse(exchange, 404, "Endpoint not found");
            }
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error handling auth request", e);
            sendErrorResponse(exchange, 500, "Internal server error");
        }
    }

    private void handleLogin(HttpExchange exchange) throws IOException {
        if (!"POST".equals(exchange.getRequestMethod())) {
            sendErrorResponse(exchange, 405, "Method not allowed");
            return;
        }

        try {
            String requestBody = getRequestBody(exchange);
            Map<String, Object> loginData = JsonUtil.fromJson(requestBody, Map.class);

            String userEmail = (String) loginData.get("userEmail");
            String password = (String) loginData.get("password");

            if (userEmail == null || password == null) {
                sendErrorResponse(exchange, 400, "Email and password are required");
                return;
            }

            User user = authenticateUser(userEmail, password);
            if (user != null) {
                String token = JwtUtil.generateToken(user.getUserId(), user.getUserType());
                
                Map<String, Object> response = new HashMap<>();
                response.put("token", token);
                response.put("user", user);
                response.put("message", "Login successful");

                sendJsonResponse(exchange, 200, response);
            } else {
                sendErrorResponse(exchange, 401, "Invalid email or password");
            }
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error during login", e);
            sendErrorResponse(exchange, 500, "Login failed");
        }
    }

    private void handleRegister(HttpExchange exchange) throws IOException {
        if (!"POST".equals(exchange.getRequestMethod())) {
            sendErrorResponse(exchange, 405, "Method not allowed");
            return;
        }

        try {
            String requestBody = getRequestBody(exchange);
            Map<String, Object> registerData = JsonUtil.fromJson(requestBody, Map.class);

            String userEmail = (String) registerData.get("userEmail");
            String username = (String) registerData.get("username");
            String password = (String) registerData.get("password");
            String phoneNumber = (String) registerData.get("phoneNumber");
            String userType = (String) registerData.get("userType");

            if (userEmail == null || username == null || password == null || phoneNumber == null) {
                sendErrorResponse(exchange, 400, "All fields are required");
                return;
            }

            if (userExists(userEmail)) {
                sendErrorResponse(exchange, 409, "User with this email already exists");
                return;
            }

            User user = createUser(userEmail, username, password, phoneNumber, userType);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Registration successful");
            response.put("user", user);

            sendJsonResponse(exchange, 201, response);
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error during registration", e);
            sendErrorResponse(exchange, 500, "Registration failed");
        }
    }

    private void handlePasswordRequest(HttpExchange exchange) throws IOException {
        if (!"POST".equals(exchange.getRequestMethod())) {
            sendErrorResponse(exchange, 405, "Method not allowed");
            return;
        }

        try {
            String requestBody = getRequestBody(exchange);
            Map<String, Object> requestData = JsonUtil.fromJson(requestBody, Map.class);
            String email = (String) requestData.get("email");

            if (email == null) {
                sendErrorResponse(exchange, 400, "Email is required");
                return;
            }

            // In a real application, you would send a password reset email
            // For now, we'll just return a success message
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Password reset instructions sent to your email");

            sendJsonResponse(exchange, 200, response);
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error during password request", e);
            sendErrorResponse(exchange, 500, "Password reset request failed");
        }
    }

    private void handlePasswordVerify(HttpExchange exchange) throws IOException {
        if (!"POST".equals(exchange.getRequestMethod())) {
            sendErrorResponse(exchange, 405, "Method not allowed");
            return;
        }

        try {
            String requestBody = getRequestBody(exchange);
            Map<String, Object> requestData = JsonUtil.fromJson(requestBody, Map.class);
            String email = (String) requestData.get("email");
            String code = (String) requestData.get("code");

            if (email == null || code == null) {
                sendErrorResponse(exchange, 400, "Email and verification code are required");
                return;
            }

            // In a real application, you would verify the reset code
            // For now, we'll just return a success message
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Verification code is valid");

            sendJsonResponse(exchange, 200, response);
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error during password verification", e);
            sendErrorResponse(exchange, 500, "Password verification failed");
        }
    }

    private void handlePasswordReset(HttpExchange exchange) throws IOException {
        if (!"POST".equals(exchange.getRequestMethod())) {
            sendErrorResponse(exchange, 405, "Method not allowed");
            return;
        }

        try {
            String requestBody = getRequestBody(exchange);
            Map<String, Object> requestData = JsonUtil.fromJson(requestBody, Map.class);
            String email = (String) requestData.get("email");
            String newPassword = (String) requestData.get("newPassword");

            if (email == null || newPassword == null) {
                sendErrorResponse(exchange, 400, "Email and new password are required");
                return;
            }

            boolean updated = updatePassword(email, newPassword);
            if (updated) {
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Password updated successfully");

                sendJsonResponse(exchange, 200, response);
            } else {
                sendErrorResponse(exchange, 404, "User not found");
            }
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error during password reset", e);
            sendErrorResponse(exchange, 500, "Password reset failed");
        }
    }

    private User authenticateUser(String userEmail, String password) {
        String sql = "SELECT * FROM users WHERE userEmail = ? AND password = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, userEmail);
            stmt.setString(2, password);
            
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    User user = new User();
                    user.setUserId(rs.getString("userId"));
                    user.setUserEmail(rs.getString("userEmail"));
                    user.setUsername(rs.getString("username"));
                    user.setPhoneNumber(rs.getString("phoneNumber"));
                    user.setUserType(rs.getString("userType"));
                    user.setBranch(rs.getString("branch"));
                    user.setProfilePicture(rs.getString("profilePicture"));
                    return user;
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error authenticating user", e);
        }
        return null;
    }

    private boolean userExists(String userEmail) {
        String sql = "SELECT COUNT(*) FROM users WHERE userEmail = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, userEmail);
            
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1) > 0;
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error checking if user exists", e);
        }
        return false;
    }

    private User createUser(String userEmail, String username, String password, String phoneNumber, String userType) {
        String userId = "user_" + System.currentTimeMillis();
        String sql = "INSERT INTO users (userId, userEmail, username, password, phoneNumber, userType, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, userId);
            stmt.setString(2, userEmail);
            stmt.setString(3, username);
            stmt.setString(4, password);
            stmt.setString(5, phoneNumber);
            stmt.setString(6, userType);
            stmt.setString(7, LocalDateTime.now().toString());
            stmt.setString(8, LocalDateTime.now().toString());
            
            int affected = stmt.executeUpdate();
            if (affected > 0) {
                User user = new User();
                user.setUserId(userId);
                user.setUserEmail(userEmail);
                user.setUsername(username);
                user.setPhoneNumber(phoneNumber);
                user.setUserType(userType);
                return user;
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error creating user", e);
        }
        return null;
    }

    private boolean updatePassword(String email, String newPassword) {
        String sql = "UPDATE users SET password = ?, updatedAt = ? WHERE userEmail = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, newPassword);
            stmt.setString(2, LocalDateTime.now().toString());
            stmt.setString(3, email);
            
            int affected = stmt.executeUpdate();
            return affected > 0;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error updating password", e);
        }
        return false;
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