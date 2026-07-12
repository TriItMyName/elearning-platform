package com.weblearning.dto.category;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCategoryRequest {
    private Long id;

    @Size(max = 100)
    private String name;

    @Size(max = 120)
    private String slug;

    @Size(max = 255)
    private String description;
}
