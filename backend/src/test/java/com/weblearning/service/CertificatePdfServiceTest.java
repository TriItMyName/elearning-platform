package com.weblearning.service;

import com.weblearning.dto.certificate.CertificateResponse;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.text.PDFTextStripper;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class CertificatePdfServiceTest {

    private final CertificatePdfService service = new CertificatePdfService();

    @Test
    void createsCertificateWithoutWatermark() throws Exception {
        CertificateResponse certificate = new CertificateResponse();
        certificate.setStudentName("Nguyễn Văn An");
        certificate.setCourseTitle("Lập trình Java căn bản");
        certificate.setInstructorName("Trần Minh");
        certificate.setCertificateCode("CERT-ABC12345");
        certificate.setIssuedAt(LocalDateTime.of(2026, 6, 19, 10, 0));

        byte[] pdf = service.create(certificate);

        assertTrue(pdf.length > 1_000);
        try (var document = Loader.loadPDF(pdf)) {
            String text = new PDFTextStripper().getText(document);
            assertTrue(text.contains("Nguyễn Văn An"));
            assertTrue(text.contains("Lập trình Java căn bản"));
            assertTrue(text.contains("CERT-ABC12345"));
            assertFalse(text.contains("WATERMARK"));
        }
    }
}
