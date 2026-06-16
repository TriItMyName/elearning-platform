package com.weblearning.configs;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.weblearning.entity.Permission;
import com.weblearning.entity.Role;
import com.weblearning.entity.User;
import com.weblearning.entity.enums.UserStatus;
import com.weblearning.repository.admin.PermissionRepository;
import com.weblearning.repository.admin.RoleRepository;
import com.weblearning.repository.admin.UserRepository;

import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EntityManager entityManager;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Fix legacy course admin_status values
        try {
            entityManager.createNativeQuery(
                    "UPDATE courses SET admin_status = 'DRAFT' WHERE admin_status = '0'").executeUpdate();
            entityManager.createNativeQuery(
                    "UPDATE courses SET admin_status = 'PUBLISHED' WHERE admin_status = '1'").executeUpdate();
            entityManager.createNativeQuery(
                    "UPDATE courses SET admin_status = 'ARCHIVED' WHERE admin_status = '2'").executeUpdate();
        } catch (Exception e) {
            System.err.println("Failed to migrate legacy course status: " + e.getMessage());
        }
        // Initialize Permissions
        Permission readCourse = getOrCreatePermission("COURSE_READ", "Xem khóa học");
        Permission writeCourse = getOrCreatePermission("COURSE_WRITE", "Tạo và cập nhật khóa học");
        Permission deleteCourse = getOrCreatePermission("COURSE_DELETE", "Xóa khóa học");
        Permission manageUsers = getOrCreatePermission("USER_MANAGE", "Quản lý người dùng");

        // Initialize Roles
        Role adminRole = getOrCreateRole("ADMIN");
        Role teacherRole = getOrCreateRole("TEACHER");
        Role studentRole = getOrCreateRole("STUDENT");

        // Assign Permissions to Roles if not already assigned
        if (adminRole.getPermissions() == null || adminRole.getPermissions().isEmpty()) {
            adminRole.setPermissions(new HashSet<>(Set.of(readCourse, writeCourse, deleteCourse, manageUsers)));
            roleRepository.save(adminRole);
        }
        if (teacherRole.getPermissions() == null || teacherRole.getPermissions().isEmpty()) {
            teacherRole.setPermissions(new HashSet<>(Set.of(readCourse, writeCourse)));
            roleRepository.save(teacherRole);
        }
        if (studentRole.getPermissions() == null || studentRole.getPermissions().isEmpty()) {
            studentRole.setPermissions(new HashSet<>(Set.of(readCourse)));
            roleRepository.save(studentRole);
        }

        // Initialize default admin user if none exists
        if (userRepository.count() == 0) {
            User admin = User.builder()
                    .username("admin")
                    .fullName("System Administrator")
                    .email("admin@weblearning.com")
                    .password(passwordEncoder.encode("admin123"))
                    .status(UserStatus.ACTIVE)
                    .roles(new HashSet<>(Set.of(adminRole)))
                    .build();
            userRepository.save(admin);
        }
    }

    private Permission getOrCreatePermission(String name, String description) {
        return permissionRepository.findByName(name)
                .orElseGet(() -> permissionRepository.save(
                        Permission.builder().name(name).description(description).build()));
    }

    private Role getOrCreateRole(String name) {
        return roleRepository.findByName(name)
                .orElseGet(() -> roleRepository.save(
                        Role.builder().name(name).build()));
    }
}
