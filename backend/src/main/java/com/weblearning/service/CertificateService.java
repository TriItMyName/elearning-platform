package com.weblearning.service;

import com.weblearning.dto.certificate.CertificateResponse;
import com.weblearning.entity.User;

import java.util.List;

public interface CertificateService {
    CertificateResponse generateForStudent(Long courseId, User student);

    CertificateResponse getByCourseForStudent(Long courseId, User student);

    List<CertificateResponse> getAllForStudent(User student);

    CertificateResponse verify(String certificateCode);
}
