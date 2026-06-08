package com.weblearning.service.impl;

import com.weblearning.dto.chapter.ChapterResponse;
import com.weblearning.entity.Chapter;
import com.weblearning.entity.Course;
import com.weblearning.entity.User;
import com.weblearning.repository.ChapterRepository;
import com.weblearning.repository.CourseRepository;
import com.weblearning.service.ChapterService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ChapterServiceImpl implements ChapterService {

    private final ChapterRepository chapterRepository;
    private final CourseRepository courseRepository;

    @Override
    public List<ChapterResponse> getByCourseId(Long courseId) {
        return chapterRepository.findByCourseIdOrderByOrderIndexAsc(courseId).stream()
                .map(this::toChapterResponse)
                .toList();
    }

    @Override
    public ChapterResponse createForInstructor(Long courseId, Chapter chapter, User instructor) {
        Course course = getOwnedCourse(courseId, instructor);
        chapter.setCourse(course);
        return toChapterResponse(chapterRepository.save(chapter));
    }

    @Override
    public ChapterResponse updateForInstructor(Long courseId, Long chapterId, Chapter chapter, User instructor) {
        getOwnedCourse(courseId, instructor);
        Chapter existing = getChapterInCourse(courseId, chapterId);
        existing.setTitle(chapter.getTitle());
        existing.setOrderIndex(chapter.getOrderIndex());
        return toChapterResponse(chapterRepository.save(existing));
    }

    @Override
    public void deleteForInstructor(Long courseId, Long chapterId, User instructor) {
        getOwnedCourse(courseId, instructor);
        Chapter existing = getChapterInCourse(courseId, chapterId);
        chapterRepository.delete(existing);
    }

    @Override
    public List<ChapterResponse> reorderForInstructor(Long courseId, List<Long> chapterIds, User instructor) {
        getOwnedCourse(courseId, instructor);

        List<Chapter> chapters = chapterRepository.findByCourseIdOrderByOrderIndexAsc(courseId);
        Set<Long> idsInCourse = new HashSet<>(chapters.stream().map(Chapter::getId).toList());

        if (!idsInCourse.equals(new HashSet<>(chapterIds))) {
            throw new IllegalArgumentException("Chapter ids do not match this course");
        }

        for (int index = 0; index < chapterIds.size(); index++) {
            Long chapterId = chapterIds.get(index);
            Chapter chapter = chapters.stream()
                    .filter(item -> item.getId().equals(chapterId))
                    .findFirst()
                    .orElseThrow(() -> new EntityNotFoundException("Chapter not found: " + chapterId));
            chapter.setOrderIndex(index + 1);
        }

        return chapterRepository.saveAll(chapters).stream()
                .sorted((first, second) -> first.getOrderIndex().compareTo(second.getOrderIndex()))
                .map(this::toChapterResponse)
                .toList();
    }

    private Chapter getChapterInCourse(Long courseId, Long chapterId) {
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new EntityNotFoundException("Chapter not found: " + chapterId));

        if (chapter.getCourse() == null || !chapter.getCourse().getId().equals(courseId)) {
            throw new EntityNotFoundException("Chapter not found in course: " + courseId);
        }

        return chapter;
    }

    private Course getOwnedCourse(Long courseId, User instructor) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new EntityNotFoundException("Course not found: " + courseId));

        if (course.getInstructor() == null || !course.getInstructor().getId().equals(instructor.getId())) {
            throw new SecurityException("You are not the instructor of this course");
        }

        return course;
    }

    private ChapterResponse toChapterResponse(Chapter chapter) {
        ChapterResponse response = new ChapterResponse();
        response.setId(chapter.getId());
        response.setCourseId(chapter.getCourse() != null ? chapter.getCourse().getId() : null);
        response.setTitle(chapter.getTitle());
        response.setOrderIndex(chapter.getOrderIndex());
        return response;
    }
}
