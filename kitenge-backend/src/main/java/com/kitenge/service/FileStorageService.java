package com.kitenge.service;

import com.kitenge.config.CloudinaryProvider;
import com.kitenge.config.UploadDirectoryProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.Set;

@Service
public class FileStorageService {
    
    private final Path uploadDir;
    private final CloudinaryProvider cloudinaryProvider;
    private final boolean useCloudinary;
    private final String cloudinaryFolder;
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp"
    );
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(".jpg", ".jpeg", ".png", ".webp");
    
    public FileStorageService(
            UploadDirectoryProvider uploadDirectoryProvider,
            CloudinaryProvider cloudinaryProvider,
            @Value("${file.storage:auto}") String storageMode,
            @Value("${cloudinary.folder:}") String cloudinaryFolder
    ) {
        this.uploadDir = uploadDirectoryProvider.getUploadDir();
        this.cloudinaryProvider = cloudinaryProvider;
        this.cloudinaryFolder = cloudinaryFolder == null ? "" : cloudinaryFolder.trim();
        this.useCloudinary = resolveUseCloudinary(storageMode, cloudinaryProvider.isConfigured());
        try {
            Files.createDirectories(this.uploadDir);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory", e);
        }
    }
    
    public String storeFile(MultipartFile file) {
        try {
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String contentType = file.getContentType();
            if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
                throw new RuntimeException("Unsupported file type");
            }
            if (extension.isEmpty() || !ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
                throw new RuntimeException("Unsupported file extension");
            }

            if (useCloudinary) {
                return uploadToCloudinary(file);
            }

            String filename = System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 8) + extension;
            
            Path targetLocation = this.uploadDir.resolve(filename);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            
            // Return relative path - frontend will construct full URL
            return "/uploads/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("Could not store file", e);
        }
    }

    private boolean resolveUseCloudinary(String storageMode, boolean cloudinaryConfigured) {
        String mode = storageMode == null ? "" : storageMode.trim().toLowerCase();
        if ("cloudinary".equals(mode)) {
            if (!cloudinaryConfigured) {
                throw new IllegalStateException("Cloudinary storage selected but not configured");
            }
            return true;
        }
        if ("local".equals(mode)) {
            return false;
        }
        return cloudinaryConfigured;
    }

    private String uploadToCloudinary(MultipartFile file) {
        try {
            Map<String, Object> options = new HashMap<>();
            options.put("resource_type", "image");
            if (!cloudinaryFolder.isBlank()) {
                options.put("folder", cloudinaryFolder);
            }

            Map<?, ?> result = cloudinaryProvider.getCloudinary().uploader()
                    .upload(file.getBytes(), options);
            Object secureUrl = result.get("secure_url");
            if (secureUrl != null) {
                return secureUrl.toString();
            }
            Object url = result.get("url");
            if (url != null) {
                return url.toString();
            }
            throw new RuntimeException("Cloudinary upload did not return a URL");
        } catch (IOException e) {
            throw new RuntimeException("Could not upload file to Cloudinary", e);
        }
    }
}

