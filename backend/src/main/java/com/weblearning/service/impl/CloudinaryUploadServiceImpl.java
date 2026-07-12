package com.weblearning.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.weblearning.service.CloudinaryUploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryUploadServiceImpl implements CloudinaryUploadService {

    private static final List<String> VIDEO_EXTENSIONS = List.of(".mp4", ".webm", ".mov");
    private static final List<String> DOCUMENT_EXTENSIONS = List.of(".pdf", ".doc", ".docx", ".ppt", ".pptx");
    private static final List<String> IMAGE_EXTENSIONS = List.of(".jpg", ".jpeg", ".png", ".webp", ".gif");

    private final Cloudinary cloudinary;

    @Override
    public String uploadVideo(MultipartFile file, Long lessonId) {
        validateExtensions(file, VIDEO_EXTENSIONS, "Video chỉ hỗ trợ: .mp4, .webm, .mov");
        return upload(file, lessonId, "video", "videos");
    }

    @Override
    public String uploadDocument(MultipartFile file, Long lessonId) {
        validateExtensions(file, DOCUMENT_EXTENSIONS, "Tài liệu chỉ hỗ trợ: .pdf, .doc, .docx, .ppt, .pptx");
        return upload(file, lessonId, "raw", "documents");
    }

    @Override
    public String uploadThumbnail(MultipartFile file) {
        validateExtensions(file, IMAGE_EXTENSIONS, "Ảnh thumbnail chỉ hỗ trợ: .jpg, .jpeg, .png, .webp, .gif");
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is required");
        }

        try {
            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "folder", "weblearning/courses/thumbnails"
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

    private void validateExtensions(MultipartFile file, List<String> extensions, String message) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is required");
        }

        String filename = file.getOriginalFilename();
        if (filename == null) {
            throw new IllegalArgumentException(message);
        }

        String lowerName = filename.toLowerCase(Locale.ROOT);
        boolean matched = extensions.stream().anyMatch(lowerName::endsWith);
        if (!matched) {
            throw new IllegalArgumentException(message);
        }
    }
}
