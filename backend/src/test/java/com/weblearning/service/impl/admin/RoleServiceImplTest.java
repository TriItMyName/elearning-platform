package com.weblearning.service.impl.admin;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.weblearning.dto.role.AssignRolesRequest;
import com.weblearning.dto.role.CreateRoleRequest;
import com.weblearning.dto.role.UpdateRoleRequest;
import com.weblearning.dto.permission.AssignPermissionsRequest;
import com.weblearning.dto.role.RoleResponse;
import com.weblearning.entity.Role;
import com.weblearning.entity.User;
import com.weblearning.entity.Permission;
import com.weblearning.repository.admin.PermissionRepository;
import com.weblearning.repository.admin.RoleRepository;
import com.weblearning.repository.admin.UserRepository;

@ExtendWith(MockitoExtension.class)
class RoleServiceImplTest {

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PermissionRepository permissionRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private RoleServiceImpl roleService;

    @Test
    void createRoleSavesRole() {
        CreateRoleRequest request = CreateRoleRequest.builder().name("ADMIN").build();
        Role role = Role.builder().id(1L).name("ADMIN").build();

        when(roleRepository.existsByName("ADMIN")).thenReturn(false);
        when(roleRepository.save(any(Role.class))).thenReturn(role);

        RoleResponse result = roleService.createRole(request);

        assertNotNull(result);
        assertEquals("ADMIN", result.getName());
        verify(roleRepository).save(any(Role.class));
    }

    @Test
    void createRoleThrowsWhenExists() {
        CreateRoleRequest request = CreateRoleRequest.builder().name("ADMIN").build();

        when(roleRepository.existsByName("ADMIN")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> roleService.createRole(request));
    }

    @Test
    void assignRolesToUserSavesUser() {
        User user = User.builder().id(1L).username("test").roles(new HashSet<>()).build();
        Role role = Role.builder().id(1L).name("TEACHER").build();
        AssignRolesRequest request = AssignRolesRequest.builder().roleIds(Set.of(1L)).build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(roleRepository.findById(1L)).thenReturn(Optional.of(role));

        roleService.assignRolesToUser(1L, request);

        assertEquals(1, user.getRoles().size());
        verify(userRepository).save(user);
    }

    @Test
    void createRoleNormalizesName() {
        CreateRoleRequest request = CreateRoleRequest.builder().name("  manager  ").build();
        Role role = Role.builder().id(1L).name("MANAGER").build();

        when(roleRepository.existsByName("MANAGER")).thenReturn(false);
        when(roleRepository.save(any(Role.class))).thenReturn(role);

        RoleResponse result = roleService.createRole(request);

        assertNotNull(result);
        assertEquals("MANAGER", result.getName());
        verify(roleRepository).save(any(Role.class));
    }

    @Test
    void updateRoleNormalizesName() {
        UpdateRoleRequest request = UpdateRoleRequest.builder().name("  super_admin  ").build();
        Role role = Role.builder().id(1L).name("ADMIN").build();
        Role updatedRole = Role.builder().id(1L).name("SUPER_ADMIN").build();

        when(roleRepository.findById(1L)).thenReturn(Optional.of(role));
        when(roleRepository.existsByName("SUPER_ADMIN")).thenReturn(false);
        when(roleRepository.save(any(Role.class))).thenReturn(updatedRole);

        RoleResponse result = roleService.updateRole(1L, request);

        assertNotNull(result);
        assertEquals("SUPER_ADMIN", result.getName());
        verify(roleRepository).save(any(Role.class));
    }

    @Test
    void assignPermissionsToRoleSavesRole() {
        Role role = Role.builder().id(1L).name("ADMIN").permissions(new HashSet<>()).build();
        Permission permission = Permission.builder().id(1L).name("COURSE_WRITE").build();
        AssignPermissionsRequest request = AssignPermissionsRequest.builder().permissionIds(Set.of(1L)).build();

        when(roleRepository.findById(1L)).thenReturn(Optional.of(role));
        when(permissionRepository.findById(1L)).thenReturn(Optional.of(permission));

        roleService.assignPermissionsToRole(1L, request);

        assertEquals(1, role.getPermissions().size());
        verify(roleRepository).save(role);
    }
}

