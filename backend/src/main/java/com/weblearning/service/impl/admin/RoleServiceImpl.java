package com.weblearning.service.impl.admin;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.weblearning.dto.permission.AssignPermissionsRequest;
import com.weblearning.dto.role.AssignRolesRequest;
import com.weblearning.dto.role.CreateRoleRequest;
import com.weblearning.dto.role.RoleResponse;
import com.weblearning.dto.role.UpdateRoleRequest;
import com.weblearning.entity.Permission;
import com.weblearning.entity.Role;
import com.weblearning.entity.User;
import com.weblearning.exception.ResourceNotFoundException;
import com.weblearning.repository.admin.PermissionRepository;
import com.weblearning.repository.admin.RoleRepository;
import com.weblearning.repository.admin.UserRepository;
import com.weblearning.service.admin.RoleService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final UserRepository userRepository;

    @Override
    public List<RoleResponse> getAllRoles() {
        return roleRepository.findAll().stream()
                .map(this::mapToRoleResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void assignRolesToUser(Long userId, AssignRolesRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        Set<Role> roles = request.getRoleIds().stream()
                .map(roleId -> roleRepository.findById(roleId)
                        .orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + roleId)))
                .collect(Collectors.toSet());
        
        user.setRoles(roles);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void assignPermissionsToRole(Long roleId, AssignPermissionsRequest request) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + roleId));
        
        Set<Permission> permissions = request.getPermissionIds().stream()
                .map(permId -> permissionRepository.findById(permId)
                        .orElseThrow(() -> new ResourceNotFoundException("Permission not found with id: " + permId)))
                .collect(Collectors.toSet());
        
        role.setPermissions(permissions);
        roleRepository.save(role);
    }

    @Override
    @Transactional
    public RoleResponse createRole(CreateRoleRequest request) {
        if (roleRepository.existsByName(request.getName().toUpperCase())) {
            throw new IllegalArgumentException("Role already exists with name: " + request.getName());
        }
        Role role = Role.builder()
                .name(request.getName().toUpperCase())
                .build();
        return mapToRoleResponse(roleRepository.save(role));
    }

    @Override
    @Transactional
    public RoleResponse updateRole(Long id, UpdateRoleRequest request) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + id));
        
        String newName = request.getName().toUpperCase();
        if (!role.getName().equalsIgnoreCase(newName) && roleRepository.existsByName(newName)) {
            throw new IllegalArgumentException("Role already exists with name: " + newName);
        }
        role.setName(newName);
        return mapToRoleResponse(roleRepository.save(role));
    }

    @Override
    @Transactional
    public void deleteRole(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + id));
        
        for (User user : role.getUsers()) {
            user.getRoles().remove(role);
        }
        roleRepository.delete(role);
    }

    private RoleResponse mapToRoleResponse(Role role) {
        return RoleResponse.builder()
                .id(role.getId())
                .name(role.getName())
                .permissions(role.getPermissions() != null ? role.getPermissions().stream()
                        .map(Permission::getName)
                        .collect(Collectors.toSet()) : Set.of())
                .build();
    }
}
