package com.pahana.backend.utils;

import java.lang.reflect.Field;
import java.util.*;
import java.util.logging.Logger;
import java.util.logging.Level;

public class JsonUtil {
    private static final Logger LOGGER = Logger.getLogger(JsonUtil.class.getName());

    public static String toJson(Object obj) {
        if (obj == null) {
            return "null";
        }

        if (obj instanceof String) {
            return "\"" + escapeString((String) obj) + "\"";
        }

        if (obj instanceof Number || obj instanceof Boolean) {
            return obj.toString();
        }

        if (obj instanceof Map) {
            return mapToJson((Map<?, ?>) obj);
        }

        if (obj instanceof Collection) {
            return collectionToJson((Collection<?>) obj);
        }

        if (obj.getClass().isArray()) {
            return arrayToJson(obj);
        }

        return objectToJson(obj);
    }

    public static <T> T fromJson(String json, Class<T> clazz) {
        try {
            if (json == null || json.trim().isEmpty()) {
                return null;
            }

            json = json.trim();

            if (clazz == String.class) {
                return (T) unescapeString(json.replaceAll("^\"|\"$", ""));
            }

            if (clazz == Integer.class || clazz == int.class) {
                return (T) Integer.valueOf(json);
            }

            if (clazz == Long.class || clazz == long.class) {
                return (T) Long.valueOf(json);
            }

            if (clazz == Double.class || clazz == double.class) {
                return (T) Double.valueOf(json);
            }

            if (clazz == Boolean.class || clazz == boolean.class) {
                return (T) Boolean.valueOf(json);
            }

            if (clazz == Map.class) {
                return (T) parseMap(json);
            }

            if (clazz == List.class) {
                return (T) parseList(json);
            }

            return parseObject(json, clazz);
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error parsing JSON", e);
            throw new RuntimeException("Failed to parse JSON", e);
        }
    }

    private static String mapToJson(Map<?, ?> map) {
        StringBuilder sb = new StringBuilder("{");
        boolean first = true;
        for (Map.Entry<?, ?> entry : map.entrySet()) {
            if (!first) {
                sb.append(",");
            }
            sb.append("\"").append(entry.getKey()).append("\":").append(toJson(entry.getValue()));
            first = false;
        }
        sb.append("}");
        return sb.toString();
    }

    private static String collectionToJson(Collection<?> collection) {
        StringBuilder sb = new StringBuilder("[");
        boolean first = true;
        for (Object item : collection) {
            if (!first) {
                sb.append(",");
            }
            sb.append(toJson(item));
            first = false;
        }
        sb.append("]");
        return sb.toString();
    }

    private static String arrayToJson(Object array) {
        if (array instanceof Object[]) {
            return collectionToJson(Arrays.asList((Object[]) array));
        }
        if (array instanceof int[]) {
            return collectionToJson(Arrays.stream((int[]) array).boxed().toList());
        }
        if (array instanceof long[]) {
            return collectionToJson(Arrays.stream((long[]) array).boxed().toList());
        }
        if (array instanceof double[]) {
            return collectionToJson(Arrays.stream((double[]) array).boxed().toList());
        }
        if (array instanceof boolean[]) {
            List<Boolean> list = new ArrayList<>();
            for (boolean b : (boolean[]) array) {
                list.add(b);
            }
            return collectionToJson(list);
        }
        return "[]";
    }

    private static String objectToJson(Object obj) {
        try {
            StringBuilder sb = new StringBuilder("{");
            Field[] fields = obj.getClass().getDeclaredFields();
            boolean first = true;
            for (Field field : fields) {
                field.setAccessible(true);
                Object value = field.get(obj);
                if (value != null) {
                    if (!first) {
                        sb.append(",");
                    }
                    sb.append("\"").append(field.getName()).append("\":").append(toJson(value));
                    first = false;
                }
            }
            sb.append("}");
            return sb.toString();
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error converting object to JSON", e);
            return "{}";
        }
    }

    private static String escapeString(String str) {
        return str.replace("\\", "\\\\")
                 .replace("\"", "\\\"")
                 .replace("\n", "\\n")
                 .replace("\r", "\\r")
                 .replace("\t", "\\t");
    }

    private static String unescapeString(String str) {
        return str.replace("\\t", "\t")
                 .replace("\\r", "\r")
                 .replace("\\n", "\n")
                 .replace("\\\"", "\"")
                 .replace("\\\\", "\\");
    }

