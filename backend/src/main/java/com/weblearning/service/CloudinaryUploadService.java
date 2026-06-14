package com.weblearning.service;

import org.springframework.web.multipart.MultipartFile;

public interface CloudinaryUploadService {
    String uploadVideo(MultipartFile file, Long lessonId);

    String uploadDocument(MultipartFile file, Long lessonId);
}
