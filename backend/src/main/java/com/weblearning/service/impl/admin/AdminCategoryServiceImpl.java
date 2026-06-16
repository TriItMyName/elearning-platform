package com.weblearning.service.impl.admin;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.weblearning.dto.category.CategoryResponse;
import com.weblearning.dto.category.CreateCategoryRequest;
import com.weblearning.dto.category.UpdateCategoryRequest;
import com.weblearning.entity.Category;
import com.weblearning.exception.AlreadyUserException;
import com.weblearning.repository.admin.AdminCategoryRepository;
import com.weblearning.service.admin.AdminCategoryService;

import com.weblearning.utils.StringUnitls;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminCategoryServiceImpl implements AdminCategoryService {

    private final AdminCategoryRepository adminCategoryRepository;

    private CategoryResponse mapToCategoryResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .build();
    }

    @Override
    public CategoryResponse createCategory(CreateCategoryRequest request) {
        if (adminCategoryRepository.existsByName(request.getName())) {
            throw new AlreadyUserException("Category already exists");
        }
        Category category = Category.builder()
                .name(request.getName())
                .slug(StringUnitls.toSlug(request.getName()))
                .description(request.getDescription())
                .build();
        Category savedCategory = adminCategoryRepository.save(category);
        return mapToCategoryResponse(savedCategory);
    }

    @Override
    public void deleteCategory(Long id) {
        if (!adminCategoryRepository.existsById(id)) {
            throw new AlreadyUserException("Category not found");
        }
        adminCategoryRepository.deleteById(id);
    }

    @Override
    public Page<CategoryResponse> getAllCategories(Pageable pageable) {
        return adminCategoryRepository.findAll(pageable).map(this::mapToCategoryResponse);
    }

    @Override
    public CategoryResponse updateCategory(Long id, UpdateCategoryRequest request) {
        if (!adminCategoryRepository.existsById(id)) {
            throw new AlreadyUserException("Category not found");
        }
        Category category = adminCategoryRepository.findById(id).get();
        if (request.getName() != null) {
            category.setName(request.getName());
            category.setSlug(StringUnitls.toSlug(request.getName()));
        }
        if (request.getDescription() != null) {
            category.setDescription(request.getDescription());
        }
        Category updatedCategory = adminCategoryRepository.save(category);
        return mapToCategoryResponse(updatedCategory);
    }

    @Override
    public CategoryResponse getCategoryById(Long id) {
        if (!adminCategoryRepository.existsById(id)) {
            throw new AlreadyUserException("Category not found");
        }
        Category category = adminCategoryRepository.findById(id).get();
        return mapToCategoryResponse(category);
    }

}
