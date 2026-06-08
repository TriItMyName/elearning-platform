package com.weblearning.service;

import com.weblearning.dto.category.CategoryResponse;
import com.weblearning.entity.Category;

import java.util.List;
import java.util.Optional;

public interface CategoryService {
    CategoryResponse create(Category category);

    Optional<CategoryResponse> getById(Long id);

    List<CategoryResponse> getAll();

    CategoryResponse update(Long id, Category category);

    void delete(Long id);

    CategoryResponse getByName(String name);
}

