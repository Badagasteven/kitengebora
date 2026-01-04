package com.kitenge.controller;

import com.kitenge.dto.UserDto;
import com.kitenge.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AuthCheckController {
    
    private final JwtUtil jwtUtil;
    
    @Value("${app.admin.email}")
    private String adminEmail;
    
    // Helper method to check if email is admin
    private boolean isAdminEmail(String email) {
        if (email == null || adminEmail == null) return false;
        String[] adminEmails = adminEmail.split(",");
        for (String admin : adminEmails) {
            if (email.equalsIgnoreCase(admin.trim())) {
                return true;
            }
        }
        return false;
    }
    
    @GetMapping("/check-auth")
    public ResponseEntity<Map<String, Object>> checkAuth(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        Map<String, Object> response = new HashMap<>();
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.put("isAuthenticated", false);
            response.put("isAdmin", false);
            return ResponseEntity.ok(response);
        }
        
        try {
            String token = authHeader.replace("Bearer ", "");
            String email = jwtUtil.extractEmail(token);
            Long userId = jwtUtil.extractUserId(token);
            Boolean isAdmin = jwtUtil.extractIsAdmin(token);
            String role = jwtUtil.extractRole(token);
            
            if (jwtUtil.validateToken(token, email)) {
                // Double-check admin status: email match OR role is ADMIN
                boolean adminStatus = (isAdmin != null && isAdmin) || 
                                     isAdminEmail(email) || 
                                     "ADMIN".equals(role);
                
                response.put("isAuthenticated", true);
                response.put("isAdmin", adminStatus);
                UserDto userDto = new UserDto();
                userDto.setId(userId);
                userDto.setEmail(email);
                userDto.setRole(adminStatus ? "ADMIN" : (role != null ? role : "CUSTOMER"));
                response.put("user", userDto);
            } else {
                response.put("isAuthenticated", false);
                response.put("isAdmin", false);
            }
        } catch (Exception e) {
            response.put("isAuthenticated", false);
            response.put("isAdmin", false);
        }
        
        return ResponseEntity.ok(response);
    }
}

