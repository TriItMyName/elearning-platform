package com.weblearning.dto.lesson;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReorderLessonsRequest {
    @NotEmpty
    private List<Long> lessonIds;
}
