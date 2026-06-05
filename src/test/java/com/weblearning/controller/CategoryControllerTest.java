package com.weblearning.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.weblearning.dto.category.CategoryResponse;
import com.weblearning.dto.category.CreateCategoryRequest;
import com.weblearning.dto.category.UpdateCategoryRequest;
import com.weblearning.entity.Category;
import com.weblearning.service.CategoryService;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CategoryController.class)
class CategoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean
    private CategoryService categoryService;

    @Test
    void createReturnsCreated() throws Exception {
        Category saved = new Category();
        saved.setId(1L);
        saved.setName("Design");
        saved.setSlug("design");
        saved.setDescription("Desc");

        when(categoryService.create(any(Category.class))).thenReturn(saved);

        CreateCategoryRequest request = new CreateCategoryRequest("Design", "design", "Desc");

        mockMvc.perform(post("/api/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.slug").value("design"));
    }

    @Test
    void createReturnsBadRequestWhenInvalid() throws Exception {
        CreateCategoryRequest request = new CreateCategoryRequest("", "", "Desc");

        mockMvc.perform(post("/api/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getByIdReturnsOk() throws Exception {
        Category category = new Category();
        category.setId(1L);
        category.setName("Design");
        category.setSlug("design");
        category.setDescription("Desc");

        when(categoryService.getById(1L)).thenReturn(Optional.of(category));

        mockMvc.perform(get("/api/categories/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Design"));
    }

    @Test
    void getByIdReturnsNotFound() throws Exception {
        when(categoryService.getById(1L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/categories/1"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getAllReturnsList() throws Exception {
        Category category = new Category();
        category.setId(1L);
        category.setName("Design");
        category.setSlug("design");

        when(categoryService.getAll()).thenReturn(List.of(category));

        mockMvc.perform(get("/api/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L));
    }

    @Test
    void getByNameReturnsNotFoundWhenMissing() throws Exception {
        when(categoryService.getByName("Missing")).thenThrow(new EntityNotFoundException("Category not found"));

        mockMvc.perform(get("/api/categories/name/Missing"))
                .andExpect(status().isNotFound());
    }

    @Test
    void updateReturnsNotFoundWhenMissing() throws Exception {
        when(categoryService.update(eq(1L), any(Category.class)))
                .thenThrow(new EntityNotFoundException("Category not found"));

        UpdateCategoryRequest request = new UpdateCategoryRequest();
        request.setName("Design");
        request.setSlug("design");
        request.setDescription("Desc");

        mockMvc.perform(put("/api/categories/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteReturnsNotFoundWhenMissing() throws Exception {
        doThrow(new EntityNotFoundException("Category not found")).when(categoryService).delete(1L);

        mockMvc.perform(delete("/api/categories/1"))
                .andExpect(status().isNotFound());
    }
}
