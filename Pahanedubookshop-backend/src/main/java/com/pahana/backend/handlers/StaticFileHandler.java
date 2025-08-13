package com.pahana.backend.handlers;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

public class StaticFileHandler implements HttpHandler {
    @Override
    public void handle(HttpExchange exchange) throws IOException {
        String path = exchange.getRequestURI().getPath();
        
        if ("/".equals(path)) {
            // Return a simple welcome message
            String response = "Pahana Edu Bookshop Backend API is running!\n\n" +
                            "Available endpoints:\n" +
                            "- POST /user/login - User login\n" +
                            "- POST /user/register - User registration\n" +
                            "- GET /product - Get all products\n" +
                            "- GET /category - Get all categories\n" +
                            "- POST /feedback - Submit feedback\n" +
                            "- POST /reservation - Create reservation\n" +
                            "- GET /branch - Get all branches\n" +
                            "- GET /gallery - Get gallery images\n" +
                            "- GET /offer - Get offers\n" +
                            "- GET /orders - Get orders\n" +
                            "- GET /api/favorites - Get favorites\n" +
                            "- GET /api/cart - Get cart items";
            
            exchange.getResponseHeaders().add("Content-Type", "text/plain");
            exchange.sendResponseHeaders(200, response.getBytes(StandardCharsets.UTF_8).length);
            
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(response.getBytes(StandardCharsets.UTF_8));
            }
        } else {
            // Return 404 for other paths
            String response = "404 - Not Found";
            exchange.getResponseHeaders().add("Content-Type", "text/plain");
            exchange.sendResponseHeaders(404, response.getBytes(StandardCharsets.UTF_8).length);
            
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(response.getBytes(StandardCharsets.UTF_8));
            }
        }
    }
} 