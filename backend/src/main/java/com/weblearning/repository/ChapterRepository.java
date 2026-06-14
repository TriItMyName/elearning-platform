package com.weblearning.repository;

import com.weblearning.entity.Chapter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChapterRepository extends JpaRepository<Chapter, Long> {
    List<Chapter> findByCourseIdOrderByOrderIndexAsc(Long courseId);

    Page<Chapter> findByCourseId(Long courseId, Pageable pageable);

    List<Chapter> findByCourseIdAndDeletedFalseOrderByOrderIndexAsc(Long courseId);

    Page<Chapter> findByCourseIdAndDeletedFalse(Long courseId, Pageable pageable);

    Optional<Chapter> findByIdAndDeletedFalse(Long id);
}
