package com.weblearning.dto.chapter;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReorderChaptersRequest {
    @NotEmpty
    private List<Long> chapterIds;
}
