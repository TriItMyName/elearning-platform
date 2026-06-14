package com.weblearning.dto.role;

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
public class AssignRolesRequest {
    @NotEmpty(message = "Danh sách role IDs không được để trống")
    private Set<Long> roleIds;
}
