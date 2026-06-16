package com.weblearning.repository.admin;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.weblearning.entity.Lesson;

@Repository
public interface AdminLessonRepository extends JpaRepository<Lesson, Long>, JpaSpecificationExecutor<Lesson> {

    List<Lesson> findByDeletedFalse();

    Optional<Lesson> findByIdAndDeletedFalse(Long id);

    List<Lesson> findByDeletedTrue();

    Page<Lesson> findByDeletedTrue(Pageable pageable);

    Optional<Lesson> findByIdAndDeletedTrue(Long id);

    List<Lesson> findByChapterIdAndDeletedFalseOrderByOrderIndexAsc(Long chapterId);
}
