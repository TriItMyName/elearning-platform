package com.weblearning.service.impl;

import com.weblearning.dto.lesson.LessonResponse;
import com.weblearning.dto.quiz.QuizResponse;
import com.weblearning.entity.Chapter;
import com.weblearning.entity.Lesson;
import com.weblearning.entity.Quiz;
import com.weblearning.entity.User;
import com.weblearning.repository.ChapterRepository;
import com.weblearning.repository.EnrollmentRepository;
import com.weblearning.repository.LessonRepository;
import com.weblearning.repository.QuizRepository;
import com.weblearning.service.CloudinaryUploadService;
import com.weblearning.service.LessonService;
import com.weblearning.utils.StringUnitls;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class LessonServiceImpl implements LessonService {

    private final LessonRepository lessonRepository;
    private final ChapterRepository chapterRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final QuizRepository quizRepository;
    private final CloudinaryUploadService cloudinaryUploadService;

    @Override
    public List<LessonResponse> getByChapterForInstructor(Long courseId, Long chapterId, User instructor) {
        getOwnedChapter(courseId, chapterId, instructor);
        return lessonRepository.findByChapterIdAndDeletedFalseOrderByOrderIndexAsc(chapterId).stream()
                .map(this::toLessonResponse)
                .toList();
    }

    @Override
    public Page<LessonResponse> getByChapterForInstructor(Long courseId, Long chapterId, User instructor, Pageable pageable) {
        getOwnedChapter(courseId, chapterId, instructor);
        return lessonRepository.findByChapterIdAndDeletedFalse(chapterId, pageable)
                .map(this::toLessonResponse);
    }

    @Override
    public Page<LessonResponse> getByChapterForStudent(Long courseId, Long chapterId, User student, Pageable pageable) {
        getEnrolledChapter(courseId, chapterId, student);
        return lessonRepository.findByChapterIdAndDeletedFalse(chapterId, pageable)
                .map(this::toLessonResponse);
    }

    @Override
    public LessonResponse getLessonForStudent(Long courseId, Long chapterId, Long lessonId, User student) {
        getEnrolledChapter(courseId, chapterId, student);
        return toLessonResponse(getLessonInChapter(chapterId, lessonId));
    }

    @Override
    public String getVideoUrlForStudent(Long courseId, Long chapterId, Long lessonId, User student) {
        getEnrolledChapter(courseId, chapterId, student);
        Lesson lesson = getLessonInChapter(chapterId, lessonId);
        if (lesson.getVideoUrl() == null || lesson.getVideoUrl().trim().isEmpty()) {
            throw new IllegalArgumentException("Lesson does not have a video");
        }
        return lesson.getVideoUrl();
    }

    @Override
    public LessonResponse createForInstructor(Long courseId, Long chapterId, Lesson lesson, User instructor) {
        Chapter chapter = getOwnedChapter(courseId, chapterId, instructor);
        lesson.setChapter(chapter);
        lesson.setSlug(StringUnitls.toSlug(lesson.getTitle()));
        return toLessonResponse(lessonRepository.save(lesson));
    }

    @Override
    public LessonResponse updateForInstructor(Long courseId, Long chapterId, Long lessonId, Lesson lesson, User instructor) {
        getOwnedChapter(courseId, chapterId, instructor);
        Lesson existing = getLessonInChapter(chapterId, lessonId);
        existing.setTitle(lesson.getTitle());
        existing.setSlug(StringUnitls.toSlug(lesson.getTitle()));
        existing.setLessonType(lesson.getLessonType());
        existing.setVideoUrl(lesson.getVideoUrl());
        existing.setDocumentUrl(lesson.getDocumentUrl());
        existing.setDuration(lesson.getDuration());
        existing.setContent(lesson.getContent());
        existing.setOrderIndex(lesson.getOrderIndex());
        return toLessonResponse(lessonRepository.save(existing));
    }

    @Override
    public void deleteForInstructor(Long courseId, Long chapterId, Long lessonId, User instructor) {
        getOwnedChapter(courseId, chapterId, instructor);
        Lesson existing = getLessonInChapter(chapterId, lessonId);
        existing.setDeleted(true);
        existing.setDeletedAt(LocalDateTime.now());
        lessonRepository.save(existing);
    }

    @Override
    public List<LessonResponse> reorderForInstructor(Long courseId, Long chapterId, List<Long> lessonIds, User instructor) {
        getOwnedChapter(courseId, chapterId, instructor);

        List<Lesson> lessons = lessonRepository.findByChapterIdAndDeletedFalseOrderByOrderIndexAsc(chapterId);
        Set<Long> idsInChapter = new HashSet<>(lessons.stream().map(Lesson::getId).toList());

        if (!idsInChapter.equals(new HashSet<>(lessonIds))) {
            throw new IllegalArgumentException("Lesson ids do not match this chapter");
        }

        for (int index = 0; index < lessonIds.size(); index++) {
            Long lessonId = lessonIds.get(index);
            Lesson lesson = lessons.stream()
                    .filter(item -> item.getId().equals(lessonId))
                    .findFirst()
                    .orElseThrow(() -> new EntityNotFoundException("Lesson not found: " + lessonId));
            lesson.setOrderIndex(index + 1);
        }

        return lessonRepository.saveAll(lessons).stream()
                .sorted((first, second) -> first.getOrderIndex().compareTo(second.getOrderIndex()))
                .map(this::toLessonResponse)
                .toList();
    }

    @Override
    public LessonResponse uploadVideoForInstructor(Long courseId, Long chapterId, Long lessonId, MultipartFile file, User instructor) {
        getOwnedChapter(courseId, chapterId, instructor);
        Lesson lesson = getLessonInChapter(chapterId, lessonId);
        String videoUrl = cloudinaryUploadService.uploadVideo(file, lessonId);
        lesson.setVideoUrl(videoUrl);
        return toLessonResponse(lessonRepository.save(lesson));
    }

    private Chapter getOwnedChapter(Long courseId, Long chapterId, User instructor) {
        Chapter chapter = getChapterInCourse(courseId, chapterId);
        if (chapter.getCourse().getInstructor() == null
                || !chapter.getCourse().getInstructor().getId().equals(instructor.getId())) {
            throw new SecurityException("You are not the instructor of this course");
        }

        return chapter;
    }

    private Chapter getEnrolledChapter(Long courseId, Long chapterId, User student) {
        Chapter chapter = getChapterInCourse(courseId, chapterId);
        enrollmentRepository.findByCourseIdAndStudentIdAndDeletedFalse(courseId, student.getId())
                .orElseThrow(() -> new SecurityException("You are not enrolled in this course"));

        return chapter;
    }

    private Chapter getChapterInCourse(Long courseId, Long chapterId) {
        Chapter chapter = chapterRepository.findByIdAndDeletedFalse(chapterId)
                .orElseThrow(() -> new EntityNotFoundException("Chapter not found: " + chapterId));

        if (chapter.getCourse() == null || !chapter.getCourse().getId().equals(courseId)) {
            throw new EntityNotFoundException("Chapter not found in course: " + courseId);
        }

        return chapter;
    }

    private Lesson getLessonInChapter(Long chapterId, Long lessonId) {
        Lesson lesson = lessonRepository.findByIdAndDeletedFalse(lessonId)
                .orElseThrow(() -> new EntityNotFoundException("Lesson not found: " + lessonId));

        if (lesson.getChapter() == null || !lesson.getChapter().getId().equals(chapterId)) {
            throw new EntityNotFoundException("Lesson not found in chapter: " + chapterId);
        }

        return lesson;
    }

    private LessonResponse toLessonResponse(Lesson lesson) {
        LessonResponse response = new LessonResponse();
        response.setId(lesson.getId());
        response.setChapterId(lesson.getChapter() != null ? lesson.getChapter().getId() : null);
        response.setTitle(lesson.getTitle());
        response.setSlug(lesson.getSlug());
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
