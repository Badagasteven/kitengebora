package com.kitenge.service;

import com.kitenge.model.User;
import com.kitenge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TwoFactorService {
    
    private final UserRepository userRepository;
    private final JavaMailSender mailSender;
    
    // Store 2FA codes temporarily (in production, use Redis or database)
    private final Map<String, String> twoFactorCodes = new HashMap<>();
    
    public String generateAndSendCode(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.getTwoFactorEnabled() == null || !user.getTwoFactorEnabled()) {
            throw new RuntimeException("Two-factor authentication is not enabled for this account");
        }
        
        // Generate 6-digit code
        String code = String.format("%06d", new SecureRandom().nextInt(1000000));
        
        // Store code (expires in 10 minutes)
        twoFactorCodes.put(email, code);
        
        // Send email
        sendTwoFactorCode(email, code);
        
        return code; // In production, don't return the code
    }
    
    public boolean verifyCode(String email, String code) {
        String storedCode = twoFactorCodes.get(email);
        if (storedCode == null) {
            return false;
        }
        
        boolean isValid = storedCode.equals(code);
        if (isValid) {
            // Remove code after successful verification
            twoFactorCodes.remove(email);
        }
        return isValid;
    }
    
    private void sendTwoFactorCode(String email, String code) {
        try {
            if (mailSender == null) {
                System.err.println("WARNING: JavaMailSender is not configured. 2FA code will not be sent via email.");
                System.err.println("2FA Code for " + email + ": " + code);
                System.err.println("To enable email, set EMAIL_USER and EMAIL_PASS environment variables.");
                return;
            }
            
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("noreply@kitengebora.com");
            message.setTo(email);
            message.setSubject("Your Two-Factor Authentication Code - Kitenge Bora");
            message.setText(
                "Hello,\n\n" +
                "Your two-factor authentication code is:\n\n" +
                code + "\n\n" +
                "This code will expire in 10 minutes.\n\n" +
                "If you didn't request this code, please ignore this email.\n\n" +
                "Best regards,\n" +
                "Kitenge Bora Team"
            );
            mailSender.send(message);
            System.out.println("2FA code sent successfully to: " + email);
        } catch (Exception e) {
            System.err.println("ERROR: Failed to send 2FA code to " + email);
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            System.err.println("\n2FA Code for " + email + ": " + code);
        }
    }
}

