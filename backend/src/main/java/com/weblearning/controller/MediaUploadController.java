package com.weblearning.controller;

import com.weblearning.dto.upload.UploadImageResponse;
import com.weblearning.service.CloudinaryUploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/uploads")
@RequiredArgsConstructor
public class MediaUploadController {

    private final CloudinaryUploadService cloudinaryUploadService;

    @PostMapping("/thumbnail")
    public ResponseEntity<UploadImageResponse> uploadThumbnail(@RequestParam("file") MultipartFile file) {
        String url = cloudinaryUploadService.uploadThumbnail(file);
        return ResponseEntity.ok(new UploadImageResponse(url));
    }
}
