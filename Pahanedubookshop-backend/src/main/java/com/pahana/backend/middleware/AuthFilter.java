package com.pahana.backend.middleware;

import com.pahana.backend.utils.JwtUtil;
import com.sun.net.httpserver.Filter;
import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;
import java.util.Map;

public class AuthFilter extends Filter {
    @Override
    public void doFilter(HttpExchange exchange, Chain chain) throws IOException {
        // For now, just continue with the chain
        // In a real application, you would validate JWT tokens here
        chain.doFilter(exchange);
    }

    @Override
    public String description() {
        return "Authentication Filter";
    }
} 