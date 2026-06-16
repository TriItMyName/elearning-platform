package com.weblearning.service.admin;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.weblearning.dto.admin.AdminChapterDtoResponse;
import com.weblearning.dto.admin.AdminChapterRequest;
import com.weblearning.dto.admin.AdminChapterUpdateRequest;

public interface AdminChapterService {

    Page<AdminChapterDtoResponse> getAllChapters(Pageable pageable);

    Page<AdminChapterDtoResponse> getChaptersByCourse(Long courseId, Pageable pageable);

    AdminChapterDtoResponse getChapterById(Long id);

    AdminChapterDtoResponse createChapter(AdminChapterRequest request);

    AdminChapterDtoResponse updateChapter(Long id, AdminChapterUpdateRequest request);

    void deleteChapter(Long id);

    Page<AdminChapterDtoResponse> getDeletedChapters(Pageable pageable);

    AdminChapterDtoResponse restoreChapter(Long id);
}
