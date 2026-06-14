package com.weblearning.dto.permission;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PermissionResponse {
    private Long id;
    private String name;
    private String description;
}
