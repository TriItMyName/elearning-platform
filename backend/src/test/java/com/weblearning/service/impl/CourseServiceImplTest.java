package com.weblearning.service.impl;

import com.weblearning.dto.course.CourseResponse;
import com.weblearning.entity.Category;
import com.weblearning.entity.Course;
import com.weblearning.entity.User;
import com.weblearning.repository.CourseRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CourseServiceImplTest {

    @Mock
    private CourseRepository courseRepository;

    @InjectMocks
    private CourseServiceImpl courseService;

    @Test
    void createSavesCourse() {
        Course course = new Course();
        course.setTitle("Java");

        when(courseRepository.save(course)).thenReturn(course);

        CourseResponse result = courseService.create(course);

        assertNotNull(result);
        assertEquals("Java", result.getTitle());
        verify(courseRepository).save(course);
    }

    @Test
    void getByIdReturnsOptional() {
        Course course = new Course();
        course.setId(1L);

        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));

        Optional<CourseResponse> result = courseService.getById(1L);

        assertEquals(1L, result.orElseThrow().getId());
    }

    @Test
    void getAllReturnsList() {
        when(courseRepository.findAll()).thenReturn(List.of(new Course()));

        List<CourseResponse> result = courseService.getAll();

        assertEquals(1, result.size());
    }

    @Test
    void updateUpdatesFields() {
        Category category = new Category();
        category.setId(2L);
        User instructor = new User();
        instructor.setId(3L);

        Course existing = new Course();
        existing.setId(1L);

        Course update = new Course();
        update.setTitle("Updated");
        update.setSlug("updated");
        update.setDescription("Desc");
        update.setCategory(category);
        update.setInstructor(instructor);
        update.setStatus(1);
        update.setCreatedAt(LocalDateTime.of(2024, 1, 1, 10, 0));

        when(courseRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(courseRepository.save(existing)).thenReturn(existing);

        CourseResponse result = courseService.update(1L, update);

        assertEquals("Updated", result.getTitle());
        assertEquals("updated", result.getSlug());
        assertEquals("Desc", result.getDescription());
        assertEquals(category.getId(), result.getCategoryId());
        assertEquals(instructor.getId(), result.getInstructorId());
        assertEquals(1, result.getStatus());
        assertEquals(update.getCreatedAt(), result.getCreatedAt());
        verify(courseRepository).save(existing);
    }

    @Test
    void updateThrowsWhenNotFound() {
        when(courseRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> courseService.update(1L, new Course()));
    }

    @Test
    void deleteDeletesWhenExists() {
        when(courseRepository.existsById(1L)).thenReturn(true);

        courseService.delete(1L);

        verify(courseRepository).deleteById(1L);
    }

    @Test
    void deleteThrowsWhenNotFound() {
        when(courseRepository.existsById(1L)).thenReturn(false);

        assertThrows(EntityNotFoundException.class, () -> courseService.delete(1L));
    }
}

