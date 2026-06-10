package com.weblearning.service.impl;

import com.weblearning.dto.category.CategoryResponse;
import com.weblearning.entity.Category;
import com.weblearning.repository.CategoryRepository;
import com.weblearning.service.CategoryService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

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
        return toCategoryResponse(categoryRepository.save(category));
    }

    @Override
    public Optional<CategoryResponse> getById(Long id) {
        return categoryRepository.findById(id)
                .map(this::toCategoryResponse);
    }

    @Override
    public List<CategoryResponse> getAll() {
        return categoryRepository.findAll().stream()
                .map(this::toCategoryResponse)
                .toList();
    }

    @Override
    public Page<CategoryResponse> getAll(Pageable pageable) {
        return categoryRepository.findAll(pageable)
                .map(this::toCategoryResponse);
    }

    @Override
    public CategoryResponse update(Long id, Category category) {
        Category existing = categoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Category not found: " + id));
        existing.setName(category.getName());
        existing.setSlug(category.getSlug());
        existing.setDescription(category.getDescription());
        return toCategoryResponse(categoryRepository.save(existing));
    }

    @Override
    public void delete(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new EntityNotFoundException("Category not found: " + id);
        }
        categoryRepository.deleteById(id);
    }

    @Override
    public CategoryResponse getByName(String name) {
        Category category = categoryRepository.findByName(name)
                .orElseThrow(() -> new EntityNotFoundException("Category not found: " + name));
        return toCategoryResponse(category);
    }
}
