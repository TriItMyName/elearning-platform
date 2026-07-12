package com.weblearning.controller.admin;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.weblearning.dto.permission.AssignPermissionsRequest;
import com.weblearning.dto.role.AssignRolesRequest;
import com.weblearning.dto.role.CreateRoleRequest;
import com.weblearning.dto.role.RoleResponse;
import com.weblearning.dto.role.UpdateRoleRequest;
import com.weblearning.service.admin.RoleService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/roles")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminRoleController {

    private final RoleService roleService;

    @GetMapping
    public ResponseEntity<List<RoleResponse>> getAllRoles() {
        return ResponseEntity.ok(roleService.getAllRoles());
    }

    @PostMapping
    public ResponseEntity<RoleResponse> createRole(@RequestBody CreateRoleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(roleService.createRole(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RoleResponse> updateRole(@PathVariable Long id, @RequestBody UpdateRoleRequest request) {
        return ResponseEntity.ok(roleService.updateRole(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRole(@PathVariable Long id) {
        roleService.deleteRole(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/permissions")
    public ResponseEntity<Void> assignPermissionsToRole(@PathVariable Long id,
            @RequestBody AssignPermissionsRequest request) {
        roleService.assignPermissionsToRole(id, request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/users/{userId}")
    public ResponseEntity<Void> assignRolesToUser(@PathVariable Long userId, @RequestBody AssignRolesRequest request) {
        roleService.assignRolesToUser(userId, request);
        return ResponseEntity.ok().build();
    }
}
