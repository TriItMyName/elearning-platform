package com.weblearning.repository.admin;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.weblearning.entity.Category;

@Repository
public interface AdminCategoryRepository extends JpaRepository<Category, Long> {
    boolean existsByName(String name);
}
