package com.weblearning.service.impl;

import com.weblearning.dto.course.CourseChapterContentResponse;
import com.weblearning.dto.course.CourseContentResponse;
import com.weblearning.dto.course.CourseResponse;
import com.weblearning.dto.lesson.LessonResponse;
import com.weblearning.dto.quiz.QuizResponse;
import com.weblearning.entity.Chapter;
import com.weblearning.entity.Course;
import com.weblearning.entity.Enrollment;
import com.weblearning.entity.Lesson;
import com.weblearning.entity.Quiz;
import com.weblearning.entity.User;
import com.weblearning.entity.enums.CourseStatus;
import com.weblearning.repository.ChapterRepository;
import com.weblearning.repository.CourseRepository;
import com.weblearning.repository.EnrollmentRepository;
import com.weblearning.repository.LessonRepository;
import com.weblearning.repository.QuizRepository;
import com.weblearning.service.CourseService;
import com.weblearning.utils.StringUnitls;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ChapterRepository chapterRepository;
    private final LessonRepository lessonRepository;
    private final QuizRepository quizRepository;

    private CourseResponse toCourseResponse(Course course) {
        CourseResponse response = new CourseResponse();
        response.setId(course.getId());
        response.setInstructorId(course.getInstructor() != null ? course.getInstructor().getId() : null);
        response.setCategoryId(course.getCategory() != null ? course.getCategory().getId() : null);
        response.setTitle(course.getTitle());
        response.setSlug(course.getSlug());
        response.setThumbnail(course.getThumbnail());
        response.setStatus(course.getStatus());
        response.setAdminStatus(course.getAdminStatus());
        response.setCreatedAt(course.getCreatedAt());
        response.setUpDateTime(course.getUpdatedAt());
        response.setDescription(course.getDescription());
        return response;
    }

    @Override
    public CourseResponse create(Course course) {
        course.setSlug(resolveSlug(course.getSlug(), course.getTitle()));
        return toCourseResponse(courseRepository.save(course));
    }

    @Override
    public Optional<CourseResponse> getById(Long id) {
        return courseRepository.findByIdAndAdminStatusAndDeletedFalse(id, CourseStatus.PUBLISHED)
                .map(this::toCourseResponse);
    }

    @Override
    public List<CourseResponse> getAll() {
        return courseRepository.findByAdminStatusAndDeletedFalse(CourseStatus.PUBLISHED).stream()
                .map(this::toCourseResponse)
                .toList();
    }

    @Override
    public Page<CourseResponse> getAll(Pageable pageable) {
        return courseRepository.findByAdminStatusAndDeletedFalse(CourseStatus.PUBLISHED, pageable)
                .map(this::toCourseResponse);
    }

    @Override
    public Page<CourseResponse> getAllForStudent(User student, Pageable pageable) {
        Set<Long> enrolledCourseIds = enrollmentRepository.findByStudentIdAndDeletedFalse(student.getId())
                .stream()
                .map(Enrollment::getCourse)
                .filter(course -> course != null && course.getId() != null)
                .map(Course::getId)
                .collect(Collectors.toSet());

        return courseRepository.findByAdminStatusAndDeletedFalse(CourseStatus.PUBLISHED, pageable)
                .map(course -> {
                    CourseResponse response = toCourseResponse(course);
                    response.setEnrolled(enrolledCourseIds.contains(course.getId()));
                    return response;
                });
    }

    @Override
    public CourseResponse update(Long id, Course course) {
        Course existing = courseRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Course not found: " + id));
        existing.setTitle(course.getTitle());
        existing.setSlug(resolveSlug(course.getSlug(), course.getTitle()));
        existing.setDescription(course.getDescription());
        existing.setThumbnail(course.getThumbnail());
        existing.setCategory(course.getCategory());
        existing.setInstructor(course.getInstructor());
        existing.setStatus(course.getStatus());
        existing.setCreatedAt(course.getCreatedAt());
        existing.setUpdatedAt(LocalDateTime.now());
        return toCourseResponse(courseRepository.save(existing));
    }

    @Override
    public void delete(Long id) {
        Course existing = courseRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Course not found: " + id));
        existing.setDeleted(true);
        existing.setDeletedAt(LocalDateTime.now());
        courseRepository.save(existing);
    }

    @Override
    public List<CourseResponse> getCoursesByInstructor(User instructor) {
        return courseRepository.findByInstructorAndDeletedFalse(instructor).stream()
                .map(this::toCourseResponse)
                .toList();
    }

    @Override
    public Page<CourseResponse> getCoursesByInstructor(User instructor, Pageable pageable) {
        return courseRepository.findByInstructorAndDeletedFalse(instructor, pageable)
                .map(this::toCourseResponse);
    }

    @Override
    public List<CourseResponse> getCoursesByStudent(User student) {
        return enrollmentRepository.findByStudentIdAndDeletedFalseOrderByEnrolledAtDesc(student.getId())
                .stream()
                .map(Enrollment::getCourse)
                .filter(course -> course != null
                        && !course.isDeleted()
                        && CourseStatus.PUBLISHED.equals(course.getAdminStatus()))
                .map(this::toCourseResponse)
                .toList();
    }

    @Override
    public CourseContentResponse getCourseContentForInstructor(Long id, User instructor) {
        Course course = getOwnedCourse(id, instructor);
        return toCourseContentResponse(course);
    }

    @Override
    public CourseContentResponse getCourseContentForStudent(Long id, User student) {
        Course course = courseRepository.findByIdAndAdminStatusAndDeletedFalse(id, CourseStatus.PUBLISHED)
                .orElseThrow(() -> new EntityNotFoundException("Course not found: " + id));
        enrollmentRepository.findByCourseIdAndStudentIdAndDeletedFalse(id, student.getId())
                .orElseThrow(() -> new SecurityException("You are not enrolled in this course"));
        return toCourseContentResponse(course);
    }

    @Override
    public CourseResponse createForInstructor(Course course, User instructor, boolean submitForReview) {
        course.setInstructor(instructor);
        course.setSlug(resolveSlug(course.getSlug(), course.getTitle()));
        course.setStatus(0);
        course.setAdminStatus(resolveTeacherAdminStatus(submitForReview));
        course.setCreatedAt(course.getCreatedAt() != null ? course.getCreatedAt() : LocalDateTime.now());
        course.setDeleted(false);
        return toCourseResponse(courseRepository.save(course));
    }

    @Override
    public CourseResponse updateForInstructor(Long id, Course course, User instructor, boolean submitForReview) {
        Course existing = courseRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Course not found: " + id));
        if (existing.getInstructor() == null || !existing.getInstructor().getId().equals(instructor.getId())) {
            throw new SecurityException("You are not the instructor of this course");
        }
        existing.setTitle(course.getTitle());
        existing.setSlug(resolveSlug(course.getSlug(), course.getTitle()));
        existing.setDescription(course.getDescription());
        existing.setThumbnail(course.getThumbnail());
        existing.setCategory(course.getCategory());
        existing.setStatus(0);
        existing.setAdminStatus(resolveTeacherAdminStatus(submitForReview));
        existing.setUpdatedAt(LocalDateTime.now());
        return toCourseResponse(courseRepository.save(existing));
    }

    @Override
    public void deleteForInstructor(Long id, User instructor) {
        Course existing = courseRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Course not found: " + id));

        if (existing.getInstructor() == null || !existing.getInstructor().getId().equals(instructor.getId())) {
            throw new SecurityException("You do not have permission to delete this course");
        }
        existing.setDeleted(true);
        existing.setDeletedAt(LocalDateTime.now());
        courseRepository.save(existing);
    }

    private CourseChapterContentResponse toChapterContentResponse(Chapter chapter) {
        CourseChapterContentResponse response = new CourseChapterContentResponse();
        response.setId(chapter.getId());
        response.setCourseId(chapter.getCourse() != null ? chapter.getCourse().getId() : null);
        response.setTitle(chapter.getTitle());
        response.setOrderIndex(chapter.getOrderIndex());
        response.setLessons(lessonRepository.findByChapterIdAndDeletedFalseOrderByOrderIndexAsc(chapter.getId()).stream()
                .map(this::toLessonResponse)
                .toList());
        return response;
    }

    private LessonResponse toLessonResponse(Lesson lesson) {
        LessonResponse response = new LessonResponse();
        response.setId(lesson.getId());
        response.setChapterId(lesson.getChapter() != null ? lesson.getChapter().getId() : null);
        response.setTitle(lesson.getTitle());
        response.setLessonType(lesson.getLessonType());
        response.setVideoUrl(lesson.getVideoUrl());
        response.setDocumentUrl(lesson.getDocumentUrl());
        response.setDuration(lesson.getDuration());
        response.setContent(lesson.getContent());
        response.setOrderIndex(lesson.getOrderIndex());
        response.setQuizzes(quizRepository.findByLessonIdAndDeletedFalseOrderByCreatedAtDesc(lesson.getId())
                .stream()
                .map(this::toQuizResponse)
                .toList());
        return response;
    }

    private QuizResponse toQuizResponse(Quiz quiz) {
        QuizResponse response = new QuizResponse();
        response.setId(quiz.getId());
        response.setLessonId(quiz.getLesson() != null ? quiz.getLesson().getId() : null);
        response.setTimeLimit(quiz.getTimeLimit());
        response.setPassScore(quiz.getPassScore());
        response.setCreatedAt(quiz.getCreatedAt());
        return response;
    }

    private CourseContentResponse toCourseContentResponse(Course course) {
        CourseContentResponse response = new CourseContentResponse();
        response.setCourse(toCourseResponse(course));
        response.setChapters(chapterRepository.findByCourseIdAndDeletedFalseOrderByOrderIndexAsc(course.getId()).stream()
                .map(this::toChapterContentResponse)
                .toList());
        return response;
    }

    private Course getOwnedCourse(Long id, User instructor) {
        Course course = courseRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Course not found: " + id));
        if (course.getInstructor() == null || !course.getInstructor().getId().equals(instructor.getId())) {
            throw new SecurityException("You are not the instructor of this course");
        }
        return course;
    }

    private String resolveSlug(String slug, String title) {
        if (slug != null && !slug.trim().isEmpty()) {
            return StringUnitls.toSlug(slug);
        }
        return StringUnitls.toSlug(title);
    }

    private CourseStatus resolveTeacherAdminStatus(boolean submitForReview) {
        return submitForReview ? CourseStatus.PENDING : CourseStatus.DRAFT;
    }
}
