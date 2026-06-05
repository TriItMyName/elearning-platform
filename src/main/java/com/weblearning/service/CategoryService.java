package com.weblearning.service;

import com.weblearning.entity.Category;

import java.util.List;
import java.util.Optional;

public interface CategoryService {
    Category create(Category category);

    Optional<Category> getById(Long id);

    List<Category> getAll();

    Category update(Long id, Category category);

    void delete(Long id);

    Category getByName(String name);
}

