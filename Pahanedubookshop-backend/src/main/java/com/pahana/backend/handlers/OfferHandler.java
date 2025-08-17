package com.pahana.backend.handlers;

import com.pahana.backend.config.DatabaseConfig;
import com.pahana.backend.models.Offer;
import com.pahana.backend.utils.JsonUtil;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.sql.*;
import java.time.LocalDateTime;
import java.util.*;
import java.util.logging.Logger;
import java.util.logging.Level;

public class OfferHandler implements HttpHandler {
    private static final Logger LOGGER = Logger.getLogger(OfferHandler.class.getName());

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

            if (path.startsWith("/offer/")) {
                String offerId = path.substring("/offer/".length());
                
                // Check if it's the test endpoint
                if ("test-db".equals(offerId)) {
                    if ("GET".equals(method)) {
                        handleTestOfferDatabase(exchange);
                    } else {
                        sendErrorResponse(exchange, 405, "Method not allowed");
                    }
                    return;
                }
                
                switch (method) {
                    case "GET":
                        handleGetOfferById(exchange, offerId);
                        break;
                    case "PUT":
                        handleUpdateOffer(exchange, offerId);
                        break;
                    case "DELETE":
                        handleDeleteOffer(exchange, offerId);
                        break;
                    default:
                        sendErrorResponse(exchange, 405, "Method not allowed");
                }
            } else if ("/offer".equals(path)) {
                switch (method) {
                    case "GET":
                        handleGetAllOffers(exchange);
                        break;
                    case "POST":
                        handleCreateOffer(exchange);
                        break;
                    default:
                        sendErrorResponse(exchange, 405, "Method not allowed");
                }
            } else if ("/test-offer-handler".equals(path)) {
                // Simple test endpoint to verify handler is working
                if ("GET".equals(method)) {
                    Map<String, Object> response = new HashMap<>();
                    response.put("message", "OfferHandler is working!");
                    response.put("timestamp", LocalDateTime.now().toString());
                    sendJsonResponse(exchange, 200, response);
                } else {
                    sendErrorResponse(exchange, 405, "Method not allowed");
                }
            } else if ("/test-offers-db".equals(path)) {
                // Test endpoint to check offers database
                if ("GET".equals(method)) {
                    handleTestOffersDatabase(exchange);
                } else {
                    sendErrorResponse(exchange, 405, "Method not allowed");
                }
            } else if ("/test-offer-ids".equals(path)) {
                // Test endpoint to check offer IDs and help debug "Offer not found" issues
                if ("GET".equals(method)) {
                    handleTestOfferIds(exchange);
                } else {
                    sendErrorResponse(exchange, 405, "Method not allowed");
                }
            } else {
                sendErrorResponse(exchange, 404, "Endpoint not found");
            }
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error handling offer request", e);
            sendErrorResponse(exchange, 500, "Internal server error");
        }
    }

    private void handleGetAllOffers(HttpExchange exchange) throws IOException {
        try {
            List<Offer> offers = getAllOffers();
            sendJsonResponse(exchange, 200, offers);
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error getting all offers", e);
            sendErrorResponse(exchange, 500, "Failed to get offers");
        }
    }

    private void handleGetOfferById(HttpExchange exchange, String offerId) throws IOException {
        try {
            Offer offer = getOfferById(offerId);
            if (offer != null) {
                sendJsonResponse(exchange, 200, offer);
            } else {
                sendErrorResponse(exchange, 404, "Offer not found");
            }
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error getting offer by ID", e);
            sendErrorResponse(exchange, 500, "Failed to get offer");
        }
    }

    private void handleCreateOffer(HttpExchange exchange) throws IOException {
        try {
            LOGGER.info("=== CREATE OFFER REQUEST ===");
            LOGGER.info("Request method: " + exchange.getRequestMethod());
            LOGGER.info("Request path: " + exchange.getRequestURI().getPath());
            
            // Check if it's multipart form data
            String contentType = exchange.getRequestHeaders().getFirst("Content-Type");
            LOGGER.info("Content-Type: " + contentType);
            
            if (contentType != null && contentType.startsWith("multipart/form-data")) {
                LOGGER.info("Handling as multipart form data");
                handleMultipartOffer(exchange);
            } else {
                LOGGER.info("Handling as JSON data");
                // Handle JSON request (fallback)
                handleJsonOffer(exchange);
            }
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error creating offer", e);
            sendErrorResponse(exchange, 500, "Failed to create offer");
        }
    }

    private void handleMultipartOffer(HttpExchange exchange) throws IOException {
        try {
            LOGGER.info("=== HANDLING MULTIPART OFFER ===");
            String contentType = exchange.getRequestHeaders().getFirst("Content-Type");
            String boundary = extractBoundary(contentType);
            LOGGER.info("Boundary: " + boundary);
            
            if (boundary == null) {
                LOGGER.warning("Invalid multipart boundary");
                sendErrorResponse(exchange, 400, "Invalid multipart boundary");
                return;
            }

            Map<String, String> formData = parseMultipartData(exchange.getRequestBody(), boundary);
            LOGGER.info("Parsed form data: " + formData);
            
            String offerTitle = formData.get("offerName");
            String offerDescription = formData.get("offerDescription");
            String offerValue = formData.get("offerValue");
            String offerImage = formData.get("offerImage");

            if (offerTitle == null || offerTitle.trim().isEmpty()) {
                sendErrorResponse(exchange, 400, "Offer name is required");
                return;
            }

            if (offerDescription == null || offerDescription.trim().isEmpty()) {
                sendErrorResponse(exchange, 400, "Offer description is required");
                return;
            }

            if (offerValue == null || offerValue.trim().isEmpty()) {
                sendErrorResponse(exchange, 400, "Offer value is required");
                return;
            }

            // For now, we'll store the image filename/path as a string
            String imagePath = offerImage != null ? offerImage : "";

            Offer offer = createOffer(offerTitle, offerDescription, offerValue, imagePath);
            if (offer != null) {
                sendJsonResponse(exchange, 201, offer);
            } else {
                sendErrorResponse(exchange, 500, "Failed to create offer");
            }
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error handling multipart offer", e);
            sendErrorResponse(exchange, 500, "Failed to create offer");
        }
    }

    private void handleJsonOffer(HttpExchange exchange) throws IOException {
        try {
            String requestBody = getRequestBody(exchange);
            Map<String, Object> offerData = JsonUtil.fromJson(requestBody, Map.class);

            String offerTitle = (String) offerData.get("offerName");
            String offerDescription = (String) offerData.get("offerDescription");
            String offerValue = (String) offerData.get("offerValue");

            if (offerTitle == null || offerTitle.trim().isEmpty()) {
                sendErrorResponse(exchange, 400, "Offer name is required");
                return;
            }

            if (offerDescription == null || offerDescription.trim().isEmpty()) {
                sendErrorResponse(exchange, 400, "Offer description is required");
                return;
            }

            if (offerValue == null || offerValue.trim().isEmpty()) {
                sendErrorResponse(exchange, 400, "Offer value is required");
                return;
            }

            Offer offer = createOffer(offerTitle, offerDescription, offerValue, "");
            if (offer != null) {
                sendJsonResponse(exchange, 201, offer);
            } else {
                sendErrorResponse(exchange, 500, "Failed to create offer");
            }
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error creating offer from JSON", e);
            sendErrorResponse(exchange, 500, "Failed to create offer");
        }
    }

    private void handleUpdateOffer(HttpExchange exchange, String offerId) throws IOException {
        try {
            String contentType = exchange.getRequestHeaders().getFirst("Content-Type");
            LOGGER.info("Content-Type: " + contentType);
            
            Map<String, Object> offerData = new HashMap<>();
            
            if (contentType != null && contentType.startsWith("multipart/form-data")) {
                // Handle multipart form data
                LOGGER.info("Processing multipart form data");
                String boundary = extractBoundary(contentType);
                if (boundary != null) {
                    Map<String, String> multipartData = parseMultipartData(exchange.getRequestBody(), boundary);
                    // Convert Map<String, String> to Map<String, Object>
                    offerData = new HashMap<>();
                    for (Map.Entry<String, String> entry : multipartData.entrySet()) {
                        offerData.put(entry.getKey(), entry.getValue());
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
                
                offerData = JsonUtil.fromJson(requestBody, Map.class);
            }
            
            LOGGER.info("Parsed offer data: " + offerData);
            
            if (offerData == null || offerData.isEmpty()) {
                LOGGER.warning("No valid offer data received");
                sendErrorResponse(exchange, 400, "No valid offer data provided");
                return;
            }

            // Check if offer exists first
            Offer existingOffer = getOfferById(offerId);
            if (existingOffer == null) {
                LOGGER.warning("Offer not found with ID: " + offerId);
                sendErrorResponse(exchange, 404, "Offer not found");
                return;
            }
            LOGGER.info("Found existing offer: " + existingOffer.getOfferTitle());

            boolean updated = updateOffer(offerId, offerData);
            if (updated) {
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Offer updated successfully");
                response.put("offerId", offerId);
                sendJsonResponse(exchange, 200, response);
            } else {
                LOGGER.warning("Offer update failed - no changes made or database error");
                sendErrorResponse(exchange, 500, "Failed to update offer. Please check the data and try again.");
            }
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error updating offer", e);
            String errorMessage = "Failed to update offer";
            if (e.getMessage() != null) {
                errorMessage += ": " + e.getMessage();
            }
            sendErrorResponse(exchange, 500, errorMessage);
        }
    }

    private void handleDeleteOffer(HttpExchange exchange, String offerId) throws IOException {
        try {
            boolean deleted = deleteOffer(offerId);
            if (deleted) {
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Offer deleted successfully");
                sendJsonResponse(exchange, 200, response);
            } else {
                sendErrorResponse(exchange, 404, "Offer not found");
            }
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error deleting offer", e);
            sendErrorResponse(exchange, 500, "Failed to delete offer");
        }
    }

    private List<Offer> getAllOffers() {
        List<Offer> offers = new ArrayList<>();
        String sql = "SELECT * FROM offers ORDER BY createdAt DESC";
        
        LOGGER.info("=== FETCHING ALL OFFERS ===");
        LOGGER.info("SQL Query: " + sql);
        
        try (Connection conn = DatabaseConfig.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            
            LOGGER.info("Database connection successful, executing query...");
            int count = 0;
            
            while (rs.next()) {
                count++;
                LOGGER.info("Processing offer row " + count);
                
                try {
                    Offer offer = mapResultSetToOffer(rs);
                    offers.add(offer);
                    LOGGER.info("Successfully mapped offer: " + offer.getOfferTitle());
                } catch (Exception e) {
                    LOGGER.log(Level.SEVERE, "Error mapping offer row " + count, e);
                }
            }
            
            LOGGER.info("Total offers found: " + count);
            LOGGER.info("Successfully mapped offers: " + offers.size());
            
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error getting all offers", e);
            LOGGER.log(Level.SEVERE, "SQL State: " + e.getSQLState());
            LOGGER.log(Level.SEVERE, "Error Code: " + e.getErrorCode());
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Unexpected error getting all offers", e);
        }
        
        return offers;
    }

    private Offer getOfferById(String offerId) {
        String sql = "SELECT * FROM offers WHERE offerId = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, offerId);
            
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return mapResultSetToOffer(rs);
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error getting offer by ID", e);
        }
        return null;
    }

    private Offer createOffer(String offerTitle, String offerDescription, String offerValue, String offerImage) {
        LOGGER.info("=== CREATING OFFER IN DATABASE ===");
        LOGGER.info("offerTitle: " + offerTitle);
        LOGGER.info("offerDescription: " + offerDescription);
        LOGGER.info("offerValue: " + offerValue);
        LOGGER.info("offerImage: " + offerImage);
        
        String offerId = "off_" + System.currentTimeMillis();
        String sql = "INSERT INTO offers (offerId, offerTitle, offerDescription, offerValue, offerImage, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        LOGGER.info("SQL: " + sql);
        
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, offerId);
            stmt.setString(2, offerTitle);
            stmt.setString(3, offerDescription);
            stmt.setString(4, offerValue);
            stmt.setString(5, offerImage);
            stmt.setBoolean(6, true);
            stmt.setString(7, LocalDateTime.now().toString());
            stmt.setString(8, LocalDateTime.now().toString());
            
            LOGGER.info("Executing SQL with parameters: [" + offerId + ", " + offerTitle + ", " + offerDescription + ", " + offerValue + ", " + offerImage + ", true, " + LocalDateTime.now().toString() + ", " + LocalDateTime.now().toString() + "]");
            
            int affected = stmt.executeUpdate();
            LOGGER.info("Rows affected: " + affected);
            
            if (affected > 0) {
                Offer offer = new Offer();
                offer.setOfferId(offerId);
                offer.setOfferTitle(offerTitle);
                offer.setOfferDescription(offerDescription);
                offer.setOfferValue(offerValue);
                offer.setOfferImage(offerImage);
                offer.setActive(true);
                LOGGER.info("Offer created successfully: " + offerId);
                return offer;
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error creating offer", e);
            LOGGER.severe("SQL State: " + e.getSQLState());
            LOGGER.severe("Error Code: " + e.getErrorCode());
            LOGGER.severe("Error Message: " + e.getMessage());
        }
        return null;
    }

    private boolean updateOffer(String offerId, Map<String, Object> offerData) {
        StringBuilder sql = new StringBuilder("UPDATE offers SET ");
        List<Object> params = new ArrayList<>();
        
        LOGGER.info("Updating offer with ID: " + offerId);
        LOGGER.info("Update data: " + offerData);
        
        if (offerData.containsKey("offerName")) {
            sql.append("offerTitle = ?, ");
            params.add(offerData.get("offerName"));
            LOGGER.info("Adding offerTitle to update");
        }
        if (offerData.containsKey("offerDescription")) {
            sql.append("offerDescription = ?, ");
            params.add(offerData.get("offerDescription"));
            LOGGER.info("Adding offerDescription to update");
        }
        if (offerData.containsKey("offerValue")) {
            sql.append("offerValue = ?, ");
            params.add(offerData.get("offerValue"));
            LOGGER.info("Adding offerValue to update");
        }
        if (offerData.containsKey("offerImage")) {
            sql.append("offerImage = ?, ");
            params.add(offerData.get("offerImage"));
            LOGGER.info("Adding offerImage to update");
        }
        if (offerData.containsKey("isActive")) {
            sql.append("isActive = ?, ");
            params.add(offerData.get("isActive"));
            LOGGER.info("Adding isActive to update");
        }
        
        // Check if there are any fields to update
        if (params.isEmpty()) {
            LOGGER.warning("No fields provided for update");
            return false;
        }
        
        // Remove trailing comma
        sql.setLength(sql.length() - 2); // Remove ", " from the end
        
        sql.append(", updatedAt = ? WHERE offerId = ?");
        params.add(LocalDateTime.now().toString());
        params.add(offerId);
        
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
                LOGGER.info("Offer updated successfully");
                return true;
            } else {
                LOGGER.warning("No rows affected during update");
                return false;
            }
            
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error updating offer", e);
            LOGGER.severe("SQL State: " + e.getSQLState());
            LOGGER.severe("Error Code: " + e.getErrorCode());
            LOGGER.severe("Error Message: " + e.getMessage());
            return false;
        }
    }

    private boolean deleteOffer(String offerId) {
        String sql = "DELETE FROM offers WHERE offerId = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, offerId);
            
            int affected = stmt.executeUpdate();
            return affected > 0;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error deleting offer", e);
        }
        return false;
    }

    private Offer mapResultSetToOffer(ResultSet rs) throws SQLException {
        LOGGER.info("=== MAPPING OFFER FROM RESULT SET ===");
        
        Offer offer = new Offer();
        
        // Log each field as we retrieve it
        String offerId = rs.getString("offerId");
        LOGGER.info("offerId: " + offerId);
        offer.setOfferId(offerId);
        
        String offerTitle = rs.getString("offerTitle");
        LOGGER.info("offerTitle: " + offerTitle);
        offer.setOfferTitle(offerTitle);
        
        String offerDescription = rs.getString("offerDescription");
        LOGGER.info("offerDescription: " + offerDescription);
        offer.setOfferDescription(offerDescription);
        
        String offerValue = rs.getString("offerValue");
        LOGGER.info("offerValue: " + offerValue);
        offer.setOfferValue(offerValue);
        
        String offerImage = rs.getString("offerImage");
        LOGGER.info("offerImage: " + offerImage);
        offer.setOfferImage(offerImage);
        
        boolean isActive = rs.getBoolean("isActive");
        LOGGER.info("isActive: " + isActive);
        offer.setActive(isActive);
        
        // Handle nullable date fields
        String createdAtStr = rs.getString("createdAt");
        LOGGER.info("createdAt (raw): " + createdAtStr);
        if (createdAtStr != null) {
            try {
                LocalDateTime createdAt = LocalDateTime.parse(createdAtStr);
                offer.setCreatedAt(createdAt);
                LOGGER.info("createdAt (parsed): " + createdAt);
            } catch (Exception e) {
                LOGGER.warning("Could not parse createdAt: " + createdAtStr + ", error: " + e.getMessage());
            }
        }
        
        String updatedAtStr = rs.getString("updatedAt");
        LOGGER.info("updatedAt (raw): " + updatedAtStr);
        if (updatedAtStr != null) {
            try {
                LocalDateTime updatedAt = LocalDateTime.parse(updatedAtStr);
                offer.setUpdatedAt(updatedAt);
                LOGGER.info("updatedAt (parsed): " + updatedAt);
            } catch (Exception e) {
                LOGGER.warning("Could not parse updatedAt: " + updatedAtStr + ", error: " + e.getMessage());
            }
        }
        
        LOGGER.info("Offer mapping completed successfully");
        return offer;
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
        
        BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8));
        String line;
        String currentField = null;
        StringBuilder currentValue = new StringBuilder();
        boolean inData = false;
        boolean isFile = false;
        
        while ((line = reader.readLine()) != null) {
            if (line.startsWith(boundaryLine)) {
                // Save previous field if exists
                if (currentField != null && currentValue.length() > 0) {
                    formData.put(currentField, currentValue.toString().trim());
                }
                currentField = null;
                currentValue.setLength(0);
                inData = false;
                isFile = false;
                continue;
            }
            
            if (line.equals(endBoundary)) {
                // Save last field
                if (currentField != null && currentValue.length() > 0) {
                    formData.put(currentField, currentValue.toString().trim());
                }
                break;
            }
            
            if (line.startsWith("Content-Disposition:")) {
                // Extract field name
                if (line.contains("name=\"")) {
                    int start = line.indexOf("name=\"") + 6;
                    int end = line.indexOf("\"", start);
                    if (end > start) {
                        currentField = line.substring(start, end);
                    }
                }
                
                // Check if it's a file
                if (line.contains("filename=")) {
                    isFile = true;
                }
                continue;
            }
            
            if (line.isEmpty() && currentField != null) {
                inData = true;
                continue;
            }
            
            if (inData && currentField != null) {
                if (isFile) {
                    // For files, just store the filename for now
                    if (currentValue.length() == 0) {
                        currentValue.append("uploaded_offer_image.jpg");
                    }
                } else {
                    if (currentValue.length() > 0) {
                        currentValue.append("\n");
                    }
                    currentValue.append(line);
                }
            }
        }
        
        return formData;
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

    private void handleTestOfferDatabase(HttpExchange exchange) throws IOException {
        try {
            Map<String, Object> result = new HashMap<>();
            
            // Test if new columns exist
            try (Connection conn = DatabaseConfig.getConnection();
                 Statement stmt = conn.createStatement()) {
                
                // Test offers table structure
                try {
                    stmt.execute("SELECT offerValue, updatedAt FROM offers LIMIT 1");
                    result.put("offers_table", "✅ All new columns exist");
                } catch (SQLException e) {
                    result.put("offers_table", "❌ Missing columns: " + e.getMessage());
                }
                
                // Get table info
                try (ResultSet rs = stmt.executeQuery("PRAGMA table_info(offers)")) {
                    List<String> columns = new ArrayList<>();
                    while (rs.next()) {
                        columns.add(rs.getString("name"));
                    }
                    result.put("offers_columns", columns);
                }
                
            }
            
            sendJsonResponse(exchange, 200, result);
            
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error testing offer database", e);
            sendErrorResponse(exchange, 500, "Failed to test offer database: " + e.getMessage());
        }
    }

    private void handleTestOffersDatabase(HttpExchange exchange) throws IOException {
        try {
            Map<String, Object> result = new HashMap<>();
            
            // Test if offers table exists
            try (Connection conn = DatabaseConfig.getConnection();
                 Statement stmt = conn.createStatement()) {
                
                try {
                    stmt.execute("SELECT offerId FROM offers LIMIT 1");
                    result.put("offers_table_exists", "✅ Offers table exists");
                } catch (SQLException e) {
                    result.put("offers_table_exists", "❌ Offers table does not exist: " + e.getMessage());
                }
                
                // Get table info
                try (ResultSet rs = stmt.executeQuery("PRAGMA table_info(offers)")) {
                    List<String> columns = new ArrayList<>();
                    while (rs.next()) {
                        columns.add(rs.getString("name"));
                    }
                    result.put("offers_columns", columns);
                }
                
                // Get some sample data
                try (ResultSet rs = stmt.executeQuery("SELECT offerId, offerTitle, offerDescription, offerValue, offerImage, isActive, createdAt, updatedAt FROM offers LIMIT 5")) {
                    List<Map<String, Object>> sampleData = new ArrayList<>();
                    while (rs.next()) {
                        Map<String, Object> row = new HashMap<>();
                        row.put("offerId", rs.getString("offerId"));
                        row.put("offerTitle", rs.getString("offerTitle"));
                        row.put("offerDescription", rs.getString("offerDescription"));
                        row.put("offerValue", rs.getString("offerValue"));
                        row.put("offerImage", rs.getString("offerImage"));
                        row.put("isActive", rs.getBoolean("isActive"));
                        row.put("createdAt", rs.getString("createdAt"));
                        row.put("updatedAt", rs.getString("updatedAt"));
                        sampleData.add(row);
                    }
                    result.put("sample_data", sampleData);
                }
                
            }
            
            sendJsonResponse(exchange, 200, result);
            
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error testing offers database", e);
            sendErrorResponse(exchange, 500, "Failed to test offers database: " + e.getMessage());
        }
    }

    private void handleTestOfferIds(HttpExchange exchange) throws IOException {
        try {
            Map<String, Object> result = new HashMap<>();
            
            // Test if offers table exists
            try (Connection conn = DatabaseConfig.getConnection();
                 Statement stmt = conn.createStatement()) {
                
                try {
                    stmt.execute("SELECT offerId FROM offers LIMIT 10"); // Get a few offer IDs
                    result.put("offers_table_exists", "✅ Offers table exists");
                } catch (SQLException e) {
                    result.put("offers_table_exists", "❌ Offers table does not exist: " + e.getMessage());
                }
                
                // Get some sample offer IDs
                try (ResultSet rs = stmt.executeQuery("SELECT offerId FROM offers LIMIT 10")) {
                    List<String> offerIds = new ArrayList<>();
                    while (rs.next()) {
                        offerIds.add(rs.getString("offerId"));
                    }
                    result.put("sample_offer_ids", offerIds);
                }
                
            }
            
            sendJsonResponse(exchange, 200, result);
            
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error testing offer IDs", e);
            sendErrorResponse(exchange, 500, "Failed to test offer IDs: " + e.getMessage());
        }
    }

    private void setCorsHeaders(HttpExchange exchange) {
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }
} 