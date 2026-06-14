package com.weblearning.dto.permission;

import java.util.Set;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AssignPermissionsRequest {
    private Set<Long> permissionIds;
}
