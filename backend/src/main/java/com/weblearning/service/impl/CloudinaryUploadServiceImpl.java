package com.weblearning.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.weblearning.service.CloudinaryUploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryUploadServiceImpl implements CloudinaryUploadService {

    private final Cloudinary cloudinary;

    @Override
    public String uploadVideo(MultipartFile file, Long lessonId) {
        validateExtension(file, ".mp4", "Video file must be .mp4");
        return upload(file, lessonId, "video", "videos");
    }

    private String upload(MultipartFile file, Long lessonId, String resourceType, String folderName) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is required");
        }

        try {
            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "resource_type", resourceType,
                    "folder", "weblearning/lessons/" + lessonId + "/" + folderName
            ));
            Object secureUrl = result.get("secure_url");
            if (secureUrl == null) {
                throw new IllegalStateException("Cloudinary did not return secure_url");
            }
            return secureUrl.toString();
        } catch (IOException ex) {
            throw new RuntimeException("Could not read uploaded file", ex);
        }
    }

    private void validateExtension(MultipartFile file, String extension, String message) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is required");
        }

        String filename = file.getOriginalFilename();
        if (filename == null || !filename.toLowerCase(Locale.ROOT).endsWith(extension)) {
            throw new IllegalArgumentException(message);
        }
    }
}
