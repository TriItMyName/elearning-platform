package com.weblearning.service.impl.admin;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.weblearning.dto.permission.CreatePermissionRequest;
import com.weblearning.dto.permission.PermissionResponse;
import com.weblearning.dto.permission.UpdatePermissionRequest;
import com.weblearning.entity.Permission;
import com.weblearning.entity.Role;
import com.weblearning.exception.ResourceNotFoundException;
import com.weblearning.repository.admin.PermissionRepository;
import com.weblearning.service.admin.PermissionService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PermissionServiceImpl implements PermissionService {

    private final PermissionRepository permissionRepository;

    @Override
    public List<PermissionResponse> getAllPermissions() {
        return permissionRepository.findAll().stream()
                .map(this::mapToPermissionResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PermissionResponse createPermission(CreatePermissionRequest request) {
        String permissionName = request.getName().trim().toUpperCase();
        if (permissionRepository.existsByName(permissionName)) {
            throw new IllegalArgumentException("Permission already exists with name: " + permissionName);
        }
        Permission permission = Permission.builder()
                .name(permissionName)
                .description(request.getDescription())
                .build();
        return mapToPermissionResponse(permissionRepository.save(permission));
    }

    @Override
    @Transactional
    public PermissionResponse updatePermission(Long id, UpdatePermissionRequest request) {
        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Permission not found with id: " + id));
        
        String newName = request.getName().trim().toUpperCase();
        if (!permission.getName().equalsIgnoreCase(newName) && permissionRepository.existsByName(newName)) {
            throw new IllegalArgumentException("Permission already exists with name: " + newName);
        }
        permission.setName(newName);
        permission.setDescription(request.getDescription());
        return mapToPermissionResponse(permissionRepository.save(permission));
    }

    @Override
    @Transactional
    public void deletePermission(Long id) {
        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Permission not found with id: " + id));
        
        for (Role role : permission.getRoles()) {
            role.getPermissions().remove(permission);
        }
        permissionRepository.delete(permission);
    }

    private PermissionResponse mapToPermissionResponse(Permission permission) {
        return PermissionResponse.builder()
                .id(permission.getId())
                .name(permission.getName())
                .description(permission.getDescription())
                .build();
    }
}
