package com.weblearning.repository.admin;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

import com.weblearning.entity.Permission;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, Long> {
    // Tìm kiếm quyền theo tên
    Optional<Permission> findByName(String name);

    // Kiểm tra xem có quyền với tên cụ thể không
    boolean existsByName(String name);
}
