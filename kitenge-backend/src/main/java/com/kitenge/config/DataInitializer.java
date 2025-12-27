package com.kitenge.config;

import com.kitenge.model.User;
import com.kitenge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Value("${app.admin.email}")
    private String adminEmail;
    
    @Override
    public void run(String... args) {
        // Ensure admin user exists and is properly configured
        // Use case-insensitive lookup to find admin by email
        User admin = userRepository.findByEmailIgnoreCase(adminEmail).orElse(null);
        
        if (admin == null) {
            // Create admin user if it doesn't exist
            User newAdmin = new User();
            newAdmin.setEmail(adminEmail.toLowerCase()); // Store email in lowercase for consistency
            newAdmin.setPasswordHash(passwordEncoder.encode("1234"));
            newAdmin.setRole("ADMIN"); // Explicitly set role to ADMIN
            admin = userRepository.save(newAdmin);
            System.out.println("✅ Admin account created: " + adminEmail);
        } else {
            // Update admin password and ensure role is ADMIN
            admin.setPasswordHash(passwordEncoder.encode("1234"));
            admin.setRole("ADMIN"); // Ensure role is always ADMIN for admin email
            // Normalize email to lowercase
            if (!admin.getEmail().equalsIgnoreCase(adminEmail)) {
                admin.setEmail(adminEmail.toLowerCase());
            }
            admin = userRepository.save(admin);
            System.out.println("✅ Admin account updated: " + adminEmail + " (role: ADMIN)");
        }
        
        // Store admin ID for final variable
        final Long adminId = admin.getId();
        
        // Delete any other users with the admin email (case-insensitive check)
        userRepository.findAll().stream()
            .filter(u -> u.getEmail() != null && 
                        u.getEmail().equalsIgnoreCase(adminEmail) && 
                        !u.getId().equals(adminId))
            .forEach(u -> {
                userRepository.delete(u);
                System.out.println("⚠️ Deleted duplicate user with admin email: " + u.getId());
            });
    }
}

