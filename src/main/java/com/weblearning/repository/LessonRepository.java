package com.weblearning.repository;

import com.weblearning.entity.Lesson;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {
    List<Lesson> findByChapterIdOrderByOrderIndexAsc(Long chapterId);

    Page<Lesson> findByChapterId(Long chapterId, Pageable pageable);
}
