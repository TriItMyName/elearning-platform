package com.weblearning.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardActivityResponse {
    private Long id;
    private String type;
    private String message;
    private LocalDateTime at;
}
