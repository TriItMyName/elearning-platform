package com.weblearning.repository.admin;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.weblearning.entity.Course;

@Repository
public interface AdminCourseRepository extends JpaRepository<Course, Long>, JpaSpecificationExecutor<Course> {

    Optional<Course> findBySlug(String slug);

    Optional<Course> findByTitle(String title);

    List<Course> findByDeletedFalse();

    Optional<Course> findByIdAndDeletedFalse(Long id);

    List<Course> findByDeletedTrue();

    org.springframework.data.domain.Page<Course> findByDeletedTrue(org.springframework.data.domain.Pageable pageable);

    Optional<Course> findByIdAndDeletedTrue(Long id);

    boolean existsByTitle(String title);

    boolean existsBySlug(String slug);

    boolean existsByTitleAndDeletedFalse(String title);

    boolean existsBySlugAndDeletedFalse(String slug);

    long countByDeletedFalse();

}
