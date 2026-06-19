package com.weblearning.service.impl.admin;

import java.net.URI;
import java.net.URL;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import jakarta.transaction.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.weblearning.dto.admin.AdminLessonDtoResponse;
import com.weblearning.dto.admin.AdminLessonRequest;
import com.weblearning.dto.admin.AdminLessonUpdateRequest;
import com.weblearning.entity.Chapter;
import com.weblearning.entity.Lesson;
import com.weblearning.exception.ResourceNotFoundException;
import com.weblearning.repository.ChapterRepository;
import com.weblearning.repository.admin.AdminLessonRepository;
import com.weblearning.service.CloudinaryUploadService;
import com.weblearning.service.admin.AdminLessonService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminLessonServiceImpl implements AdminLessonService {

    private final AdminLessonRepository adminLessonRepository;
    private final ChapterRepository chapterRepository;
    private final CloudinaryUploadService cloudinaryUploadService;

    public static final int TYPE_VIDEO = 0;
    public static final int TYPE_DOCUMENT = 1;
    public static final int TYPE_TEXT = 2;

    // Cache variables
    private List<AdminLessonDtoResponse> cachedLessons = null;
    private long cacheExpiryTime = 0L;
    private final Object cacheLock = new Object();

    // Mapping helper from Lesson entity to DTO Response
    private AdminLessonDtoResponse mapToLessonDtoResponse(Lesson lesson) {
        return AdminLessonDtoResponse.builder()
                .id(lesson.getId())
                .chapterId(lesson.getChapter() != null ? lesson.getChapter().getId() : null)
                .title(lesson.getTitle())
                .lessonType(lesson.getLessonType())
                .videoUrl(lesson.getVideoUrl())
                .documentUrl(lesson.getDocumentUrl())
                .duration(lesson.getDuration())
                .content(lesson.getContent())
                .orderIndex(lesson.getOrderIndex())
                .build();
    }

    // Helper to clear cache after mutations
    private void clearCache() {
        synchronized (cacheLock) {
            cachedLessons = null;
            cacheExpiryTime = 0L;
        }
    }

    private boolean isValidUrl(String url) {
        if (url == null || url.trim().isEmpty()) {
            return false;
        }

        String trimmed = url.trim();

        try {
            URI uri = URI.create(trimmed);

            String scheme = uri.getScheme();

            if (!"http".equalsIgnoreCase(scheme) && !"https".equalsIgnoreCase(scheme)) {
                return false;
            }

            if (uri.getHost() == null || uri.getHost().isBlank()) {
                return false;
            }

            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    private List<AdminLessonDtoResponse> getAllLessonsRaw() {
        long now = System.currentTimeMillis();
        synchronized (cacheLock) {
            if (cachedLessons == null || now > cacheExpiryTime) {
                cachedLessons = adminLessonRepository.findByDeletedFalse().stream()
                        .map(this::mapToLessonDtoResponse)
                        .toList();
                cacheExpiryTime = now + (5 * 60 * 1000); // 5 minutes cache TTL
            }
            return cachedLessons;
        }
    }

    @Override
    public Page<AdminLessonDtoResponse> getAllLessons(Pageable pageable) {
        List<AdminLessonDtoResponse> list = new ArrayList<>(getAllLessonsRaw());

        if (pageable.getSort().isSorted()) {
            Sort.Order order = pageable.getSort().iterator().next();
            String property = order.getProperty();
            boolean isAsc = order.isAscending();

            Comparator<AdminLessonDtoResponse> comparator = switch (property) {
                case "title" -> Comparator.comparing(AdminLessonDtoResponse::getTitle, Comparator.nullsLast(String::compareToIgnoreCase));
                case "orderIndex" -> Comparator.comparing(AdminLessonDtoResponse::getOrderIndex);
                default -> Comparator.comparing(AdminLessonDtoResponse::getId);
            };

            if (!isAsc) {
                comparator = comparator.reversed();
            }
            list.sort(comparator);
        } else {
            list.sort(Comparator.comparing(AdminLessonDtoResponse::getOrderIndex));
        }

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), list.size());

        if (start > list.size()) {
            return new PageImpl<>(Collections.emptyList(), pageable, list.size());
        }

        return new PageImpl<>(list.subList(start, end), pageable, list.size());
    }

    @Override
    public Page<AdminLessonDtoResponse> getLessonsByChapter(Long chapterId, Pageable pageable) {
        List<AdminLessonDtoResponse> list = getAllLessonsRaw().stream()
                .filter(lesson -> chapterId.equals(lesson.getChapterId()))
                .collect(Collectors.toList());

        if (pageable.getSort().isSorted()) {
            Sort.Order order = pageable.getSort().iterator().next();
            String property = order.getProperty();
            boolean isAsc = order.isAscending();

            Comparator<AdminLessonDtoResponse> comparator = switch (property) {
                case "title" -> Comparator.comparing(AdminLessonDtoResponse::getTitle, Comparator.nullsLast(String::compareToIgnoreCase));
                case "orderIndex" -> Comparator.comparing(AdminLessonDtoResponse::getOrderIndex);
                default -> Comparator.comparing(AdminLessonDtoResponse::getId);
            };

            if (!isAsc) {
                comparator = comparator.reversed();
            }
            list.sort(comparator);
        } else {
            list.sort(Comparator.comparing(AdminLessonDtoResponse::getOrderIndex));
        }

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), list.size());

        if (start > list.size()) {
            return new PageImpl<>(Collections.emptyList(), pageable, list.size());
        }

        return new PageImpl<>(list.subList(start, end), pageable, list.size());
    }

    @Override
    public AdminLessonDtoResponse getLessonById(Long id) {
        Lesson lesson = adminLessonRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found with id: " + id));
        return mapToLessonDtoResponse(lesson);
    }

    @Override
    @Transactional
    public AdminLessonDtoResponse createLesson(AdminLessonRequest request) {
        Chapter chapter = chapterRepository.findByIdAndDeletedFalse(request.getChapterId())
                .orElseThrow(
                        () -> new ResourceNotFoundException("Chapter not found with id: " + request.getChapterId()));

        String videoUrl = request.getVideoUrl() != null ? request.getVideoUrl().trim() : null;
        String documentUrl = request.getDocumentUrl() != null ? request.getDocumentUrl().trim() : null;

        if (videoUrl != null && videoUrl.isEmpty()) {
            videoUrl = null;
        }
        if (documentUrl != null && documentUrl.isEmpty()) {
            documentUrl = null;
        }

        // Validate URLs
        if (videoUrl != null && !isValidUrl(videoUrl)) {
            throw new IllegalArgumentException("Invalid video URL format. Must start with http:// or https://");
        }
        if (documentUrl != null && !isValidUrl(documentUrl)) {
            throw new IllegalArgumentException("Invalid document URL format. Must start with http:// or https://");
        }

        // Validate Lesson Type Constraints
        int lessonType = request.getLessonType();
        if (lessonType == TYPE_VIDEO) {
            if (documentUrl != null) {
                throw new IllegalArgumentException("Video lessons cannot have a document URL");
            }
        } else if (lessonType == TYPE_DOCUMENT) {
            if (videoUrl != null) {
                throw new IllegalArgumentException("Document lessons cannot have a video URL");
            }
        } else if (lessonType == TYPE_TEXT) {
            if (videoUrl != null || documentUrl != null) {
                throw new IllegalArgumentException("Text/Content lessons cannot have a video URL or document URL");
            }
        } else {
            throw new IllegalArgumentException("Invalid lesson type: " + lessonType);
        }

        Lesson lesson = Lesson.builder()
                .chapter(chapter)
                .title(request.getTitle())
                .lessonType(lessonType)
                .videoUrl(videoUrl)
                .documentUrl(documentUrl)
                .duration(request.getDuration())
                .content(request.getContent())
                .orderIndex(request.getOrderIndex())
                .deleted(false)
                .build();

        Lesson saved = adminLessonRepository.save(lesson);
        clearCache();
        return mapToLessonDtoResponse(saved);
    }

    @Override
    @Transactional
    public AdminLessonDtoResponse updateLesson(Long id, AdminLessonUpdateRequest request) {
        Lesson lesson = adminLessonRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found with id: " + id));

        Integer finalLessonType = request.getLessonType() != null ? request.getLessonType() : lesson.getLessonType();

        String videoUrl = request.getVideoUrl() != null ? request.getVideoUrl().trim()
                : (lesson.getVideoUrl() != null ? lesson.getVideoUrl().trim() : null);
        String documentUrl = request.getDocumentUrl() != null ? request.getDocumentUrl().trim()
                : (lesson.getDocumentUrl() != null ? lesson.getDocumentUrl().trim() : null);

        // Handle case where user explicitly cleared URL
        if (request.getVideoUrl() != null && request.getVideoUrl().trim().isEmpty()) {
            videoUrl = null;
        }
        if (request.getDocumentUrl() != null && request.getDocumentUrl().trim().isEmpty()) {
            documentUrl = null;
        }

        // Validate URLs
        if (videoUrl != null && !isValidUrl(videoUrl)) {
            throw new IllegalArgumentException("Invalid video URL format. Must start with http:// or https://");
        }
        if (documentUrl != null && !isValidUrl(documentUrl)) {
            throw new IllegalArgumentException("Invalid document URL format. Must start with http:// or https://");
        }

        // Validate Lesson Type Constraints
        if (finalLessonType == TYPE_VIDEO) {
            if (documentUrl != null) {
                throw new IllegalArgumentException("Video lessons cannot have a document URL");
            }
        } else if (finalLessonType == TYPE_DOCUMENT) {
            if (videoUrl != null) {
                throw new IllegalArgumentException("Document lessons cannot have a video URL");
            }
        } else if (finalLessonType == TYPE_TEXT) {
            if (videoUrl != null || documentUrl != null) {
                throw new IllegalArgumentException("Text/Content lessons cannot have a video URL or document URL");
            }
        } else {
            throw new IllegalArgumentException("Invalid lesson type: " + finalLessonType);
        }

        if (request.getChapterId() != null) {
            Chapter chapter = chapterRepository.findByIdAndDeletedFalse(request.getChapterId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Chapter not found with id: " + request.getChapterId()));
            lesson.setChapter(chapter);
        }

        if (request.getTitle() != null && !request.getTitle().trim().isEmpty()) {
            lesson.setTitle(request.getTitle().trim());
        }

        if (request.getLessonType() != null) {
            lesson.setLessonType(request.getLessonType());
        }

        lesson.setVideoUrl(videoUrl);
        lesson.setDocumentUrl(documentUrl);

        if (request.getDuration() != null) {
            lesson.setDuration(request.getDuration());
        }

        if (request.getContent() != null) {
            lesson.setContent(request.getContent());
        }

        if (request.getOrderIndex() != null) {
            lesson.setOrderIndex(request.getOrderIndex());
        }

        Lesson updated = adminLessonRepository.save(lesson);
        clearCache();
        return mapToLessonDtoResponse(updated);
    }

    @Override
    @Transactional
    public void deleteLesson(Long id) {
        Lesson lesson = adminLessonRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found with id: " + id));

        lesson.setDeleted(true);
        lesson.setDeletedAt(LocalDateTime.now());
        adminLessonRepository.save(lesson);
        clearCache();
    }

    @Override
    public Page<AdminLessonDtoResponse> getDeletedLessons(Pageable pageable) {
        Page<Lesson> page = adminLessonRepository.findByDeletedTrue(pageable);
        return page.map(this::mapToLessonDtoResponse);
    }

    @Override
    @Transactional
    public AdminLessonDtoResponse restoreLesson(Long id) {
        Lesson lesson = adminLessonRepository.findByIdAndDeletedTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Deleted lesson not found with id: " + id));

        if (lesson.getChapter() != null && lesson.getChapter().isDeleted()) {
            throw new IllegalStateException("Cannot restore: The associated chapter is deleted.");
        }

        lesson.setDeleted(false);
        lesson.setDeletedAt(null);
        Lesson restored = adminLessonRepository.save(lesson);
        clearCache();
        return mapToLessonDtoResponse(restored);
    }

    @Override
    @Transactional
    public AdminLessonDtoResponse uploadVideo(Long id, MultipartFile file) {
        Lesson lesson = adminLessonRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found with id: " + id));

        if (lesson.getLessonType() != TYPE_VIDEO) {
            throw new IllegalArgumentException("Cannot upload video: Lesson type must be Video (0)");
        }

        String videoUrl = cloudinaryUploadService.uploadVideo(file, id);
        lesson.setVideoUrl(videoUrl);
        lesson.setDocumentUrl(null);

        Lesson saved = adminLessonRepository.save(lesson);
        clearCache();
        return mapToLessonDtoResponse(saved);
    }

    @Override
    @Transactional
    public AdminLessonDtoResponse uploadDocument(Long id, MultipartFile file) {
        Lesson lesson = adminLessonRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found with id: " + id));

        if (lesson.getLessonType() != TYPE_DOCUMENT) {
            throw new IllegalArgumentException("Cannot upload document: Lesson type must be Document (1)");
        }

        String documentUrl = cloudinaryUploadService.uploadDocument(file, id);
        lesson.setDocumentUrl(documentUrl);
        lesson.setVideoUrl(null);

        Lesson saved = adminLessonRepository.save(lesson);
        clearCache();
        return mapToLessonDtoResponse(saved);
    }

}
