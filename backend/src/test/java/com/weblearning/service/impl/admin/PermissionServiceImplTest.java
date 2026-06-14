package com.weblearning.service.impl.admin;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.weblearning.dto.permission.CreatePermissionRequest;
import com.weblearning.dto.permission.PermissionResponse;
import com.weblearning.dto.permission.UpdatePermissionRequest;
import com.weblearning.entity.Permission;
import com.weblearning.entity.Role;
import com.weblearning.exception.ResourceNotFoundException;
import com.weblearning.repository.admin.PermissionRepository;

@ExtendWith(MockitoExtension.class)
class PermissionServiceImplTest {

    @Mock
    private PermissionRepository permissionRepository;

    @InjectMocks
    private PermissionServiceImpl permissionService;

    @Test
    void getAllPermissionsReturnsList() {
        Permission p1 = Permission.builder().id(1L).name("P1").description("Desc 1").build();
        Permission p2 = Permission.builder().id(2L).name("P2").description("Desc 2").build();

        when(permissionRepository.findAll()).thenReturn(List.of(p1, p2));

        List<PermissionResponse> result = permissionService.getAllPermissions();

        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("P1", result.get(0).getName());
        assertEquals("P2", result.get(1).getName());
        verify(permissionRepository).findAll();
    }

    @Test
    void createPermissionSavesPermission() {
        CreatePermissionRequest request = CreatePermissionRequest.builder()
                .name("COURSE_READ")
                .description("Read Course")
                .build();
        Permission permission = Permission.builder()
                .id(1L)
                .name("COURSE_READ")
                .description("Read Course")
                .build();

        when(permissionRepository.existsByName("COURSE_READ")).thenReturn(false);
        when(permissionRepository.save(any(Permission.class))).thenReturn(permission);

        PermissionResponse result = permissionService.createPermission(request);

        assertNotNull(result);
        assertEquals("COURSE_READ", result.getName());
        assertEquals("Read Course", result.getDescription());
        verify(permissionRepository).save(any(Permission.class));
    }

    @Test
    void createPermissionThrowsWhenExists() {
        CreatePermissionRequest request = CreatePermissionRequest.builder()
                .name("COURSE_READ")
                .description("Read Course")
                .build();

        when(permissionRepository.existsByName("COURSE_READ")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> permissionService.createPermission(request));
        verify(permissionRepository, never()).save(any(Permission.class));
    }

    @Test
    void updatePermissionSavesUpdatedPermission() {
        UpdatePermissionRequest request = UpdatePermissionRequest.builder()
                .name("COURSE_WRITE")
                .description("Write Course Updated")
                .build();
        Permission existingPermission = Permission.builder()
                .id(1L)
                .name("COURSE_READ")
                .description("Read Course")
                .build();
        Permission updatedPermission = Permission.builder()
                .id(1L)
                .name("COURSE_WRITE")
                .description("Write Course Updated")
                .build();

        when(permissionRepository.findById(1L)).thenReturn(Optional.of(existingPermission));
        when(permissionRepository.existsByName("COURSE_WRITE")).thenReturn(false);
        when(permissionRepository.save(any(Permission.class))).thenReturn(updatedPermission);

        PermissionResponse result = permissionService.updatePermission(1L, request);

        assertNotNull(result);
        assertEquals("COURSE_WRITE", result.getName());
        assertEquals("Write Course Updated", result.getDescription());
        verify(permissionRepository).save(any(Permission.class));
    }

    @Test
    void updatePermissionThrowsWhenExistsWithDifferentId() {
        UpdatePermissionRequest request = UpdatePermissionRequest.builder()
                .name("COURSE_WRITE")
                .description("Write Course")
                .build();
        Permission existingPermission = Permission.builder()
                .id(1L)
                .name("COURSE_READ")
                .description("Read Course")
                .build();

        when(permissionRepository.findById(1L)).thenReturn(Optional.of(existingPermission));
        when(permissionRepository.existsByName("COURSE_WRITE")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> permissionService.updatePermission(1L, request));
        verify(permissionRepository, never()).save(any(Permission.class));
    }

    @Test
    void updatePermissionThrowsWhenNotFound() {
        UpdatePermissionRequest request = UpdatePermissionRequest.builder()
                .name("COURSE_WRITE")
                .description("Write Course")
                .build();

        when(permissionRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> permissionService.updatePermission(1L, request));
    }

    @Test
    void deletePermissionRemovesFromRolesAndDeletes() {
        Role role = Role.builder().id(1L).name("ADMIN").permissions(new HashSet<>()).build();
        Permission permission = Permission.builder()
                .id(1L)
                .name("COURSE_READ")
                .roles(new HashSet<>(Set.of(role)))
                .build();
        role.getPermissions().add(permission);

        when(permissionRepository.findById(1L)).thenReturn(Optional.of(permission));

        permissionService.deletePermission(1L);

        assertEquals(0, role.getPermissions().size());
        verify(permissionRepository).delete(permission);
    }

    @Test
    void deletePermissionThrowsWhenNotFound() {
        when(permissionRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> permissionService.deletePermission(1L));
        verify(permissionRepository, never()).delete(any(Permission.class));
    }

    @Test
    void createPermissionNormalizesName() {
        CreatePermissionRequest request = CreatePermissionRequest.builder()
                .name("  course_read  ")
                .description("Read Course")
                .build();
        Permission permission = Permission.builder()
                .id(1L)
                .name("COURSE_READ")
                .description("Read Course")
                .build();

        when(permissionRepository.existsByName("COURSE_READ")).thenReturn(false);
        when(permissionRepository.save(any(Permission.class))).thenReturn(permission);

        PermissionResponse result = permissionService.createPermission(request);

        assertNotNull(result);
        assertEquals("COURSE_READ", result.getName());
        verify(permissionRepository).save(any(Permission.class));
    }

    @Test
    void updatePermissionNormalizesName() {
        UpdatePermissionRequest request = UpdatePermissionRequest.builder()
                .name("  course_write  ")
                .description("Write Course")
                .build();
        Permission existingPermission = Permission.builder()
                .id(1L)
                .name("COURSE_READ")
                .description("Read Course")
                .build();
        Permission updatedPermission = Permission.builder()
                .id(1L)
                .name("COURSE_WRITE")
                .description("Write Course")
                .build();

        when(permissionRepository.findById(1L)).thenReturn(Optional.of(existingPermission));
        when(permissionRepository.existsByName("COURSE_WRITE")).thenReturn(false);
        when(permissionRepository.save(any(Permission.class))).thenReturn(updatedPermission);

        PermissionResponse result = permissionService.updatePermission(1L, request);

        assertNotNull(result);
        assertEquals("COURSE_WRITE", result.getName());
        verify(permissionRepository).save(any(Permission.class));
    }
}
