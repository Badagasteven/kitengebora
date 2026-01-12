package com.kitenge.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class CloudinaryProvider {

    private final Cloudinary cloudinary;
    private final boolean configured;

    public CloudinaryProvider(
            @Value("${cloudinary.url:}") String cloudinaryUrl,
            @Value("${cloudinary.cloud.name:}") String cloudName,
            @Value("${cloudinary.api.key:}") String apiKey,
            @Value("${cloudinary.api.secret:}") String apiSecret
    ) {
        Cloudinary resolvedCloudinary = null;
        boolean isConfigured = false;

        if (cloudinaryUrl != null && !cloudinaryUrl.isBlank()) {
            resolvedCloudinary = new Cloudinary(cloudinaryUrl);
            isConfigured = true;
        } else if (cloudName != null && !cloudName.isBlank()
                && apiKey != null && !apiKey.isBlank()
                && apiSecret != null && !apiSecret.isBlank()) {
            resolvedCloudinary = new Cloudinary(ObjectUtils.asMap(
                    "cloud_name", cloudName,
                    "api_key", apiKey,
                    "api_secret", apiSecret,
                    "secure", true
            ));
            isConfigured = true;
        }

        if (resolvedCloudinary != null) {
            resolvedCloudinary.config.secure = true;
        }

        this.cloudinary = resolvedCloudinary;
        this.configured = isConfigured;
    }

    public boolean isConfigured() {
        return configured;
    }

    public Cloudinary getCloudinary() {
        return cloudinary;
    }
}
