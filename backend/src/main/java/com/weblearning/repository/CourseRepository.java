package com.weblearning.repository;

import com.weblearning.entity.Course;
import com.weblearning.entity.User;
import com.weblearning.entity.enums.CourseStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
//    List<Course> findByInstructor(User instructor);
//
//    Page<Course> findByInstructor(User instructor, Pageable pageable);

    List<Course> findByDeletedFalse();

    Page<Course> findByDeletedFalse(Pageable pageable);

    List<Course> findByAdminStatusAndDeletedFalse(CourseStatus adminStatus);

    Page<Course> findByAdminStatusAndDeletedFalse(CourseStatus adminStatus, Pageable pageable);

    Optional<Course> findByIdAndDeletedFalse(Long id);

    Optional<Course> findByIdAndAdminStatusAndDeletedFalse(Long id, CourseStatus adminStatus);

    List<Course> findByInstructorAndDeletedFalse(User instructor);

    Page<Course> findByInstructorAndDeletedFalse(User instructor, Pageable pageable);
}

