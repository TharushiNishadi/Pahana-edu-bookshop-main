package com.pahana.backend.utils;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;
import java.util.logging.Level;
import com.pahana.backend.utils.JsonUtil;

public class JwtUtil {
    private static final Logger LOGGER = Logger.getLogger(JwtUtil.class.getName());
    private static final String SECRET_KEY = "pahana_edu_bookshop_secret_key_2024";
    private static final String ALGORITHM = "HmacSHA256";
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    public static void initialize() {
        LOGGER.info("JWT utility initialized");
    }

    public static String generateToken(String userId, String userType) {
        try {
            // Create header
            Map<String, String> header = new HashMap<>();
            header.put("alg", "HS256");
            header.put("typ", "JWT");
            String headerJson = JsonUtil.toJson(header);
            String headerEncoded = Base64.getUrlEncoder().withoutPadding().encodeToString(headerJson.getBytes(StandardCharsets.UTF_8));

            // Create payload
            Map<String, Object> payload = new HashMap<>();
            payload.put("userId", userId);
            payload.put("userType", userType);
            payload.put("iat", Instant.now().getEpochSecond());
            payload.put("exp", Instant.now().plus(24, ChronoUnit.HOURS).getEpochSecond());
            payload.put("jti", generateJti());
            
            String payloadJson = JsonUtil.toJson(payload);
            String payloadEncoded = Base64.getUrlEncoder().withoutPadding().encodeToString(payloadJson.getBytes(StandardCharsets.UTF_8));

            // Create signature
            String data = headerEncoded + "." + payloadEncoded;
            String signature = createSignature(data);
            String signatureEncoded = Base64.getUrlEncoder().withoutPadding().encodeToString(signature.getBytes(StandardCharsets.UTF_8));

            return data + "." + signatureEncoded;
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error generating JWT token", e);
            throw new RuntimeException("Failed to generate JWT token", e);
        }
    }

    public static Map<String, Object> validateToken(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                throw new RuntimeException("Invalid JWT token format");
            }

            String headerEncoded = parts[0];
            String payloadEncoded = parts[1];
            String signatureEncoded = parts[2];

            // Verify signature
            String data = headerEncoded + "." + payloadEncoded;
            String expectedSignature = createSignature(data);
            String expectedSignatureEncoded = Base64.getUrlEncoder().withoutPadding().encodeToString(expectedSignature.getBytes(StandardCharsets.UTF_8));

            if (!signatureEncoded.equals(expectedSignatureEncoded)) {
                throw new RuntimeException("Invalid JWT signature");
            }

            // Decode payload
            String payloadJson = new String(Base64.getUrlDecoder().decode(payloadEncoded), StandardCharsets.UTF_8);
            Map<String, Object> payload = JsonUtil.fromJson(payloadJson, Map.class);

            // Check expiration
            long exp = (Long) payload.get("exp");
            if (Instant.now().getEpochSecond() > exp) {
                throw new RuntimeException("JWT token has expired");
            }

            return payload;
        } catch (Exception e) {
            LOGGER.log(Level.WARNING, "Error validating JWT token", e);
            throw new RuntimeException("Invalid JWT token", e);
        }
    }

    private static String createSignature(String data) throws Exception {
        Mac mac = Mac.getInstance(ALGORITHM);
        SecretKeySpec secretKeySpec = new SecretKeySpec(SECRET_KEY.getBytes(StandardCharsets.UTF_8), ALGORITHM);
        mac.init(secretKeySpec);
        byte[] signature = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        return Base64.getEncoder().encodeToString(signature);
    }

    private static String generateJti() {
        byte[] bytes = new byte[16];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    public static String getUserIdFromToken(String token) {
        Map<String, Object> payload = validateToken(token);
        return (String) payload.get("userId");
    }

    public static String getUserTypeFromToken(String token) {
        Map<String, Object> payload = validateToken(token);
        return (String) payload.get("userType");
    }
} 