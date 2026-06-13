package com.weblearning.service.impl;

import com.weblearning.dto.category.CategoryResponse;
import com.weblearning.entity.Category;
import com.weblearning.repository.CategoryRepository;
import com.weblearning.service.CategoryService;
import com.weblearning.utils.StringUnitls;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    private CategoryResponse toCategoryResponse(Category category) {
        CategoryResponse response = new CategoryResponse();
        response.setId(category.getId());
        response.setName(category.getName());
        response.setSlug(category.getSlug());
        response.setDescription(category.getDescription());
        return response;
    }

    @Override
    public CategoryResponse create(Category category) {
        if (category.getName() != null) {
            category.setSlug(StringUnitls.toSlug(category.getName()));
        }
        return toCategoryResponse(categoryRepository.save(category));
    }

    @Override
    public Optional<CategoryResponse> getById(Long id) {
        return categoryRepository.findByIdAndDeletedFalse(id)
                .map(this::toCategoryResponse);
    }

    @Override
    public List<CategoryResponse> getAll() {
        return categoryRepository.findByDeletedFalse().stream()
                .map(this::toCategoryResponse)
                .toList();
    }

    @Override
    public Page<CategoryResponse> getAll(Pageable pageable) {
        return categoryRepository.findByDeletedFalse(pageable)
                .map(this::toCategoryResponse);
    }

    @Override
    public CategoryResponse update(Long id, Category category) {
        Category existing = categoryRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Category not found: " + id));
        if (category.getName() != null) {
            existing.setName(category.getName());
            existing.setSlug(StringUnitls.toSlug(category.getName()));
        }
        if (category.getDescription() != null) {
            existing.setDescription(category.getDescription());
        }
        return toCategoryResponse(categoryRepository.save(existing));
    }

    @Override
    public void delete(Long id) {
        Category existing = categoryRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Category not found: " + id));
        existing.setDeleted(true);
        existing.setDeletedAt(LocalDateTime.now());
        categoryRepository.save(existing);
    }

    @Override
    public CategoryResponse getByName(String name) {
        Category category = categoryRepository.findByNameAndDeletedFalse(name)
                .orElseThrow(() -> new EntityNotFoundException("Category not found: " + name));
        return toCategoryResponse(category);
    }
}
