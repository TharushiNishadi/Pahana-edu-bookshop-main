package com.pahana.backend.handlers;

import com.pahana.backend.utils.JsonUtil;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.logging.Logger;
import java.util.logging.Level;

public class FeedbackHandler implements HttpHandler {
    private static final Logger LOGGER = Logger.getLogger(FeedbackHandler.class.getName());

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        try {
            String method = exchange.getRequestMethod();
            setCorsHeaders(exchange);

            if ("OPTIONS".equals(method)) {
                exchange.sendResponseHeaders(200, -1);
                return;
            }

            switch (method) {
                case "GET":
                    handleGetFeedbacks(exchange);
                    break;
                case "POST":
                    handleCreateFeedback(exchange);
                    break;
                default:
                    sendErrorResponse(exchange, 405, "Method not allowed");
            }
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error handling feedback request", e);
            sendErrorResponse(exchange, 500, "Internal server error");
        }
    }

    private void handleGetFeedbacks(HttpExchange exchange) throws IOException {
        // Return empty list for now
        List<Map<String, Object>> feedbacks = new ArrayList<>();
        sendJsonResponse(exchange, 200, feedbacks);
    }

    private void handleCreateFeedback(HttpExchange exchange) throws IOException {
        try {
            String requestBody = getRequestBody(exchange);
          //  Map<String, Object> feedbackData = JsonUtil.fromJson(requestBody, Map.class);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Feedback submitted successfully");
            sendJsonResponse(exchange, 201, response);
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error creating feedback", e);
            sendErrorResponse(exchange, 500, "Failed to create feedback");
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