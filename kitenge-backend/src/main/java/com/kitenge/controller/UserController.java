package com.kitenge.controller;

import com.kitenge.dto.UpdateProfileRequest;
import com.kitenge.dto.UserDto;
import com.kitenge.model.User;
import com.kitenge.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth.getPrincipal() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
            }
            
            @SuppressWarnings("unchecked")
            Map<String, Object> principal = (Map<String, Object>) auth.getPrincipal();
            Long userId = (Long) principal.get("userId");
            
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            UserDto userDto = new UserDto();
            userDto.setId(user.getId());
            userDto.setEmail(user.getEmail());
            userDto.setPhone(user.getPhone());
            userDto.setName(user.getName());
            userDto.setAddress(user.getAddress());
            userDto.setCity(user.getCity());
            userDto.setCountry(user.getCountry());
            userDto.setRole(user.getRole());
            
            return ResponseEntity.ok(userDto);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to load profile: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth.getPrincipal() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
            }
            
            @SuppressWarnings("unchecked")
            Map<String, Object> principal = (Map<String, Object>) auth.getPrincipal();
            Long userId = (Long) principal.get("userId");
            
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            if (request.getEmail() != null && !request.getEmail().isEmpty()) {
                // Check if email is already taken by another user
                if (!user.getEmail().equals(request.getEmail()) && 
                    userRepository.existsByEmail(request.getEmail())) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Email already exists"));
                }
                user.setEmail(request.getEmail());
            }
            
            if (request.getPhone() != null) user.setPhone(request.getPhone());
            if (request.getName() != null) user.setName(request.getName());
            if (request.getAddress() != null) user.setAddress(request.getAddress());
            if (request.getCity() != null) user.setCity(request.getCity());
            if (request.getCountry() != null) user.setCountry(request.getCountry());
            
            user = userRepository.save(user);
            
            UserDto userDto = new UserDto();
            userDto.setId(user.getId());
            userDto.setEmail(user.getEmail());
            userDto.setPhone(user.getPhone());
            userDto.setName(user.getName());
            userDto.setAddress(user.getAddress());
            userDto.setCity(user.getCity());
            userDto.setCountry(user.getCountry());
            userDto.setRole(user.getRole());
            
            return ResponseEntity.ok(userDto);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to update profile: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> request) {
        try {
            String currentPassword = request.get("currentPassword");
            String newPassword = request.get("newPassword");
            
            if (currentPassword == null || newPassword == null || newPassword.length() < 6) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid password data"));
            }
            
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth.getPrincipal() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
            }
            
            @SuppressWarnings("unchecked")
            Map<String, Object> principal = (Map<String, Object>) auth.getPrincipal();
            Long userId = (Long) principal.get("userId");
            
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Current password is incorrect"));
            }
            
            user.setPasswordHash(passwordEncoder.encode(newPassword));
            userRepository.save(user);
            
            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to change password: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    @GetMapping("/all")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<User> users = userRepository.findAll();
            List<UserDto> userDtos = users.stream().map(user -> {
                UserDto dto = new UserDto();
                dto.setId(user.getId());
                dto.setEmail(user.getEmail());
                dto.setPhone(user.getPhone());
                dto.setName(user.getName());
                dto.setAddress(user.getAddress());
                dto.setCity(user.getCity());
                dto.setCountry(user.getCountry());
                dto.setRole(user.getRole());
                return dto;
            }).collect(Collectors.toList());
            return ResponseEntity.ok(userDtos);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to load users: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth.getPrincipal() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
            }
            
            @SuppressWarnings("unchecked")
            Map<String, Object> principal = (Map<String, Object>) auth.getPrincipal();
            Long currentUserId = (Long) principal.get("userId");
            
            // Prevent users from deleting themselves
            if (currentUserId.equals(id)) {
                return ResponseEntity.badRequest().body(Map.of("error", "You cannot delete your own account"));
            }
            
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Prevent deletion of admin users (optional safety check)
            if ("ADMIN".equals(user.getRole()) && !"ADMIN".equals(principal.get("role"))) {
                return ResponseEntity.badRequest().body(Map.of("error", "Only admins can delete admin users"));
            }
            
            userRepository.delete(user);
            return ResponseEntity.ok(Map.of("success", true, "message", "User deleted successfully"));
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to delete user: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
}

