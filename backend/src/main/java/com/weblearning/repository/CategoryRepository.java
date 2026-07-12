package com.weblearning.repository;

import com.weblearning.entity.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByName(String name);

    Optional<Category> findByNameAndDeletedFalse(String name);

    Optional<Category> findByIdAndDeletedFalse(Long id);

    List<Category> findByDeletedFalse();

    Page<Category> findByDeletedFalse(Pageable pageable);
}
