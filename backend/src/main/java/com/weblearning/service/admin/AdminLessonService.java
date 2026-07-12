package com.weblearning.service.admin;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import com.weblearning.dto.admin.AdminLessonDtoResponse;
import com.weblearning.dto.admin.AdminLessonRequest;
import com.weblearning.dto.admin.AdminLessonUpdateRequest;

public interface AdminLessonService {

    Page<AdminLessonDtoResponse> getAllLessons(Pageable pageable);

    Page<AdminLessonDtoResponse> getLessonsByChapter(Long chapterId, Pageable pageable);

    AdminLessonDtoResponse getLessonById(Long id);

    AdminLessonDtoResponse createLesson(AdminLessonRequest request);

    AdminLessonDtoResponse updateLesson(Long id, AdminLessonUpdateRequest request);

    void deleteLesson(Long id);

    Page<AdminLessonDtoResponse> getDeletedLessons(Pageable pageable);

    AdminLessonDtoResponse restoreLesson(Long id);

    AdminLessonDtoResponse uploadVideo(Long id, MultipartFile file);

    AdminLessonDtoResponse uploadDocument(Long id, MultipartFile file);
}
