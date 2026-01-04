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
    
    @Override
    public void run(String... args) {
        // Ensure all admin users exist and are properly configured
        String[] adminEmails = adminEmail.split(",");
        
        for (String email : adminEmails) {
            String trimmedEmail = email.trim();
            // Use case-insensitive lookup to find admin by email
            User admin = userRepository.findByEmailIgnoreCase(trimmedEmail).orElse(null);
            
            if (admin == null) {
                // Create admin user if it doesn't exist
                User newAdmin = new User();
                newAdmin.setEmail(trimmedEmail.toLowerCase()); // Store email in lowercase for consistency
                newAdmin.setPasswordHash(passwordEncoder.encode("1234"));
                newAdmin.setRole("ADMIN"); // Explicitly set role to ADMIN
                admin = userRepository.save(newAdmin);
                System.out.println("✅ Admin account created: " + trimmedEmail);
            } else {
                // Update admin password and ensure role is ADMIN
                admin.setPasswordHash(passwordEncoder.encode("1234"));
                admin.setRole("ADMIN"); // Ensure role is always ADMIN for admin email
                // Normalize email to lowercase
                if (!admin.getEmail().equalsIgnoreCase(trimmedEmail)) {
                    admin.setEmail(trimmedEmail.toLowerCase());
                }
                admin = userRepository.save(admin);
                System.out.println("✅ Admin account updated: " + trimmedEmail + " (role: ADMIN)");
            }
            
            // Store admin ID for final variable
            final Long adminId = admin.getId();
            
            // Delete any other users with the admin email (case-insensitive check)
            userRepository.findAll().stream()
                .filter(u -> u.getEmail() != null && 
                            u.getEmail().equalsIgnoreCase(trimmedEmail) && 
                            !u.getId().equals(adminId))
                .forEach(u -> {
                    userRepository.delete(u);
                    System.out.println("⚠️ Deleted duplicate user with admin email: " + u.getId());
                });
        }
    }
}

