package com.weblearning.service.admin;

import java.util.List;

import com.weblearning.dto.permission.AssignPermissionsRequest;
import com.weblearning.dto.role.AssignRolesRequest;
import com.weblearning.dto.role.CreateRoleRequest;
import com.weblearning.dto.role.RoleResponse;
import com.weblearning.dto.role.UpdateRoleRequest;

public interface RoleService {
    List<RoleResponse> getAllRoles();

    void assignRolesToUser(Long userId, AssignRolesRequest request);

    void assignPermissionsToRole(Long roleId, AssignPermissionsRequest request);

    RoleResponse createRole(CreateRoleRequest request);

    RoleResponse updateRole(Long id, UpdateRoleRequest request);

    void deleteRole(Long id);
}

