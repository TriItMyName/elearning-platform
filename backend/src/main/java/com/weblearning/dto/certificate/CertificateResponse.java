package com.weblearning.dto.certificate;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CertificateResponse {
    private Long id;
    private Long courseId;
    private String courseTitle;
    private Long studentId;
    private String studentName;
    private Long instructorId;
    private String instructorName;
    private String certificateCode;
    private Float progress;
    private LocalDateTime issuedAt;
}
