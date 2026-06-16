package com.weblearning.service.impl.admin;

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

import com.weblearning.dto.admin.AdminChapterDtoResponse;
import com.weblearning.dto.admin.AdminChapterRequest;
import com.weblearning.dto.admin.AdminChapterUpdateRequest;
import com.weblearning.entity.Chapter;
import com.weblearning.entity.Course;
import com.weblearning.exception.ResourceNotFoundException;
import com.weblearning.repository.admin.AdminChapterRepository;
import com.weblearning.repository.admin.AdminCourseRepository;
import com.weblearning.service.admin.AdminChapterService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminChapterServiceImpl implements AdminChapterService {

    private final AdminChapterRepository adminChapterRepository;
    private final AdminCourseRepository adminCourseRepository;

    // Cache variables
    private List<AdminChapterDtoResponse> cachedChapters = null;
    private long cacheExpiryTime = 0L;
    private final Object cacheLock = new Object();

    // Mapping helper from Chapter entity to DTO Response
    private AdminChapterDtoResponse mapToChapterDtoResponse(Chapter chapter) {
        return AdminChapterDtoResponse.builder()
                .id(chapter.getId())
                .courseId(chapter.getCourse() != null ? chapter.getCourse().getId() : null)
                .title(chapter.getTitle())
                .orderIndex(chapter.getOrderIndex())
                .build();
    }

    // Helper to clear cache after mutations
    private void clearCache() {
        synchronized (cacheLock) {
            cachedChapters = null;
            cacheExpiryTime = 0L;
        }
    }

    private List<AdminChapterDtoResponse> getAllChaptersRaw() {
        long now = System.currentTimeMillis();
        synchronized (cacheLock) {
            if (cachedChapters == null || now > cacheExpiryTime) {
                cachedChapters = adminChapterRepository.findByDeletedFalse().stream()
                        .map(this::mapToChapterDtoResponse)
                        .toList();
                cacheExpiryTime = now + (5 * 60 * 1000); // 5 minutes cache TTL
            }
            return cachedChapters;
        }
    }

    @Override
    public Page<AdminChapterDtoResponse> getAllChapters(Pageable pageable) {
        List<AdminChapterDtoResponse> list = new ArrayList<>(getAllChaptersRaw());

        if (pageable.getSort().isSorted()) {
            Sort.Order order = pageable.getSort().iterator().next();
            String property = order.getProperty();
            boolean isAsc = order.isAscending();

            Comparator<AdminChapterDtoResponse> comparator = switch (property) {
                case "title" -> Comparator.comparing(AdminChapterDtoResponse::getTitle, Comparator.nullsLast(String::compareToIgnoreCase));
                case "orderIndex" -> Comparator.comparing(AdminChapterDtoResponse::getOrderIndex);
                default -> Comparator.comparing(AdminChapterDtoResponse::getId);
            };

            if (!isAsc) {
                comparator = comparator.reversed();
            }
            list.sort(comparator);
        } else {
            list.sort(Comparator.comparing(AdminChapterDtoResponse::getOrderIndex));
        }

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), list.size());

        if (start > list.size()) {
            return new PageImpl<>(Collections.emptyList(), pageable, list.size());
        }

        return new PageImpl<>(list.subList(start, end), pageable, list.size());
    }

    @Override
    public Page<AdminChapterDtoResponse> getChaptersByCourse(Long courseId, Pageable pageable) {
        List<AdminChapterDtoResponse> list = getAllChaptersRaw().stream()
                .filter(chapter -> courseId.equals(chapter.getCourseId()))
                .collect(Collectors.toList());

        if (pageable.getSort().isSorted()) {
            Sort.Order order = pageable.getSort().iterator().next();
            String property = order.getProperty();
            boolean isAsc = order.isAscending();

            Comparator<AdminChapterDtoResponse> comparator = switch (property) {
                case "title" -> Comparator.comparing(AdminChapterDtoResponse::getTitle, Comparator.nullsLast(String::compareToIgnoreCase));
                case "orderIndex" -> Comparator.comparing(AdminChapterDtoResponse::getOrderIndex);
                default -> Comparator.comparing(AdminChapterDtoResponse::getId);
            };

            if (!isAsc) {
                comparator = comparator.reversed();
            }
            list.sort(comparator);
        } else {
            list.sort(Comparator.comparing(AdminChapterDtoResponse::getOrderIndex));
        }

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), list.size());

        if (start > list.size()) {
            return new PageImpl<>(Collections.emptyList(), pageable, list.size());
        }

        return new PageImpl<>(list.subList(start, end), pageable, list.size());
    }

    @Override
    public AdminChapterDtoResponse getChapterById(Long id) {
        Chapter chapter = adminChapterRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Chapter not found with id: " + id));
        return mapToChapterDtoResponse(chapter);
    }

    @Override
    @Transactional
    public AdminChapterDtoResponse createChapter(AdminChapterRequest request) {
        Course course = adminCourseRepository.findByIdAndDeletedFalse(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + request.getCourseId()));

        Chapter chapter = Chapter.builder()
                .course(course)
                .title(request.getTitle())
                .orderIndex(request.getOrderIndex())
                .deleted(false)
                .build();

        Chapter saved = adminChapterRepository.save(chapter);
        clearCache();
        return mapToChapterDtoResponse(saved);
    }

    @Override
    @Transactional
    public AdminChapterDtoResponse updateChapter(Long id, AdminChapterUpdateRequest request) {
        Chapter chapter = adminChapterRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Chapter not found with id: " + id));

        if (request.getCourseId() != null) {
            Course course = adminCourseRepository.findByIdAndDeletedFalse(request.getCourseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + request.getCourseId()));
            chapter.setCourse(course);
        }

        if (request.getTitle() != null && !request.getTitle().trim().isEmpty()) {
            chapter.setTitle(request.getTitle().trim());
        }

        if (request.getOrderIndex() != null) {
            chapter.setOrderIndex(request.getOrderIndex());
        }

        Chapter updated = adminChapterRepository.save(chapter);
        clearCache();
        return mapToChapterDtoResponse(updated);
    }

    @Override
    @Transactional
    public void deleteChapter(Long id) {
        Chapter chapter = adminChapterRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Chapter not found with id: " + id));

        chapter.setDeleted(true);
        chapter.setDeletedAt(LocalDateTime.now());
        adminChapterRepository.save(chapter);
        clearCache();
    }

    @Override
    public Page<AdminChapterDtoResponse> getDeletedChapters(Pageable pageable) {
        Page<Chapter> page = adminChapterRepository.findByDeletedTrue(pageable);
        return page.map(this::mapToChapterDtoResponse);
    }

    @Override
    @Transactional
    public AdminChapterDtoResponse restoreChapter(Long id) {
        Chapter chapter = adminChapterRepository.findByIdAndDeletedTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Deleted chapter not found with id: " + id));

        if (chapter.getCourse() != null && chapter.getCourse().isDeleted()) {
            throw new IllegalStateException("Cannot restore: The associated course is deleted.");
        }

        chapter.setDeleted(false);
        chapter.setDeletedAt(null);
        Chapter restored = adminChapterRepository.save(chapter);
        clearCache();
        return mapToChapterDtoResponse(restored);
    }

}
