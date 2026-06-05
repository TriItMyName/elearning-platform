package com.weblearning.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.weblearning.dto.course.CreateCourseRequest;
import com.weblearning.dto.course.UpdateCourseRequest;
import com.weblearning.entity.Category;
import com.weblearning.entity.Course;
import com.weblearning.entity.User;
import com.weblearning.service.CourseService;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CourseController.class)
@AutoConfigureMockMvc(addFilters = false)
class CourseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    @MockitoBean
    private CourseService courseService;

    @Test
    void createReturnsCreated() throws Exception {
        Course saved = new Course();
        saved.setId(1L);
        saved.setTitle("Java");
        saved.setSlug("java");
        saved.setDescription("Desc");
        saved.setStatus(1);
        saved.setCreatedAt(LocalDateTime.of(2024, 1, 1, 10, 0));
        saved.setCategory(categoryWithId(2L));
        saved.setInstructor(userWithId(3L));

        when(courseService.create(any(Course.class))).thenReturn(saved);

        CreateCourseRequest request = new CreateCourseRequest(2L, 3L, "Java", "java", "Desc", 1, saved.getCreatedAt());

        mockMvc.perform(post("/api/courses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.categoryId").value(2L));
    }

    @Test
    void createReturnsBadRequestWhenInvalid() throws Exception {
        CreateCourseRequest request = new CreateCourseRequest(null, null, "", "", "Desc", null, null);

        mockMvc.perform(post("/api/courses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getByIdReturnsOk() throws Exception {
        Course course = new Course();
        course.setId(1L);
        course.setTitle("Java");
        course.setSlug("java");
        course.setCategory(categoryWithId(2L));
        course.setInstructor(userWithId(3L));

        when(courseService.getById(1L)).thenReturn(Optional.of(course));

        mockMvc.perform(get("/api/courses/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Java"));
    }

    @Test
    void getByIdReturnsNotFound() throws Exception {
        when(courseService.getById(1L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/courses/1"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getAllReturnsList() throws Exception {
        Course course = new Course();
        course.setId(1L);
        course.setTitle("Java");
        course.setSlug("java");

        when(courseService.getAll()).thenReturn(List.of(course));

        mockMvc.perform(get("/api/courses"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L));
    }

    @Test
    void updateReturnsNotFoundWhenMissing() throws Exception {
        when(courseService.update(eq(1L), any(Course.class)))
                .thenThrow(new EntityNotFoundException("Course not found"));

        UpdateCourseRequest request = new UpdateCourseRequest(2L, 3L, "Java", "java", "Desc", 1, null);

        mockMvc.perform(put("/api/courses/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteReturnsNotFoundWhenMissing() throws Exception {
        doThrow(new EntityNotFoundException("Course not found")).when(courseService).delete(1L);

        mockMvc.perform(delete("/api/courses/1"))
                .andExpect(status().isNotFound());
    }

    private static Category categoryWithId(Long id) {
        Category category = new Category();
        category.setId(id);
        return category;
    }

    private static User userWithId(Long id) {
        User user = new User();
        user.setId(id);
        return user;
    }
}
