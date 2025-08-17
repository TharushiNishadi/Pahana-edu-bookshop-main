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

    public CustomHttpServer(int port) throws IOException {
        this.server = HttpServer.create(new InetSocketAddress(port), 0);
        this.server.setExecutor(Executors.newFixedThreadPool(20));
        setupRoutes();
    }

    private void setupRoutes() {
        // CORS filter for all routes
        Filter corsFilter = new CorsFilter();
        
        // Auth filter for protected routes
        Filter authFilter = new AuthFilter();

        // Image and static file handling - MUST come before other routes
        server.createContext("/images", new StaticFileHandler());
        server.createContext("/static", new StaticFileHandler());
        
        // Test endpoints for image functionality
        server.createContext("/test-image-serving", new StaticFileHandler());
        server.createContext("/test-images-status", new StaticFileHandler());
        server.createContext("/test-create-image", new StaticFileHandler());

        // Public routes
        server.createContext("/user/login", new AuthHandler());
        server.createContext("/user/register", new AuthHandler());
        server.createContext("/api/password/request", new AuthHandler());
        server.createContext("/api/password/verify", new AuthHandler());
        server.createContext("/api/password/reset", new AuthHandler());
        server.createContext("/users", new UsersHandler());
        server.createContext("/test-users-db", new UsersHandler());
        server.createContext("/feedback", new FeedbackHandler());
        server.createContext("/reservation", new ReservationHandler());
        server.createContext("/branch", new BranchHandler());
        server.createContext("/category", new CategoryHandler());
        server.createContext("/test-category-db", new CategoryHandler());
        server.createContext("/product", new ProductHandler());
        server.createContext("/test-product-db", new ProductHandler());
        server.createContext("/gallery", new GalleryHandler());
        server.createContext("/test-gallery-db", new GalleryHandler());
        server.createContext("/test-gallery-update", new GalleryHandler());
        server.createContext("/offer", new OfferHandler());
        server.createContext("/test-offer-handler", new OfferHandler());
        server.createContext("/test-offers-db", new OfferHandler());
        server.createContext("/test-offer-ids", new OfferHandler());
        server.createContext("/test-branch", new BranchHandler());
        server.createContext("/orders", new OrderHandler());
        server.createContext("/test-orders", new OrderHandler());
        server.createContext("/test-create-order", new OrderHandler());
        server.createContext("/test-create-sample-order", new OrderHandler());
        server.createContext("/test-user-exists", new OrderHandler());
        server.createContext("/test-database", new OrderHandler());
        server.createContext("/api/favorites", new FavoritesHandler());
        server.createContext("/test-favorites", new FavoritesHandler());
        server.createContext("/api/cart", new CartHandler());

        // Root path handler for welcome message - MUST come LAST
        server.createContext("/", new StaticFileHandler());

        // Note: CORS filters are applied at the handler level, not at the context level
        // Each handler implements its own CORS headers as needed
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
