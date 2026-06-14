package com.weblearning.repository;

import com.weblearning.entity.Lesson;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {
    List<Lesson> findByChapterIdOrderByOrderIndexAsc(Long chapterId);

    Page<Lesson> findByChapterId(Long chapterId, Pageable pageable);

    List<Lesson> findByChapterIdAndDeletedFalseOrderByOrderIndexAsc(Long chapterId);

    List<Lesson> findByChapterCourseIdAndDeletedFalseOrderByChapterOrderIndexAscOrderIndexAsc(Long courseId);

    Page<Lesson> findByChapterIdAndDeletedFalse(Long chapterId, Pageable pageable);

    Optional<Lesson> findByIdAndDeletedFalse(Long id);
}
