package com.weblearning.dto.role;

import java.util.Set;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RoleResponse {
    private Long id;
    private String name;
    private Set<String> permissions;
}
