package com.kitenge.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
public class EmailTestController {
    
    private final JavaMailSender mailSender;
    
    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.mail.from:}")
    private String mailFrom;
    
    @PostMapping("/email")
    public ResponseEntity<?> testEmail(@RequestBody Map<String, String> request) {
        String toEmail = request.get("email");
        if (toEmail == null || toEmail.isEmpty()) {
            toEmail = adminEmail;
        }
        
        try {
            if (mailSender == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Email service is not configured. Please set EMAIL_USER and EMAIL_PASS.");
                return ResponseEntity.badRequest().body(error);
            }
            
            SimpleMailMessage message = new SimpleMailMessage();
            if (mailFrom != null && !mailFrom.trim().isEmpty()) {
                message.setFrom(mailFrom.trim());
            }
            message.setTo(toEmail);
            message.setSubject("Test Email - Kitenge Bora");
            message.setText(
                "Hello,\n\n" +
                "This is a test email from Kitenge Bora.\n\n" +
                "If you received this email, your email configuration is working correctly!\n\n" +
                "Best regards,\n" +
                "Kitenge Bora Team"
            );
            
            mailSender.send(message);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Test email sent successfully to: " + toEmail);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to send test email: " + e.getMessage());
            error.put("details", e.getClass().getSimpleName());
            return ResponseEntity.badRequest().body(error);
        }
    }
}

