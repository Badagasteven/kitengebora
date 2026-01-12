package com.kitenge.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.kitenge.config.UploadDirectoryProvider;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import java.util.Set;

@Service
public class FileStorageService {
    
    private final Path uploadDir;
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp"
    );
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(".jpg", ".jpeg", ".png", ".webp");
    
    public FileStorageService(UploadDirectoryProvider uploadDirectoryProvider) {
        this.uploadDir = uploadDirectoryProvider.getUploadDir();
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
            String filename = System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 8) + extension;
            
            Path targetLocation = this.uploadDir.resolve(filename);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            
            // Return relative path - frontend will construct full URL
            return "/uploads/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("Could not store file", e);
        }
    }
}

