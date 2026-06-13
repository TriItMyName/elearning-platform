package com.weblearning.service.admin;

import java.util.List;

import com.weblearning.dto.category.CategoryResponse;
import com.weblearning.dto.category.CreateCategoryRequest;
import com.weblearning.dto.category.UpdateCategoryRequest;

public interface AdminCategoryService {
    public List<CategoryResponse> getAllCategories();

    public CategoryResponse getCategoryById(Long id);

    public CategoryResponse createCategory(CreateCategoryRequest request);

    public CategoryResponse updateCategory(Long id, UpdateCategoryRequest request);

    public void deleteCategory(Long id);
}