    private static Map<String, Object> parseMap(String json) {
        Map<String, Object> map = new HashMap<>();
        json = json.trim();
        if (!json.startsWith("{") || !json.endsWith("}")) {
            throw new RuntimeException("Invalid JSON object format");
        }
        
        json = json.substring(1, json.length() - 1).trim();
        if (json.isEmpty()) {
            return map;
        }

        int braceCount = 0;
        int bracketCount = 0;
        boolean inString = false;
        boolean escaped = false;
        StringBuilder currentKey = new StringBuilder();
        StringBuilder currentValue = new StringBuilder();
        boolean readingKey = true;
        boolean keyComplete = false;

        for (int i = 0; i < json.length(); i++) {
            char c = json.charAt(i);
            
            if (escaped) {
                if (readingKey) {
                    currentKey.append(c);
                } else {
                    currentValue.append(c);
                }
                escaped = false;
                continue;
            }

            if (c == '\\') {
                escaped = true;
                if (readingKey) {
                    currentKey.append(c);
                } else {
                    currentValue.append(c);
                }
                continue;
            }

            if (c == '"' && !escaped) {
                inString = !inString;
                if (readingKey) {
                    currentKey.append(c);
                } else {
                    currentValue.append(c);
                }
                continue;
            }

            if (!inString) {
                if (c == '{') braceCount++;
                if (c == '}') braceCount--;
                if (c == '[') bracketCount++;
                if (c == ']') bracketCount--;
            }

            if (readingKey) {
                if (c == ':' && braceCount == 0 && bracketCount == 0) {
                    readingKey = false;
                    keyComplete = true;
                    continue;
                }
                currentKey.append(c);
            } else {
                if (c == ',' && braceCount == 0 && bracketCount == 0) {
                    String key = currentKey.toString().trim().replaceAll("^\"|\"$", "");
                    String valueStr = currentValue.toString().trim();
                    map.put(key, parseValue(valueStr));
                    currentKey = new StringBuilder();
                    currentValue = new StringBuilder();
                    readingKey = true;
                    keyComplete = false;
                    continue;
                }
                currentValue.append(c);
            }
        }

        if (keyComplete) {
            String key = currentKey.toString().trim().replaceAll("^\"|\"$", "");
            String valueStr = currentValue.toString().trim();
            map.put(key, parseValue(valueStr));
        }

        return map;
    }

    private static List<Object> parseList(String json) {
        List<Object> list = new ArrayList<>();
        json = json.trim();
        if (!json.startsWith("[") || !json.endsWith("]")) {
            throw new RuntimeException("Invalid JSON array format");
        }
        
        json = json.substring(1, json.length() - 1).trim();
        if (json.isEmpty()) {
            return list;
        }

        int braceCount = 0;
        int bracketCount = 0;
        boolean inString = false;
        boolean escaped = false;
        StringBuilder currentValue = new StringBuilder();

        for (int i = 0; i < json.length(); i++) {
            char c = json.charAt(i);
            
            if (escaped) {
                currentValue.append(c);
                escaped = false;
                continue;
            }

            if (c == '\\') {
                escaped = true;
                currentValue.append(c);
                continue;
            }

            if (c == '"' && !escaped) {
                inString = !inString;
                currentValue.append(c);
                continue;
            }

            if (!inString) {
                if (c == '{') braceCount++;
                if (c == '}') braceCount--;
                if (c == '[') bracketCount++;
                if (c == ']') bracketCount--;
            }

            if (c == ',' && braceCount == 0 && bracketCount == 0) {
                String valueStr = currentValue.toString().trim();
                list.add(parseValue(valueStr));
                currentValue = new StringBuilder();
                continue;
            }
            
            currentValue.append(c);
        }

        String valueStr = currentValue.toString().trim();
        if (!valueStr.isEmpty()) {
            list.add(parseValue(valueStr));
        }

        return list;
    }

    private static Object parseValue(String valueStr) {
        valueStr = valueStr.trim();
        
        if (valueStr.equals("null")) {
            return null;
        }
        
        if (valueStr.equals("true")) {
            return true;
        }
        
        if (valueStr.equals("false")) {
            return false;
        }
        
        if (valueStr.startsWith("\"") && valueStr.endsWith("\"")) {
            return unescapeString(valueStr.substring(1, valueStr.length() - 1));
        }
        
        if (valueStr.startsWith("{") && valueStr.endsWith("}")) {
            return parseMap(valueStr);
        }
        
        if (valueStr.startsWith("[") && valueStr.endsWith("]")) {
            return parseList(valueStr);
        }
        
        try {
            if (valueStr.contains(".")) {
                return Double.parseDouble(valueStr);
            } else {
                return Long.parseLong(valueStr);
            }
        } catch (NumberFormatException e) {
            return valueStr;
        }
    }

    private static <T> T parseObject(String json, Class<T> clazz) {
        Map<String, Object> map = parseMap(json);
        try {
            T obj = clazz.getDeclaredConstructor().newInstance();
            for (Map.Entry<String, Object> entry : map.entrySet()) {
                try {
                    Field field = clazz.getDeclaredField(entry.getKey());
                    field.setAccessible(true);
                    field.set(obj, entry.getValue());
                } catch (NoSuchFieldException e) {
                    // Ignore fields that don't exist in the class
                }
            }
            return obj;
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error creating object from JSON", e);
            throw new RuntimeException("Failed to create object from JSON", e);
        }
    }
} 