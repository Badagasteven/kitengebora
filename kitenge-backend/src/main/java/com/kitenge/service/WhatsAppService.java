package com.kitenge.service;

import com.kitenge.model.Order;
import com.kitenge.model.OrderItem;
import com.kitenge.model.Product;
import com.kitenge.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class WhatsAppService {
    
    @Value("${app.admin.whatsapp:250788883986}")
    private String adminWhatsApp;
    
    @Value("${app.whatsapp.callmebot.apikey:}")
    private String callMeBotApiKey;
    
    @Value("${app.whatsapp.greenapi.idinstance:}")
    private String greenApiIdInstance;
    
    @Value("${app.whatsapp.greenapi.apitoken:}")
    private String greenApiToken;
    
    @Value("${app.whatsapp.chatapi.instance:}")
    private String chatApiInstance;
    
    @Value("${app.whatsapp.chatapi.token:}")
    private String chatApiToken;
    
    @Value("${app.base.url:http://localhost:8082}")
    private String baseUrl;
    
    @Value("${server.port:8082}")
    private String serverPort;
    
    private final RestTemplate restTemplate = new RestTemplate();
    private final ProductRepository productRepository;
    
    /**
     * Generates WhatsApp URL for order notification to admin
     */
    public String generateOrderWhatsAppUrl(Order order) {
        return generateAdminWhatsAppUrl(order);
    }
    
    /**
     * Generates WhatsApp URL for customer to send order to admin
     */
    public String generateCustomerWhatsAppUrl(Order order, String customerPhone) {
        try {
            StringBuilder message = new StringBuilder();
            Integer orderNumber = order.getOrderNumber() != null ? order.getOrderNumber() : order.getId().intValue();
            message.append("🧵 *ORDER CONFIRMATION #").append(orderNumber).append("*\n\n");
            message.append("Thank you for your order!\n\n");
            message.append("📋 *Order Details:*\n");
            message.append("Order Number: #").append(orderNumber).append("\n");
            message.append("Status: PENDING\n\n");
            
            message.append("🛍️ *Items:*\n");
            for (OrderItem item : order.getItems()) {
                message.append("• Product ID: ").append(item.getProductId())
                       .append(" - Qty: ").append(item.getQuantity())
                       .append(" @ ").append(item.getUnitPrice()).append(" RWF\n");
            }
            
            message.append("\n💰 *Subtotal:* ").append(order.getSubtotal()).append(" RWF\n");
            if (order.getDeliveryFee() != null && order.getDeliveryFee() > 0) {
                message.append("🚚 *Delivery Fee:* ").append(order.getDeliveryFee()).append(" RWF\n");
            }
            int total = order.getSubtotal() + (order.getDeliveryFee() != null ? order.getDeliveryFee() : 0);
            message.append("💵 *Total:* ").append(total).append(" RWF\n\n");
            
            message.append("We'll contact you soon to confirm your order!\n\n");
            message.append("For inquiries, contact us at: ").append(adminWhatsApp);
            
            // Clean phone number (remove any non-digit characters except +)
            String cleanPhone = customerPhone.replaceAll("[^0-9+]", "");
            
            // Handle Rwanda phone numbers: if starts with 0, replace with 250
            if (cleanPhone.startsWith("0")) {
                cleanPhone = "250" + cleanPhone.substring(1);
            } else if (cleanPhone.startsWith("+")) {
                cleanPhone = cleanPhone.substring(1);
            } else if (!cleanPhone.startsWith("250") && cleanPhone.length() == 9) {
                // If it's a 9-digit number without country code, assume Rwanda
                cleanPhone = "250" + cleanPhone;
            }
            
            String encodedMessage = URLEncoder.encode(message.toString(), StandardCharsets.UTF_8);
            String whatsappUrl = "https://wa.me/" + cleanPhone + "?text=" + encodedMessage;
            System.out.println("Generated customer WhatsApp URL: " + whatsappUrl);
            return whatsappUrl;
        } catch (Exception e) {
            System.err.println("Failed to generate customer WhatsApp URL: " + e.getMessage());
            return null;
        }
    }
    
    /**
     * Sends order notification with images via WhatsApp API
     * Falls back to URL generation if API is not configured
     */
    public String sendOrderWithImages(Order order) {
        try {
            // Build message text
            StringBuilder messageText = new StringBuilder();
            Integer orderNumber = order.getOrderNumber() != null ? order.getOrderNumber() : order.getId().intValue();
            messageText.append("╔═══════════════════════════════════╗\n");
            messageText.append("║   *NEW ORDER #").append(orderNumber).append("*   ║\n");
            messageText.append("╚═══════════════════════════════════╝\n\n");
            
            messageText.append("*CUSTOMER DETAILS*\n");
            messageText.append("─────────────────────────────────────\n");
            if (order.getCustomerName() != null && !order.getCustomerName().trim().isEmpty() && !order.getCustomerName().equals("Guest Customer")) {
                messageText.append("► Name: ").append(order.getCustomerName()).append("\n");
            }
            messageText.append("► Phone: ").append(order.getCustomerPhone()).append("\n");
            messageText.append("► Channel: ").append(order.getChannel() != null ? order.getChannel().toUpperCase() : "STORE").append("\n\n");
            
            messageText.append("*ORDER ITEMS*\n");
            messageText.append("─────────────────────────────────────\n");
            
            // Collect product images
            java.util.List<String> productImages = new java.util.ArrayList<>();
            int itemNumber = 1;
            for (OrderItem item : order.getItems()) {
                String productName = "Product #" + item.getProductId();
                String productImage = null;
                try {
                    Optional<Product> productOpt = productRepository.findById(item.getProductId());
                    if (productOpt.isPresent()) {
                        Product product = productOpt.get();
                        productName = product.getName();
                        if (product.getImage() != null && !product.getImage().trim().isEmpty()) {
                            String imagePath = product.getImage();
                            if (imagePath.startsWith("/")) {
                                productImage = baseUrl + imagePath;
                            } else if (!imagePath.startsWith("http")) {
                                productImage = baseUrl + "/" + imagePath;
                            } else {
                                productImage = imagePath;
                            }
                            productImages.add(productImage);
                        }
                    }
                } catch (Exception e) {
                    // Use product ID if fetch fails
                }
                
                int itemTotal = item.getQuantity() * item.getUnitPrice();
                messageText.append("\n").append(itemNumber).append(". *").append(productName).append("*\n");
                messageText.append("   [Qty] ").append(item.getQuantity()).append("\n");
                messageText.append("   [Price] ").append(item.getUnitPrice()).append(" RWF\n");
                messageText.append("   [Subtotal] ").append(itemTotal).append(" RWF\n");
                itemNumber++;
            }
            
            messageText.append("\n─────────────────────────────────────\n");
            messageText.append("*PAYMENT SUMMARY*\n");
            messageText.append("─────────────────────────────────────\n");
            messageText.append("Subtotal: ").append(order.getSubtotal()).append(" RWF\n");
            
            if (order.getDeliveryOption() != null && !order.getDeliveryOption().isEmpty()) {
                String deliveryLabel = order.getDeliveryOption();
                if (deliveryLabel.equalsIgnoreCase("pickup")) {
                    deliveryLabel = "Pickup (Free)";
                } else if (deliveryLabel.equalsIgnoreCase("kigali")) {
                    deliveryLabel = "Kigali Delivery";
                } else if (deliveryLabel.equalsIgnoreCase("upcountry")) {
                    deliveryLabel = "Upcountry Delivery";
                }
                messageText.append("Delivery: ").append(deliveryLabel);
                if (order.getDeliveryFee() != null && order.getDeliveryFee() > 0) {
                    messageText.append(" (").append(order.getDeliveryFee()).append(" RWF)");
                } else {
                    messageText.append(" (Free)");
                }
                messageText.append("\n");
                
                // Add delivery location if provided and not pickup
                if (!deliveryLabel.equalsIgnoreCase("pickup") && order.getDeliveryLocation() != null && !order.getDeliveryLocation().trim().isEmpty()) {
                    messageText.append("Location: ").append(order.getDeliveryLocation()).append("\n");
                }
            }
            
            int total = order.getSubtotal() + (order.getDeliveryFee() != null ? order.getDeliveryFee() : 0);
            messageText.append("─────────────────────────────────────\n");
            messageText.append("*TOTAL: ").append(total).append(" RWF*\n");
            messageText.append("─────────────────────────────────────\n\n");
            messageText.append("Please process this order. Thank you!");
            
            String message = messageText.toString();
            String cleanPhone = adminWhatsApp.replaceAll("[^0-9+]", "");
            if (cleanPhone.startsWith("+")) {
                cleanPhone = cleanPhone.substring(1);
            }
            
            // Try to send with images via Green API
            if (greenApiIdInstance != null && !greenApiIdInstance.isEmpty() && 
                greenApiToken != null && !greenApiToken.isEmpty()) {
                try {
                    sendViaGreenAPI(cleanPhone, message, productImages);
                    System.out.println("✅ Order notification sent with images via Green API");
                    return generateAdminWhatsAppUrl(order); // Return URL as fallback reference
                } catch (Exception e) {
                    System.out.println("⚠️ Green API failed: " + e.getMessage());
                }
            }
            
            // Try to send with images via ChatAPI
            if (chatApiInstance != null && !chatApiInstance.isEmpty() && 
                chatApiToken != null && !chatApiToken.isEmpty()) {
                try {
                    sendViaChatAPI(cleanPhone, message, productImages);
                    System.out.println("✅ Order notification sent with images via ChatAPI");
                    return generateAdminWhatsAppUrl(order);
                } catch (Exception e) {
                    System.out.println("⚠️ ChatAPI failed: " + e.getMessage());
                }
            }
            
            // Fallback to URL generation
            System.out.println("ℹ️ No WhatsApp API configured for images. Using URL-based message.");
            return generateAdminWhatsAppUrl(order);
            
        } catch (Exception e) {
            System.err.println("❌ Failed to send order with images: " + e.getMessage());
            e.printStackTrace();
            return generateAdminWhatsAppUrl(order);
        }
    }
    
    /**
     * Sends message with images via Green API
     */
    private void sendViaGreenAPI(String phoneNumber, String message, java.util.List<String> imageUrls) {
        try {
            // First send text message
            String textUrl = "https://api.green-api.com/waInstance" + greenApiIdInstance 
                           + "/sendMessage/" + greenApiToken;
            Map<String, Object> textPayload = new HashMap<>();
            textPayload.put("chatId", phoneNumber + "@c.us");
            textPayload.put("message", message);
            restTemplate.postForObject(textUrl, textPayload, String.class);
            
            // Then send images
            for (String imageUrl : imageUrls) {
                try {
                    String imageApiUrl = "https://api.green-api.com/waInstance" + greenApiIdInstance 
                                       + "/sendFileByUrl/" + greenApiToken;
                    Map<String, Object> imagePayload = new HashMap<>();
                    imagePayload.put("chatId", phoneNumber + "@c.us");
                    imagePayload.put("urlFile", imageUrl);
                    imagePayload.put("fileName", "product.jpg");
                    imagePayload.put("caption", "");
                    restTemplate.postForObject(imageApiUrl, imagePayload, String.class);
                    Thread.sleep(500); // Small delay between images
                } catch (Exception e) {
                    System.out.println("⚠️ Failed to send image " + imageUrl + ": " + e.getMessage());
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Green API error: " + e.getMessage(), e);
        }
    }
    
    /**
     * Sends message with images via ChatAPI
     */
    private void sendViaChatAPI(String phoneNumber, String message, java.util.List<String> imageUrls) {
        try {
            // First send text message
            String textUrl = "https://api.chat-api.com/instance" + chatApiInstance + "/sendMessage?token=" + chatApiToken;
            Map<String, Object> textPayload = new HashMap<>();
            textPayload.put("phone", phoneNumber);
            textPayload.put("body", message);
            restTemplate.postForObject(textUrl, textPayload, String.class);
            
            // Then send images
            for (String imageUrl : imageUrls) {
                try {
                    String imageApiUrl = "https://api.chat-api.com/instance" + chatApiInstance + "/sendFile?token=" + chatApiToken;
                    Map<String, Object> imagePayload = new HashMap<>();
                    imagePayload.put("phone", phoneNumber);
                    imagePayload.put("body", imageUrl);
                    imagePayload.put("filename", "product.jpg");
                    restTemplate.postForObject(imageApiUrl, imagePayload, String.class);
                    Thread.sleep(500); // Small delay between images
                } catch (Exception e) {
                    System.out.println("⚠️ Failed to send image " + imageUrl + ": " + e.getMessage());
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("ChatAPI error: " + e.getMessage(), e);
        }
    }
    
    /**
     * Generates WhatsApp URL for admin notification
     */
    public String generateAdminWhatsAppUrl(Order order) {
        try {
            System.out.println("=== GENERATING ADMIN WHATSAPP URL ===");
            System.out.println("Order ID: " + order.getId());
            System.out.println("Order items count: " + (order.getItems() != null ? order.getItems().size() : 0));
            System.out.println("Admin WhatsApp number: " + adminWhatsApp);
            
            StringBuilder message = new StringBuilder();
            Integer orderNumber = order.getOrderNumber() != null ? order.getOrderNumber() : order.getId().intValue();
            message.append("╔═══════════════════════════════════╗\n");
            message.append("║   *NEW ORDER #").append(orderNumber).append("*   ║\n");
            message.append("╚═══════════════════════════════════╝\n\n");
            
            message.append("*CUSTOMER DETAILS*\n");
            message.append("─────────────────────────────────────\n");
            if (order.getCustomerName() != null && !order.getCustomerName().trim().isEmpty() && !order.getCustomerName().equals("Guest Customer")) {
                message.append("► Name: ").append(order.getCustomerName()).append("\n");
            }
            message.append("► Phone: ").append(order.getCustomerPhone()).append("\n");
            message.append("► Channel: ").append(order.getChannel() != null ? order.getChannel().toUpperCase() : "STORE").append("\n\n");
            
            message.append("*ORDER ITEMS*\n");
            message.append("─────────────────────────────────────\n");
            
            int itemNumber = 1;
            for (OrderItem item : order.getItems()) {
                String productName = "Product #" + item.getProductId();
                try {
                    Optional<Product> productOpt = productRepository.findById(item.getProductId());
                    if (productOpt.isPresent()) {
                        Product product = productOpt.get();
                        productName = product.getName();
                    }
                } catch (Exception e) {
                    // Use product ID if fetch fails
                }
                
                int itemTotal = item.getQuantity() * item.getUnitPrice();
                message.append("\n").append(itemNumber).append(". *").append(productName).append("*\n");
                message.append("   [Qty] ").append(item.getQuantity()).append("\n");
                message.append("   [Price] ").append(item.getUnitPrice()).append(" RWF\n");
                message.append("   [Subtotal] ").append(itemTotal).append(" RWF\n");
                itemNumber++;
            }
            
            message.append("\n─────────────────────────────────────\n");
            message.append("*PAYMENT SUMMARY*\n");
            message.append("─────────────────────────────────────\n");
            message.append("Subtotal: ").append(order.getSubtotal()).append(" RWF\n");
            
            if (order.getDeliveryOption() != null && !order.getDeliveryOption().isEmpty()) {
                String deliveryLabel = order.getDeliveryOption();
                if (deliveryLabel.equalsIgnoreCase("pickup")) {
                    deliveryLabel = "Pickup (Free)";
                } else if (deliveryLabel.equalsIgnoreCase("kigali")) {
                    deliveryLabel = "Kigali Delivery";
                } else if (deliveryLabel.equalsIgnoreCase("upcountry")) {
                    deliveryLabel = "Upcountry Delivery";
                }
                message.append("Delivery: ").append(deliveryLabel);
                if (order.getDeliveryFee() != null && order.getDeliveryFee() > 0) {
                    message.append(" (").append(order.getDeliveryFee()).append(" RWF)");
                } else {
                    message.append(" (Free)");
                }
                message.append("\n");
                
                // Add delivery location if provided and not pickup
                if (!deliveryLabel.equalsIgnoreCase("pickup") && order.getDeliveryLocation() != null && !order.getDeliveryLocation().trim().isEmpty()) {
                    message.append("Location: ").append(order.getDeliveryLocation()).append("\n");
                }
            }
            
            int total = order.getSubtotal() + (order.getDeliveryFee() != null ? order.getDeliveryFee() : 0);
            message.append("─────────────────────────────────────\n");
            message.append("*TOTAL: ").append(total).append(" RWF*\n");
            message.append("─────────────────────────────────────\n\n");
            message.append("Please process this order. Thank you!");
            
            String messageText = message.toString();
            System.out.println("Message length: " + messageText.length());
            System.out.println("Message preview (first 200 chars): " + messageText.substring(0, Math.min(200, messageText.length())));
            
            String encodedMessage = URLEncoder.encode(messageText, StandardCharsets.UTF_8);
            String whatsappUrl = "https://wa.me/" + adminWhatsApp + "?text=" + encodedMessage;
            
            System.out.println("✅ WhatsApp URL generated successfully");
            System.out.println("URL length: " + whatsappUrl.length());
            System.out.println("URL preview: " + whatsappUrl.substring(0, Math.min(150, whatsappUrl.length())) + "...");
            System.out.println("=======================================");
            
            return whatsappUrl;
        } catch (Exception e) {
            System.err.println("❌ FAILED to generate WhatsApp URL: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }
    
    /**
     * Sends WhatsApp notification to admin when a new order is placed
     */
    public void sendOrderNotification(Order order) {
        try {
            Integer orderNumber = order.getOrderNumber() != null ? order.getOrderNumber() : order.getId().intValue();
            StringBuilder message = new StringBuilder();
            message.append("🧵 *NEW ORDER #").append(orderNumber).append("*\n\n");
            
            if (order.getCustomerName() != null && !order.getCustomerName().trim().isEmpty() && !order.getCustomerName().equals("Guest Customer")) {
                message.append("👤 *Customer:* ").append(order.getCustomerName()).append("\n");
            }
            message.append("📱 *Phone:* ").append(order.getCustomerPhone()).append("\n");
            message.append("📦 *Channel:* ").append(order.getChannel() != null ? order.getChannel() : "Store").append("\n\n");
            
            message.append("🛍️ *Items:*\n");
            for (OrderItem item : order.getItems()) {
                message.append("• ").append(item.getQuantity())
                       .append("x Product ID: ").append(item.getProductId())
                       .append(" @ ").append(item.getUnitPrice()).append(" RWF\n");
            }
            
            message.append("\n💰 *Subtotal:* ").append(order.getSubtotal()).append(" RWF\n");
            
            if (order.getDeliveryOption() != null && !order.getDeliveryOption().isEmpty()) {
                message.append("🚚 *Delivery:* ").append(order.getDeliveryOption());
                if (order.getDeliveryFee() != null && order.getDeliveryFee() > 0) {
                    message.append(" (").append(order.getDeliveryFee()).append(" RWF)");
                }
                message.append("\n");
            }
            
            int total = order.getSubtotal() + (order.getDeliveryFee() != null ? order.getDeliveryFee() : 0);
            message.append("💵 *Total:* ").append(total).append(" RWF\n");
            
            message.append("\n⏰ *Order Time:* ").append(order.getCreatedAt() != null ? order.getCreatedAt().toString() : "Now");
            
            // Send WhatsApp message using CallMeBot API (free service)
            sendWhatsAppMessage(adminWhatsApp, message.toString());
            
            System.out.println("WhatsApp notification sent to admin for order #" + orderNumber);
        } catch (Exception e) {
            System.err.println("Failed to send WhatsApp notification: " + e.getMessage());
            e.printStackTrace();
            // Log the URL as fallback
            logOrderNotification(order);
        }
    }
    
    /**
     * Sends WhatsApp message automatically to admin
     * Uses multiple methods to ensure message is sent
     */
    private void sendWhatsAppMessage(String phoneNumber, String message) {
        try {
            // Clean phone number
            String cleanPhone = phoneNumber.replaceAll("[^0-9+]", "");
            if (cleanPhone.startsWith("+")) {
                cleanPhone = cleanPhone.substring(1);
            }
            
            String encodedMessage = URLEncoder.encode(message, StandardCharsets.UTF_8);
            String whatsappUrl = "https://wa.me/" + cleanPhone + "?text=" + encodedMessage;
            
            boolean messageSent = false;
            
            // Method 1: Try CallMeBot API (free, requires one-time phone registration)
            // Get API key from: https://www.callmebot.com/whatsapp-api.php
            String apiKey = callMeBotApiKey;
            if (apiKey == null || apiKey.isEmpty()) {
                apiKey = System.getenv("CALLMEBOT_API_KEY");
            }
            
            if (apiKey != null && !apiKey.isEmpty()) {
                try {
                    String apiUrl = "https://api.callmebot.com/whatsapp.php?phone=" + cleanPhone 
                                  + "&text=" + encodedMessage 
                                  + "&apikey=" + apiKey;
                    String response = restTemplate.getForObject(apiUrl, String.class);
                    if (response != null && (response.contains("OK") || response.contains("sent") || response.contains("200"))) {
                        System.out.println("✅ WhatsApp message sent successfully via CallMeBot API");
                        messageSent = true;
                        return;
                    } else {
                        System.out.println("⚠️ CallMeBot API response: " + response);
                    }
                } catch (Exception e) {
                    System.out.println("⚠️ CallMeBot API call failed: " + e.getMessage());
                }
            }
            
            // Method 2: Try using WhatsApp Web API via evo-webhook or similar service
            // This attempts to send via HTTP if a webhook service is configured
            String webhookUrl = System.getenv("WHATSAPP_WEBHOOK_URL");
            if (webhookUrl == null || webhookUrl.isEmpty()) {
                webhookUrl = System.getProperty("app.whatsapp.webhook.url");
            }
            
            if (!messageSent && webhookUrl != null && !webhookUrl.isEmpty()) {
                try {
                    // Send message via webhook
                    Map<String, String> payload = new HashMap<>();
                    payload.put("phone", cleanPhone);
                    payload.put("message", message);
                    restTemplate.postForObject(webhookUrl, payload, String.class);
                    System.out.println("✅ WhatsApp message sent via webhook");
                    messageSent = true;
                    return;
                } catch (Exception e) {
                    System.out.println("⚠️ Webhook call failed: " + e.getMessage());
                }
            }
            
            // Method 3: Try using WhatsApp API via direct HTTP (for services like Green API, etc.)
            // This is a fallback for other WhatsApp API services
            
            // If no API is configured, log the URL prominently so admin can see it
            if (!messageSent) {
                System.out.println("\n" + "=".repeat(60));
                System.out.println("📱 WHATSAPP NOTIFICATION - NEW ORDER #" + (message.contains("ORDER #") ? 
                    message.substring(message.indexOf("ORDER #") + 7, message.indexOf("*", message.indexOf("ORDER #") + 7)) : ""));
                System.out.println("=".repeat(60));
                System.out.println("Click this URL to open WhatsApp with the order details:");
                System.out.println(whatsappUrl);
                System.out.println("=".repeat(60));
                System.out.println("\n💡 To enable AUTOMATIC WhatsApp notifications (no manual clicking needed):");
                System.out.println("   Option 1 - CallMeBot (Free, 2 min setup):");
                System.out.println("      1. Go to: https://www.callmebot.com/whatsapp-api.php");
                System.out.println("      2. Register your phone number: " + cleanPhone);
                System.out.println("      3. Get your API key");
                System.out.println("      4. Add to application.properties:");
                System.out.println("         app.whatsapp.callmebot.apikey=YOUR_API_KEY_HERE");
                System.out.println("      5. Restart the backend server");
                System.out.println("\n   Option 2 - Use environment variable:");
                System.out.println("      CALLMEBOT_API_KEY=YOUR_API_KEY_HERE");
                System.out.println("=".repeat(60) + "\n");
            }
            
        } catch (Exception e) {
            System.err.println("❌ Error sending WhatsApp message: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    /**
     * Logs order details (for debugging)
     */
    public void logOrderNotification(Order order) {
        Integer orderNumber = order.getOrderNumber() != null ? order.getOrderNumber() : order.getId().intValue();
        System.out.println("\n=== NEW ORDER NOTIFICATION ===");
        System.out.println("Order ID: " + order.getId());
        System.out.println("Order Number: " + orderNumber);
        System.out.println("Customer: " + (order.getCustomerName() != null ? order.getCustomerName() : "N/A"));
        System.out.println("Phone: " + order.getCustomerPhone());
        System.out.println("Total: " + (order.getSubtotal() + (order.getDeliveryFee() != null ? order.getDeliveryFee() : 0)) + " RWF");
        System.out.println("WhatsApp URL: " + generateOrderWhatsAppUrl(order));
        System.out.println("=============================\n");
    }
}

