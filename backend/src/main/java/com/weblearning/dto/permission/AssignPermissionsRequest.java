package com.weblearning.dto.permission;

import java.util.Set;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignPermissionsRequest {
    @NotEmpty(message = "Danh sách permission IDs không được để trống")
    private Set<Long> permissionIds;
}
