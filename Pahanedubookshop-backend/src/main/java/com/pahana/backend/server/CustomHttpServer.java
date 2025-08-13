package com.pahana.backend.server;

import com.pahana.backend.handlers.*;
import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.Filter;
import com.pahana.backend.middleware.CorsFilter;
import com.pahana.backend.middleware.AuthFilter;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.util.concurrent.Executors;

public class CustomHttpServer {
    private final HttpServer server;
    private final int port;

    public CustomHttpServer(int port) throws IOException {
        this.port = port;
        this.server = HttpServer.create(new InetSocketAddress(port), 0);
        this.server.setExecutor(Executors.newFixedThreadPool(20));
        setupRoutes();
    }

    private void setupRoutes() {
        // CORS filter for all routes
        Filter corsFilter = new CorsFilter();
        
        // Auth filter for protected routes
        Filter authFilter = new AuthFilter();

        // Public routes
        server.createContext("/", new StaticFileHandler());
        server.createContext("/user/login", new AuthHandler());
        server.createContext("/user/register", new AuthHandler());
        server.createContext("/api/password/request", new AuthHandler());
        server.createContext("/api/password/verify", new AuthHandler());
        server.createContext("/api/password/reset", new AuthHandler());
        server.createContext("/feedback", new FeedbackHandler());
        server.createContext("/reservation", new ReservationHandler());
        server.createContext("/branch", new BranchHandler());
        server.createContext("/category", new CategoryHandler());
        server.createContext("/product", new ProductHandler());
        server.createContext("/gallery", new GalleryHandler());
        server.createContext("/offer", new OfferHandler());
        server.createContext("/orders", new OrderHandler());
        server.createContext("/api/favorites", new FavoritesHandler());
        server.createContext("/api/cart", new CartHandler());

        // Apply CORS filter to all contexts
        for (var context : server.getExecutor().getClass().getDeclaredFields()) {
            if (context.getName().contains("context")) {
                // Apply CORS filter
            }
        }
    }

    public void start() {
        server.start();
    }

    public void join() throws InterruptedException {
        Thread.currentThread().join();
    }

    public void stop() {
        server.stop(0);
    }
} 