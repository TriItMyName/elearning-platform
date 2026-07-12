package com.weblearning.repository.admin;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.weblearning.entity.Role;

public interface RoleRepository extends JpaRepository<Role, Long> {
    // Tìm kiếm vai trò theo tên
    Optional<Role> findByName(String name);

    // Kiểm tra xem có vai trò với tên cụ thể không
    boolean existsByName(String name);
}
