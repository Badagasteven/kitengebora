package com.kitenge.config;

import com.kitenge.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/uploads/**").permitAll() // Allow public access to uploaded images
                .requestMatchers("/api/register", "/api/login", "/api/public-products").permitAll()
                .requestMatchers("/api/forgot-password", "/api/reset-password").permitAll()
                .requestMatchers("/api/verify-email", "/api/resend-verification").permitAll()
                .requestMatchers("/api/test/email").permitAll() // Allow email testing
                .requestMatchers("/api/contact").permitAll() // Contact form (public)
                .requestMatchers("/api/orders").permitAll() // POST orders (customers can place orders, but userId will be set if authenticated)
                .requestMatchers("/api/orders/my-orders").authenticated() // Users can get their own orders
                .requestMatchers("/api/orders/*/track").authenticated() // Allow authenticated users to track their own orders
                .requestMatchers("/api/products/**", "/api/upload-image").hasAnyRole("ADMIN", "MANAGER", "STAFF")
                .requestMatchers("/api/orders/**").hasAnyRole("ADMIN", "MANAGER", "STAFF") // Order management
                .requestMatchers("/api/stats/**").hasAnyRole("ADMIN", "MANAGER") // Business stats (admin/manager only)
                .requestMatchers(
                    "/api/users/profile",
                    "/api/users/change-password",
                    "/api/users/addresses",
                    "/api/users/addresses/**",
                    "/api/users/preferences",
                    "/api/users/notifications"
                ).authenticated() // User profile settings (authenticated users)
                .requestMatchers("/api/users/**").hasAnyRole("ADMIN", "MANAGER") // User management (admin/manager only) - must come after specific routes
                .requestMatchers("/api/wishlist/**", "/api/check-auth").authenticated()
                .requestMatchers("/api/reviews").authenticated() // POST/DELETE reviews require auth
                .requestMatchers("/api/reviews/**").permitAll() // GET reviews are public
                .anyRequest().permitAll()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Get allowed origins from environment variable or use defaults
        String allowedOriginsEnv = System.getenv("APP_CORS_ALLOWED_ORIGINS");
        if (allowedOriginsEnv != null && !allowedOriginsEnv.isEmpty()) {
            configuration.setAllowedOrigins(Arrays.asList(allowedOriginsEnv.split(",")));
        } else {
            configuration.setAllowedOrigins(List.of(
                "http://localhost:8082", 
                "http://localhost:4000", 
                "http://localhost:3000"
            ));
        }
        
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(List.of("Authorization"));
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}

