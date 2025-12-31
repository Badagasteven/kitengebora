package com.kitenge.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Value("${file.upload-dir}")
    private String uploadDir;
    
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + Paths.get(uploadDir).toAbsolutePath().normalize() + "/");
    }
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // Get allowed origins from environment variable or use defaults
        String allowedOriginsEnv = System.getenv("APP_CORS_ALLOWED_ORIGINS");
        String[] allowedOrigins;
        if (allowedOriginsEnv != null && !allowedOriginsEnv.isEmpty()) {
            allowedOrigins = allowedOriginsEnv.split(",");
        } else {
            allowedOrigins = new String[]{"http://localhost:8080", "http://localhost:4000", "http://localhost:3000"};
        }
        
        registry.addMapping("/**")
                .allowedOrigins(allowedOrigins)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}

