package com.pahana.backend;

import com.pahana.backend.server.CustomHttpServer;
import com.pahana.backend.config.DatabaseConfig;
import com.pahana.backend.utils.JwtUtil;

public class Main {
    public static void main(String[] args) {
        try {
            // Initialize database
            DatabaseConfig.initializeDatabase();
            
            // Initialize JWT utility
            JwtUtil.initialize();
            
            // Start HTTP server
            CustomHttpServer server = new CustomHttpServer(12345);
            server.start();
            
            System.out.println("Pahana Edu Bookshop Backend Server started on port 12345");
            System.out.println("Press Ctrl+C to stop the server");
            
            // Keep the server running
            server.join();
            
        } catch (Exception e) {
            System.err.println("Error starting server: " + e.getMessage());
            e.printStackTrace();
        }
    }
} 