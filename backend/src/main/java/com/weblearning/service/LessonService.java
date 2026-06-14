package com.weblearning.service;

import com.weblearning.dto.lesson.LessonResponse;
import com.weblearning.entity.Lesson;
import com.weblearning.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface LessonService {
    List<LessonResponse> getByChapterForInstructor(Long courseId, Long chapterId, User instructor);

    Page<LessonResponse> getByChapterForInstructor(Long courseId, Long chapterId, User instructor, Pageable pageable);

    LessonResponse createForInstructor(Long courseId, Long chapterId, Lesson lesson, User instructor);

    LessonResponse updateForInstructor(Long courseId, Long chapterId, Long lessonId, Lesson lesson, User instructor);

    void deleteForInstructor(Long courseId, Long chapterId, Long lessonId, User instructor);

    List<LessonResponse> reorderForInstructor(Long courseId, Long chapterId, List<Long> lessonIds, User instructor);

    LessonResponse uploadVideoForInstructor(Long courseId, Long chapterId, Long lessonId, MultipartFile file, User instructor);
}
