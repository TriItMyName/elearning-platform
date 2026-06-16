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
import com.weblearning.repository.ChapterRepository;
import com.weblearning.repository.CourseRepository;
import com.weblearning.repository.EnrollmentRepository;
import com.weblearning.repository.LessonRepository;
import com.weblearning.repository.QuizRepository;
import com.weblearning.service.CourseService;
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
        response.setStatus(course.getStatus());
        response.setCreatedAt(course.getCreatedAt());
        response.setDescription(course.getDescription());
        return response;
    }

    @Override
    public CourseResponse create(Course course) {
        return toCourseResponse(courseRepository.save(course));
    }

    @Override
    public Optional<CourseResponse> getById(Long id) {
        return courseRepository.findByIdAndDeletedFalse(id)
                .map(this::toCourseResponse);
    }

    @Override
    public List<CourseResponse> getAll() {
        return courseRepository.findByDeletedFalse().stream()
                .map(this::toCourseResponse)
                .toList();
    }

    @Override
    public Page<CourseResponse> getAll(Pageable pageable) {
        return courseRepository.findByDeletedFalse(pageable)
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

        return courseRepository.findByDeletedFalse(pageable)
                .map(course -> {
                    CourseResponse response = toCourseResponse(course);
                    response.setEnrolled(enrolledCourseIds.contains(course.getId()));
                    return response;
                });
    }

    @Override
    public CourseContentResponse getCourseContentForStudent(Long id, User student) {
        Course course = courseRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Course not found: " + id));

        enrollmentRepository.findByCourseIdAndStudentIdAndDeletedFalse(id, student.getId())
                .orElseThrow(() -> new SecurityException("You are not enrolled in this course"));

        CourseContentResponse response = new CourseContentResponse();
        response.setCourse(toCourseResponse(course));
        response.setChapters(chapterRepository.findByCourseIdAndDeletedFalseOrderByOrderIndexAsc(id).stream()
                .map(this::toChapterContentResponse)
                .toList());
        return response;
    }

    @Override
    public CourseResponse update(Long id, Course course) {
        Course existing = courseRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Course not found: " + id));
        existing.setTitle(course.getTitle());
        existing.setSlug(course.getSlug());
        existing.setDescription(course.getDescription());
        existing.setCategory(course.getCategory());
        existing.setInstructor(course.getInstructor());
        existing.setStatus(course.getStatus());
        existing.setCreatedAt(course.getCreatedAt());
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
    public CourseResponse createForInstructor(Course course, User instructor) {
        course.setInstructor(instructor);
        return toCourseResponse(courseRepository.save(course));
    }

    @Override
    public CourseResponse updateForInstructor(Long id, Course course, User instructor) {
        Course existing = courseRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Course not found: " + id));
        if (existing.getInstructor() == null || !existing.getInstructor().getId().equals(instructor.getId())) {
            throw new SecurityException("You are not the instructor of this course");
        }
        existing.setTitle(course.getTitle());
        existing.setSlug(course.getSlug());
        existing.setDescription(course.getDescription());
        existing.setCategory(course.getCategory());
        existing.setStatus(course.getStatus());
        existing.setCreatedAt(course.getCreatedAt());
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
}
