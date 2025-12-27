package com.kitenge.controller;

import com.kitenge.dto.OrderRequest;
import com.kitenge.model.Order;
import com.kitenge.service.OrderService;
import com.kitenge.service.WhatsAppService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class OrderController {
    
    private final OrderService orderService;
    private final WhatsAppService whatsAppService;
    
    @GetMapping("/orders")
    public ResponseEntity<?> getAllOrders() {
        try {
            List<Order> orders = orderService.getAllOrders();
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to load orders: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    @GetMapping("/orders/my-orders")
    public ResponseEntity<?> getMyOrders() {
        try {
            // Get userId from authentication
            Long userId = null;
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> principal = (Map<String, Object>) authentication.getPrincipal();
                Object userIdObj = principal.get("userId");
                if (userIdObj instanceof Number) {
                    userId = ((Number) userIdObj).longValue();
                }
            }
            
            if (userId == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "User not authenticated");
                return ResponseEntity.status(401).body(error);
            }
            
            List<Order> orders = orderService.getOrdersByUserId(userId);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to load orders: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    @GetMapping("/orders/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable Long id) {
        try {
            return orderService.getOrderById(id)
                    .map(order -> {
                        Map<String, Object> response = new HashMap<>();
                        response.put("order", order);
                        response.put("items", order.getItems());
                        return ResponseEntity.ok(response);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to load order: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    @PostMapping("/orders")
    public ResponseEntity<?> createOrder(@Valid @RequestBody OrderRequest request) {
        try {
            // Get userId from authentication if user is logged in
            Long userId = null;
            try {
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                System.out.println("=== ORDER CREATION DEBUG ===");
                System.out.println("Authentication: " + (authentication != null ? "present" : "null"));
                if (authentication != null) {
                    System.out.println("Is Authenticated: " + authentication.isAuthenticated());
                    System.out.println("Name: " + authentication.getName());
                    System.out.println("Principal type: " + (authentication.getPrincipal() != null ? authentication.getPrincipal().getClass().getName() : "null"));
                    
                    if (authentication.isAuthenticated() && 
                        !authentication.getName().equals("anonymousUser") &&
                        authentication.getPrincipal() instanceof Map) {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> principal = (Map<String, Object>) authentication.getPrincipal();
                        System.out.println("Principal keys: " + principal.keySet());
                        Object userIdObj = principal.get("userId");
                        System.out.println("userIdObj: " + userIdObj + " (type: " + (userIdObj != null ? userIdObj.getClass().getName() : "null") + ")");
                        
                        if (userIdObj != null) {
                            if (userIdObj instanceof Number) {
                                userId = ((Number) userIdObj).longValue();
                            } else if (userIdObj instanceof String) {
                                try {
                                    userId = Long.parseLong((String) userIdObj);
                                } catch (NumberFormatException e) {
                                    System.err.println("Failed to parse userId as Long: " + userIdObj);
                                }
                            }
                        }
                        System.out.println("Final userId: " + userId);
                    } else {
                        System.out.println("Order creation - No valid authentication (anonymous or not Map)");
                    }
                }
                System.out.println("===========================");
            } catch (Exception e) {
                System.err.println("Error extracting userId from authentication: " + e.getMessage());
                e.printStackTrace();
                // Continue with userId = null for guest checkout
            }
            
            Order order = orderService.createOrder(request, userId);
            System.out.println("Order created with userId: " + order.getUserId());
            
            // Send WhatsApp notification with images (or generate URL as fallback)
            String adminWhatsAppUrl = null;
            try {
                System.out.println("=== SENDING WHATSAPP NOTIFICATION WITH IMAGES ===");
                System.out.println("Order ID: " + order.getId());
                adminWhatsAppUrl = whatsAppService.sendOrderWithImages(order);
                if (adminWhatsAppUrl != null) {
                    System.out.println("✅ WhatsApp notification processed successfully");
                    System.out.println("URL: " + adminWhatsAppUrl);
                } else {
                    System.err.println("❌ Failed to process WhatsApp notification - returned null");
                }
            } catch (Exception e) {
                System.err.println("❌ Exception processing WhatsApp notification: " + e.getMessage());
                e.printStackTrace();
                // Fallback to URL generation
                try {
                    adminWhatsAppUrl = whatsAppService.generateOrderWhatsAppUrl(order);
                } catch (Exception e2) {
                    System.err.println("❌ Fallback URL generation also failed: " + e2.getMessage());
                }
            }
            
            // Generate WhatsApp URL for customer (optional - for customer confirmation)
            String customerWhatsAppUrl = null;
            if (order.getCustomerPhone() != null && !order.getCustomerPhone().trim().isEmpty()) {
                try {
                    System.out.println("Generating WhatsApp URL for customer phone: " + order.getCustomerPhone());
                    customerWhatsAppUrl = whatsAppService.generateCustomerWhatsAppUrl(order, order.getCustomerPhone());
                    System.out.println("Generated customer WhatsApp URL: " + customerWhatsAppUrl);
                } catch (Exception e) {
                    System.err.println("Failed to generate customer WhatsApp URL: " + e.getMessage());
                    e.printStackTrace();
                }
            } else {
                System.out.println("No customer phone provided, skipping customer WhatsApp URL generation");
            }
            
            // Return order with WhatsApp URLs
            Map<String, Object> response = new HashMap<>();
            response.put("order", order);
            if (adminWhatsAppUrl != null && !adminWhatsAppUrl.isEmpty()) {
                response.put("adminWhatsAppUrl", adminWhatsAppUrl);
                System.out.println("✅ Including adminWhatsAppUrl in response");
            } else {
                System.err.println("❌ adminWhatsAppUrl is null or empty - NOT including in response");
            }
            if (customerWhatsAppUrl != null) {
                response.put("customerWhatsAppUrl", customerWhatsAppUrl);
                System.out.println("Including customerWhatsAppUrl in response");
            }
            System.out.println("Response keys: " + response.keySet());
            System.out.println("=============================================");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Order failed: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    @DeleteMapping("/orders/{id}")
    public ResponseEntity<Map<String, Boolean>> deleteOrder(@PathVariable Long id) {
        try {
            orderService.deleteOrder(id);
            Map<String, Boolean> response = new HashMap<>();
            response.put("success", true);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/orders/{id}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        try {
            String status = request.get("status");
            String trackingNumber = request.get("trackingNumber");
            
            if (status == null || status.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Status is required"));
            }
            
            Order order = orderService.updateOrderStatus(id, status, trackingNumber);
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/orders/{id}/track")
    public ResponseEntity<?> trackOrder(@PathVariable Long id) {
        try {
            Order order = orderService.getOrderById(id)
                    .orElseThrow(() -> new RuntimeException("Order not found"));
            
            Map<String, Object> trackingInfo = new HashMap<>();
            trackingInfo.put("orderId", order.getId());
            trackingInfo.put("status", order.getStatus());
            trackingInfo.put("trackingNumber", order.getTrackingNumber());
            trackingInfo.put("createdAt", order.getCreatedAt());
            trackingInfo.put("shippedAt", order.getShippedAt());
            trackingInfo.put("deliveredAt", order.getDeliveredAt());
            
            return ResponseEntity.ok(trackingInfo);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}

