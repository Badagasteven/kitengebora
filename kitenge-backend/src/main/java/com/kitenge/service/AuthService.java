package com.kitenge.service;

import com.kitenge.dto.AuthResponse;
import com.kitenge.dto.LoginRequest;
import com.kitenge.dto.RegisterRequest;
import com.kitenge.dto.TwoFactorRequest;
import com.kitenge.dto.UserDto;
import com.kitenge.model.User;
import com.kitenge.repository.UserRepository;
import com.kitenge.service.EmailVerificationService;
import com.kitenge.service.TwoFactorService;
import com.kitenge.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final TwoFactorService twoFactorService;
    private final EmailVerificationService emailVerificationService;
    
    @Value("${app.admin.email}")
    private String adminEmail;
    
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Prevent registration with admin email
        if (request.getEmail().equalsIgnoreCase(adminEmail)) {
            throw new RuntimeException("This email is reserved for admin use only");
        }
        
        if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setName(request.getName() != null ? request.getName().trim() : null);
        user.setPhone(request.getPhone() != null ? request.getPhone().trim() : null);
        user.setRole("CUSTOMER"); // Regular users are always CUSTOMER
        
        user.setEmailVerified(false); // Email not verified yet
        user = userRepository.save(user);
        
        // Send verification email
        emailVerificationService.sendVerificationEmail(user);
        
        // Regular users are never admin
        boolean isAdmin = false;
        String role = "CUSTOMER";
        
        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), isAdmin, role);
        
        UserDto userDto = new UserDto();
        userDto.setId(user.getId());
        userDto.setEmail(user.getEmail());
        userDto.setName(user.getName());
        userDto.setPhone(user.getPhone());
        userDto.setAddress(user.getAddress());
        userDto.setCity(user.getCity());
        userDto.setCountry(user.getCountry());
        userDto.setRole(role);
        
        AuthResponse response = new AuthResponse();
        response.setToken(token);
        response.setUser(userDto);
        response.setAdmin(isAdmin);
        return response;
    }
    
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));
        
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }
        
        // Check if 2FA is enabled
        if (user.getTwoFactorEnabled() != null && user.getTwoFactorEnabled()) {
            // Generate and send 2FA code
            twoFactorService.generateAndSendCode(user.getEmail());
            
            // Return response indicating 2FA is required
            AuthResponse response = new AuthResponse();
            response.setRequiresTwoFactor(true);
            response.setMessage("Two-factor authentication code has been sent to your email");
            return response;
        }
        
        // Normal login without 2FA
        // Admin status: email must match admin email AND/OR role must be ADMIN
        // If email matches admin email, always set as admin regardless of role
        boolean isAdmin = user.getEmail().equalsIgnoreCase(adminEmail) || "ADMIN".equals(user.getRole());
        String role = user.getRole() != null ? user.getRole() : "CUSTOMER";
        
        // If email matches admin email, ensure role is ADMIN
        if (user.getEmail().equalsIgnoreCase(adminEmail)) {
            isAdmin = true;
            role = "ADMIN";
            // Update user role in database if it's not already ADMIN
            if (!"ADMIN".equals(user.getRole())) {
                user.setRole("ADMIN");
                userRepository.save(user);
            }
        }
        
        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), isAdmin, role);
        
        UserDto userDto = new UserDto();
        userDto.setId(user.getId());
        userDto.setEmail(user.getEmail());
        userDto.setName(user.getName());
        userDto.setPhone(user.getPhone());
        userDto.setAddress(user.getAddress());
        userDto.setCity(user.getCity());
        userDto.setCountry(user.getCountry());
        userDto.setRole(role);
        
        AuthResponse response = new AuthResponse();
        response.setToken(token);
        response.setUser(userDto);
        response.setAdmin(isAdmin);
        return response;
    }
    
    public AuthResponse verifyTwoFactor(TwoFactorRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!twoFactorService.verifyCode(request.getEmail(), request.getCode())) {
            throw new RuntimeException("Invalid or expired verification code");
        }
        
        // Admin status: email must match admin email AND/OR role must be ADMIN
        boolean isAdmin = user.getEmail().equalsIgnoreCase(adminEmail) || "ADMIN".equals(user.getRole());
        String role = user.getRole() != null ? user.getRole() : "CUSTOMER";
        
        // If email matches admin email, ensure role is ADMIN
        if (user.getEmail().equalsIgnoreCase(adminEmail)) {
            isAdmin = true;
            role = "ADMIN";
            // Update user role in database if it's not already ADMIN
            if (!"ADMIN".equals(user.getRole())) {
                user.setRole("ADMIN");
                userRepository.save(user);
            }
        }
        
        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), isAdmin, role);
        
        UserDto userDto = new UserDto();
        userDto.setId(user.getId());
        userDto.setEmail(user.getEmail());
        userDto.setName(user.getName());
        userDto.setPhone(user.getPhone());
        userDto.setAddress(user.getAddress());
        userDto.setCity(user.getCity());
        userDto.setCountry(user.getCountry());
        userDto.setRole(role);
        
        AuthResponse response = new AuthResponse();
        response.setToken(token);
        response.setUser(userDto);
        response.setAdmin(isAdmin);
        return response;
    }
    
    public User getUserByEmail(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}

