package com.kitenge.service;

import com.kitenge.model.PasswordResetToken;
import com.kitenge.model.User;
import com.kitenge.repository.PasswordResetTokenRepository;
import com.kitenge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PasswordResetService {
    
    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;
    
    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;
    
    @Transactional
    public void requestPasswordReset(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with this email"));
        
        // Delete any existing tokens for this user
        tokenRepository.deleteByUserId(user.getId());
        
        // Generate new token
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setUserId(user.getId());
        resetToken.setExpiresAt(LocalDateTime.now().plusHours(1)); // Token valid for 1 hour
        resetToken.setUsed(false);
        
        tokenRepository.save(resetToken);
        
        // Send email (will log token if email fails)
        sendPasswordResetEmail(user.getEmail(), token);
        
        // Always succeed - token is created even if email fails
        // User can check console logs for the reset link if email doesn't work
    }
    
    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired token"));
        
        if (resetToken.getUsed()) {
            throw new RuntimeException("Token has already been used");
        }
        
        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token has expired");
        }
        
        User user = userRepository.findById(resetToken.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Update password
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        // Mark token as used
        resetToken.setUsed(true);
        tokenRepository.save(resetToken);
    }
    
    private void sendPasswordResetEmail(String email, String token) {
        try {
            if (mailSender == null) {
                throw new RuntimeException("Email service is not configured. Please set EMAIL_USER and EMAIL_PASS in application.properties or as environment variables.");
            }
            
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("noreply@kitengebora.com");
            message.setTo(email);
            message.setSubject("Reset Your Password - Kitenge Bora");
            message.setText(
                "Hello,\n\n" +
                "You requested to reset your password for Kitenge Bora.\n\n" +
                "Click the link below to reset your password:\n" +
                frontendUrl + "/reset-password?token=" + token + "\n\n" +
                "This link will expire in 1 hour.\n\n" +
                "If you didn't request this, please ignore this email.\n\n" +
                "Best regards,\n" +
                "Kitenge Bora Team"
            );
            mailSender.send(message);
            System.out.println("Password reset email sent successfully to: " + email);
        } catch (Exception e) {
            System.err.println("ERROR: Failed to send password reset email to " + email);
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            // Re-throw to notify the user that email failed
            throw new RuntimeException("Failed to send password reset email. Please check your email configuration. Error: " + e.getMessage());
        }
    }
}

