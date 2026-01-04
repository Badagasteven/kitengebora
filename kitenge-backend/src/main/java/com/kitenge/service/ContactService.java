package com.kitenge.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ContactService {
    
    private final JavaMailSender mailSender;
    
    @Value("${app.admin.email:kitengeboraa@gmail.com}")
    private String adminEmail;
    
    public void sendContactMessage(String name, String email, String subject, String message) {
        try {
            // Send email to all admins
            String[] adminEmails = adminEmail.split(",");
            for (String admin : adminEmails) {
                SimpleMailMessage adminMessage = new SimpleMailMessage();
                adminMessage.setTo(admin.trim());
                adminMessage.setSubject("New Contact Form Message: " + subject);
                adminMessage.setText(
                    "You have received a new message from the contact form:\n\n" +
                    "Name: " + name + "\n" +
                    "Email: " + email + "\n" +
                    "Subject: " + subject + "\n\n" +
                    "Message:\n" + message + "\n\n" +
                    "---\n" +
                    "Reply to: " + email
                );
                mailSender.send(adminMessage);
            }
            
            // Send confirmation email to user
            SimpleMailMessage confirmationMessage = new SimpleMailMessage();
            confirmationMessage.setTo(email);
            confirmationMessage.setSubject("Thank you for contacting Kitenge Bora");
            confirmationMessage.setText(
                "Dear " + name + ",\n\n" +
                "Thank you for contacting Kitenge Bora. We have received your message and will get back to you as soon as possible.\n\n" +
                "Your message:\n" +
                "Subject: " + subject + "\n" +
                "Message: " + message + "\n\n" +
                "Best regards,\n" +
                "Kitenge Bora Team"
            );
            mailSender.send(confirmationMessage);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send contact message: " + e.getMessage());
        }
    }
}

