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

import com.weblearning.dto.permission.CreatePermissionRequest;
import com.weblearning.dto.permission.PermissionResponse;
import com.weblearning.dto.permission.UpdatePermissionRequest;
import com.weblearning.service.admin.RoleService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/permissions")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminPermissionController {

    private final RoleService roleService;

    @GetMapping
    public ResponseEntity<List<PermissionResponse>> getAllPermissions() {
        return ResponseEntity.ok(roleService.getAllPermissions());
    }

    @PostMapping
    public ResponseEntity<PermissionResponse> createPermission(@RequestBody CreatePermissionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(roleService.createPermission(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PermissionResponse> updatePermission(@PathVariable Long id, @RequestBody UpdatePermissionRequest request) {
        return ResponseEntity.ok(roleService.updatePermission(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePermission(@PathVariable Long id) {
        roleService.deletePermission(id);
        return ResponseEntity.noContent().build();
    }
}
