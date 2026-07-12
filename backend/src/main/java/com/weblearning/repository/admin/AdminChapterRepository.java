package com.weblearning.repository.admin;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.weblearning.entity.Chapter;

@Repository
public interface AdminChapterRepository extends JpaRepository<Chapter, Long>, JpaSpecificationExecutor<Chapter> {

    List<Chapter> findByDeletedFalse();

    Optional<Chapter> findByIdAndDeletedFalse(Long id);

    List<Chapter> findByDeletedTrue();

    Page<Chapter> findByDeletedTrue(Pageable pageable);

    Optional<Chapter> findByIdAndDeletedTrue(Long id);

    List<Chapter> findByCourseIdAndDeletedFalseOrderByOrderIndexAsc(Long courseId);
}
