package com.weblearning.dto.role;

import java.util.Set;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AssignRolesRequest {
    private Set<Long> roleIds;
}
