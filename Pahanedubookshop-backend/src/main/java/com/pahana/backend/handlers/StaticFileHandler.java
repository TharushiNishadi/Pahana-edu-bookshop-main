package com.pahana.backend.handlers;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.IOException;
import java.io.OutputStream;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.File;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.logging.Logger;
import java.util.logging.Level;
import java.util.Map;
import java.util.List;
import java.util.ArrayList;
import java.util.HashMap;

public class StaticFileHandler implements HttpHandler {
    private static final Logger LOGGER = Logger.getLogger(StaticFileHandler.class.getName());
    private static final String STATIC_DIR = "static"; // Directory for static files
    private static final String IMAGES_DIR = "images"; // Directory for images
    
    @Override
    public void handle(HttpExchange exchange) throws IOException {
        String path = exchange.getRequestURI().getPath();
        String method = exchange.getRequestMethod();
        
        LOGGER.info("=== StaticFileHandler REQUEST ===");
        LOGGER.info("Method: " + method);
        LOGGER.info("Path: " + path);
        LOGGER.info("Full URI: " + exchange.getRequestURI());
        LOGGER.info("Query: " + exchange.getRequestURI().getQuery());
        
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
                            "- GET /api/cart - Get cart items\n\n" +
                            "Static files:\n" +
                            "- GET /images/* - Serve images\n" +
                            "- GET /static/* - Serve other static files";
            
            exchange.getResponseHeaders().add("Content-Type", "text/plain");
            exchange.sendResponseHeaders(200, response.getBytes(StandardCharsets.UTF_8).length);
            
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(response.getBytes(StandardCharsets.UTF_8));
            }
        } else if (path.startsWith("/images/")) {
            // Handle image requests
            serveImage(exchange, path);
        } else if (path.equals("/images")) {
            // Handle /images path (list available images)
            handleImagesList(exchange);
        } else if (path.startsWith("/static/")) {
            // Handle other static file requests
            serveStaticFile(exchange, path);
        } else if ("/test-images-status".equals(path)) {
            // Test endpoint to check image directory status
            handleTestImagesStatus(exchange);
        } else if ("/test-create-image".equals(path)) {
            // Test endpoint to create a test image
            handleTestCreateImage(exchange);
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
    
    private void serveImage(HttpExchange exchange, String path) throws IOException {
        try {
            // Extract filename from path
            String filename = path.substring("/images/".length());
            LOGGER.info("=== IMAGE REQUEST START ===");
            LOGGER.info("Image request received for: " + filename);
            LOGGER.info("Current working directory: " + System.getProperty("user.dir"));
            
            // Create images directory if it doesn't exist
            File imagesDir = new File(IMAGES_DIR);
            if (!imagesDir.exists()) {
                boolean created = imagesDir.mkdirs();
                LOGGER.info("Images directory creation result: " + created);
                LOGGER.info("Created images directory: " + imagesDir.getAbsolutePath());
            } else {
                LOGGER.info("Images directory already exists: " + imagesDir.getAbsolutePath());
            }
            
            // Look for image in multiple possible locations
            String[] possiblePaths = {
                IMAGES_DIR + "/" + filename,
                "uploads/" + filename,
                "static/images/" + filename,
                filename
            };
            
            LOGGER.info("Searching for image in paths:");
            for (String possiblePath : possiblePaths) {
                LOGGER.info("  - " + possiblePath);
            }
            
            File imageFile = null;
            for (String possiblePath : possiblePaths) {
                File file = new File(possiblePath);
                LOGGER.info("Checking path: " + possiblePath + " - exists: " + file.exists() + ", isFile: " + file.isFile());
                if (file.exists() && file.isFile()) {
                    imageFile = file;
                    LOGGER.info("Found image at: " + possiblePath);
                    break;
                }
            }
            
            if (imageFile != null && imageFile.exists()) {
                LOGGER.info("Serving existing image file: " + imageFile.getAbsolutePath());
                // Determine content type based on file extension
                String contentType = getContentType(filename);
                exchange.getResponseHeaders().add("Content-Type", contentType);
                exchange.getResponseHeaders().add("Cache-Control", "public, max-age=31536000"); // Cache for 1 year
                
                // Send file content
                exchange.sendResponseHeaders(200, imageFile.length());
                try (FileInputStream fis = new FileInputStream(imageFile);
                     OutputStream os = exchange.getResponseBody()) {
                    byte[] buffer = new byte[4096];
                    int bytesRead;
                    while ((bytesRead = fis.read(buffer)) != -1) {
                        os.write(buffer, 0, bytesRead);
                    }
                }
                LOGGER.info("Successfully served existing image: " + filename);
            } else {
                // Image not found - create a placeholder image
                LOGGER.info("Image not found, creating placeholder for: " + filename);
                byte[] placeholderImage = createPlaceholderImage(filename);
                LOGGER.info("Created placeholder image, size: " + placeholderImage.length + " bytes");
                
                String contentType = getContentType(filename);
                exchange.getResponseHeaders().add("Content-Type", contentType);
                exchange.getResponseHeaders().add("Cache-Control", "public, max-age=3600"); // Cache for 1 hour
                
                // Send placeholder image
                exchange.sendResponseHeaders(200, placeholderImage.length);
                try (OutputStream os = exchange.getResponseBody()) {
                    os.write(placeholderImage);
                }
                LOGGER.info("Successfully served placeholder image: " + filename);
                
                // Also save the placeholder to the images directory for future use
                try {
                    File savedImage = new File(IMAGES_DIR + "/" + filename);
                    try (FileOutputStream fos = new FileOutputStream(savedImage)) {
                        fos.write(placeholderImage);
                    }
                    LOGGER.info("Saved placeholder image to: " + savedImage.getAbsolutePath());
                    
                    // Verify the file was saved
                    if (savedImage.exists()) {
                        LOGGER.info("Verified saved image exists: " + savedImage.getAbsolutePath() + " (size: " + savedImage.length() + " bytes)");
                    } else {
                        LOGGER.warning("Saved image verification failed - file does not exist after saving");
                    }
                } catch (Exception e) {
                    LOGGER.warning("Could not save placeholder image: " + e.getMessage());
                    e.printStackTrace();
                }
            }
            LOGGER.info("=== IMAGE REQUEST END ===");
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error serving image", e);
            // Error serving image
            String response = "Error serving image: " + e.getMessage();
            exchange.getResponseHeaders().add("Content-Type", "text/plain");
            exchange.sendResponseHeaders(500, response.getBytes(StandardCharsets.UTF_8).length);
            
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(response.getBytes(StandardCharsets.UTF_8));
            }
        }
    }
    
    private void serveStaticFile(HttpExchange exchange, String path) throws IOException {
        try {
            // Extract filename from path
            String filename = path.substring("/static/".length());
            
            // Look for file in static directory
            File file = new File(STATIC_DIR + "/" + filename);
            
            if (file.exists() && file.isFile()) {
                // Determine content type based on file extension
                String contentType = getContentType(filename);
                exchange.getResponseHeaders().add("Content-Type", contentType);
                exchange.getResponseHeaders().add("Cache-Control", "public, max-age=31536000"); // Cache for 1 year
                
                // Send file content
                exchange.sendResponseHeaders(200, file.length());
                try (FileInputStream fis = new FileInputStream(file);
                     OutputStream os = exchange.getResponseBody()) {
                    byte[] buffer = new byte[4096];
                    int bytesRead;
                    while ((bytesRead = fis.read(buffer)) != -1) {
                        os.write(buffer, 0, bytesRead);
                    }
                }
            } else {
                // File not found
                String response = "File not found: " + filename;
                exchange.getResponseHeaders().add("Content-Type", "text/plain");
                exchange.sendResponseHeaders(404, response.getBytes(StandardCharsets.UTF_8).length);
                
                try (OutputStream os = exchange.getResponseBody()) {
                    os.write(response.getBytes(StandardCharsets.UTF_8));
                }
            }
        } catch (Exception e) {
            // Error serving file
            String response = "Error serving file: " + e.getMessage();
            exchange.getResponseHeaders().add("Content-Type", "text/plain");
            exchange.sendResponseHeaders(500, response.getBytes(StandardCharsets.UTF_8).length);
            
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(response.getBytes(StandardCharsets.UTF_8));
            }
        }
    }
    
    private String getContentType(String filename) {
        String extension = filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
        switch (extension) {
            case "jpg":
            case "jpeg":
                return "image/jpeg";
            case "png":
                return "image/png";
            case "gif":
                return "image/gif";
            case "webp":
                return "image/webp";
            case "svg":
                return "image/svg+xml";
            case "bmp":
                return "image/bmp";
            case "ico":
                return "image/x-icon";
            case "tiff":
            case "tif":
                return "image/tiff";
            case "css":
                return "text/css";
            case "js":
                return "application/javascript";
            case "html":
            case "htm":
                return "text/html";
            case "txt":
                return "text/plain";
            case "json":
                return "application/json";
            case "xml":
                return "application/xml";
            default:
                return "application/octet-stream";
        }
    }

    // Placeholder for createPlaceholderImage method
    private byte[] createPlaceholderImage(String filename) {
        try {
            // Create a simple SVG placeholder image
            String svgContent = createSVGPlaceholder(filename);
            return svgContent.getBytes(StandardCharsets.UTF_8);
        } catch (Exception e) {
            LOGGER.warning("Error creating placeholder image: " + e.getMessage());
            // Fallback to simple text
            String fallbackText = "No Image Available for " + filename;
            return fallbackText.getBytes(StandardCharsets.UTF_8);
        }
    }
    
    private String createSVGPlaceholder(String filename) {
        // Extract name without extension for display
        String displayName = filename;
        if (filename.contains(".")) {
            displayName = filename.substring(0, filename.lastIndexOf("."));
        }
        
        // Replace underscores and hyphens with spaces
        displayName = displayName.replace("_", " ").replace("-", " ");
        
        // Capitalize first letter of each word
        String[] words = displayName.split(" ");
        StringBuilder capitalizedName = new StringBuilder();
        for (String word : words) {
            if (word.length() > 0) {
                capitalizedName.append(word.substring(0, 1).toUpperCase());
                if (word.length() > 1) {
                    capitalizedName.append(word.substring(1).toLowerCase());
                }
                capitalizedName.append(" ");
            }
        }
        displayName = capitalizedName.toString().trim();
        
        // Generate a color based on filename hash
        int hash = filename.hashCode();
        String backgroundColor = String.format("#%06x", Math.abs(hash) % 0xFFFFFF);
        
        // Create SVG with the filename and a colored background
        return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
               "<svg width=\"300\" height=\"200\" xmlns=\"http://www.w3.org/2000/svg\">\n" +
               "  <rect width=\"300\" height=\"200\" fill=\"" + backgroundColor + "\"/>\n" +
               "  <text x=\"150\" y=\"80\" font-family=\"Arial, sans-serif\" font-size=\"18\" " +
               "        font-weight=\"bold\" text-anchor=\"middle\" fill=\"white\">" + displayName + "</text>\n" +
               "  <text x=\"150\" y=\"110\" font-family=\"Arial, sans-serif\" font-size=\"14\" " +
               "        text-anchor=\"middle\" fill=\"white\">Placeholder Image</text>\n" +
               "  <text x=\"150\" y=\"130\" font-family=\"Arial, sans-serif\" font-size=\"12\" " +
               "        text-anchor=\"middle\" fill=\"white\">" + filename + "</text>\n" +
               "  <circle cx=\"150\" cy=\"160\" r=\"20\" fill=\"white\" opacity=\"0.3\"/>\n" +
               "  <text x=\"150\" y=\"165\" font-family=\"Arial, sans-serif\" font-size=\"16\" " +
               "        text-anchor=\"middle\" fill=\"" + backgroundColor + "\">📷</text>\n" +
               "</svg>";
    }

    private void handleImagesList(HttpExchange exchange) throws IOException {
        try {
            LOGGER.info("=== IMAGES LIST REQUEST ===");
            
            File imagesDir = new File(IMAGES_DIR);
            List<String> imageFiles = new ArrayList<>();
            
            if (imagesDir.exists() && imagesDir.isDirectory()) {
                File[] files = imagesDir.listFiles();
                if (files != null) {
                    for (File file : files) {
                        if (file.isFile()) {
                            imageFiles.add(file.getName() + " (" + file.length() + " bytes)");
                        }
                    }
                }
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Image directory listing completed");
            response.put("imageFiles", imageFiles);
            response.put("imageDirectoryPath", IMAGES_DIR);
            
            String jsonResponse = convertToJson(response);
            exchange.getResponseHeaders().add("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, jsonResponse.getBytes(StandardCharsets.UTF_8).length);
            
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(jsonResponse.getBytes(StandardCharsets.UTF_8));
            }
            
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error in images list endpoint", e);
            String errorResponse = "Test failed: " + e.getMessage();
            exchange.getResponseHeaders().add("Content-Type", "text/plain");
            exchange.sendResponseHeaders(500, errorResponse.getBytes(StandardCharsets.UTF_8).length);
            
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(errorResponse.getBytes(StandardCharsets.UTF_8));
            }
        }
    }

    private void handleTestImagesStatus(HttpExchange exchange) throws IOException {
        try {
            LOGGER.info("=== TEST IMAGES STATUS ===");
            
            Map<String, Object> response = new HashMap<>();
            List<Map<String, Object>> directoryInfo = new ArrayList<>();
            
            // Check current working directory
            String currentDir = System.getProperty("user.dir");
            response.put("currentWorkingDirectory", currentDir);
            
            // Check images directory
            File imagesDir = new File(IMAGES_DIR);
            Map<String, Object> imagesDirInfo = new HashMap<>();
            imagesDirInfo.put("path", imagesDir.getAbsolutePath());
            imagesDirInfo.put("exists", imagesDir.exists());
            imagesDirInfo.put("isDirectory", imagesDir.isDirectory());
            if (imagesDir.exists()) {
                imagesDirInfo.put("canRead", imagesDir.canRead());
                imagesDirInfo.put("canWrite", imagesDir.canWrite());
                
                // List files in images directory
                File[] imageFiles = imagesDir.listFiles();
                if (imageFiles != null) {
                    List<String> files = new ArrayList<>();
                    for (File file : imageFiles) {
                        if (file.isFile()) {
                            files.add(file.getName() + " (" + file.length() + " bytes)");
                        }
                    }
                    imagesDirInfo.put("files", files);
                    imagesDirInfo.put("fileCount", files.size());
                } else {
                    imagesDirInfo.put("files", new ArrayList<>());
                    imagesDirInfo.put("fileCount", 0);
                }
            }
            directoryInfo.add(imagesDirInfo);
            
            // Check other possible image directories
            String[] otherDirs = {"uploads", "static/images", "static"};
            for (String dirPath : otherDirs) {
                File dir = new File(dirPath);
                Map<String, Object> dirInfo = new HashMap<>();
                dirInfo.put("path", dir.getAbsolutePath());
                dirInfo.put("exists", dir.exists());
                dirInfo.put("isDirectory", dir.isDirectory());
                if (dir.exists() && dir.isDirectory()) {
                    File[] files = dir.listFiles();
                    if (files != null) {
                        List<String> fileList = new ArrayList<>();
                        for (File file : files) {
                            if (file.isFile()) {
                                fileList.add(file.getName() + " (" + file.length() + " bytes)");
                            }
                        }
                        dirInfo.put("files", fileList);
                        dirInfo.put("fileCount", fileList.size());
                    }
                }
                directoryInfo.add(dirInfo);
            }
            
            response.put("directories", directoryInfo);
            response.put("message", "Image directory status check completed");
            
            // Convert response to JSON and send
            String jsonResponse = convertToJson(response);
            exchange.getResponseHeaders().add("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, jsonResponse.getBytes(StandardCharsets.UTF_8).length);
            
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(jsonResponse.getBytes(StandardCharsets.UTF_8));
            }
            
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error in test images status endpoint", e);
            String errorResponse = "Test failed: " + e.getMessage();
            exchange.getResponseHeaders().add("Content-Type", "text/plain");
            exchange.sendResponseHeaders(500, errorResponse.getBytes(StandardCharsets.UTF_8).length);
            
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(errorResponse.getBytes(StandardCharsets.UTF_8));
            }
        }
    }
    
    private void handleTestCreateImage(HttpExchange exchange) throws IOException {
        try {
            LOGGER.info("=== TEST CREATE IMAGE ===");
            
            // Create a test image
            String testFilename = "test-image.jpg";
            byte[] testImage = createPlaceholderImage(testFilename);
            
            // Save it to images directory
            File imagesDir = new File(IMAGES_DIR);
            if (!imagesDir.exists()) {
                imagesDir.mkdirs();
            }
            
            File testImageFile = new File(IMAGES_DIR + "/" + testFilename);
            try (FileOutputStream fos = new FileOutputStream(testImageFile)) {
                fos.write(testImage);
            }
            
            // Create response
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Test image created successfully");
            response.put("filename", testFilename);
            response.put("filePath", testImageFile.getAbsolutePath());
            response.put("fileExists", testImageFile.exists());
            response.put("fileSize", testImageFile.length());
            response.put("imageSize", testImage.length);
            
            // Test serving the image
            String imageUrl = "/images/" + testFilename;
            response.put("testImageUrl", imageUrl);
            response.put("instructions", "Test the image by visiting: " + imageUrl);
            
            String jsonResponse = convertToJson(response);
            exchange.getResponseHeaders().add("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, jsonResponse.getBytes(StandardCharsets.UTF_8).length);
            
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(jsonResponse.getBytes(StandardCharsets.UTF_8));
            }
            
            LOGGER.info("Test image created and saved successfully");
            
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error in test create image endpoint", e);
            String errorResponse = "Test failed: " + e.getMessage();
            exchange.getResponseHeaders().add("Content-Type", "text/plain");
            exchange.sendResponseHeaders(500, errorResponse.getBytes(StandardCharsets.UTF_8).length);
            
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(errorResponse.getBytes(StandardCharsets.UTF_8));
            }
        }
    }
    
    private String convertToJson(Map<String, Object> data) {
        // Simple JSON conversion for debugging
        StringBuilder json = new StringBuilder();
        json.append("{\n");
        
        for (Map.Entry<String, Object> entry : data.entrySet()) {
            json.append("  \"").append(entry.getKey()).append("\": ");
            
            if (entry.getValue() instanceof String) {
                json.append("\"").append(entry.getValue()).append("\"");
            } else if (entry.getValue() instanceof List) {
                json.append("[\n");
                List<?> list = (List<?>) entry.getValue();
                for (int i = 0; i < list.size(); i++) {
                    json.append("    \"").append(list.get(i)).append("\"");
                    if (i < list.size() - 1) json.append(",");
                    json.append("\n");
                }
                json.append("  ]");
            } else if (entry.getValue() instanceof Map) {
                json.append("{\n");
                Map<?, ?> map = (Map<?, ?>) entry.getValue();
                int count = 0;
                for (Map.Entry<?, ?> mapEntry : map.entrySet()) {
                    json.append("    \"").append(mapEntry.getKey()).append("\": ");
                    if (mapEntry.getValue() instanceof String) {
                        json.append("\"").append(mapEntry.getValue()).append("\"");
                    } else {
                        json.append(mapEntry.getValue());
                    }
                    if (count < map.size() - 1) json.append(",");
                    json.append("\n");
                    count++;
                }
                json.append("  }");
            } else {
                json.append(entry.getValue());
            }
            
            json.append(",\n");
        }
        
        // Remove trailing comma
        if (json.charAt(json.length() - 2) == ',') {
            json.setLength(json.length() - 2);
        }
        
        json.append("\n}");
        return json.toString();
    }
} 