package com.weblearning.service.admin;

import java.util.List;

import com.weblearning.dto.permission.CreatePermissionRequest;
import com.weblearning.dto.permission.PermissionResponse;
import com.weblearning.dto.permission.UpdatePermissionRequest;

public interface PermissionService {
    List<PermissionResponse> getAllPermissions();

    PermissionResponse createPermission(CreatePermissionRequest request);

    PermissionResponse updatePermission(Long id, UpdatePermissionRequest request);

    void deletePermission(Long id);
}
