package com.weblearning.service;

import com.weblearning.dto.certificate.CertificateResponse;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType0Font;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class CertificatePdfService {

    private static final PDRectangle PAGE_SIZE = new PDRectangle(PDRectangle.A4.getHeight(), PDRectangle.A4.getWidth());
    private static final Color ACCENT = new Color(164, 55, 0);
    private static final Color ACCENT_BRIGHT = new Color(205, 71, 0);
    private static final Color TEXT = new Color(25, 28, 29);
    private static final Color MUTED = new Color(84, 96, 103);
    private static final Color PAPER = new Color(248, 250, 251);
    private static final Color CARD = new Color(242, 244, 245);
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    public byte[] create(CertificateResponse certificate) {
        try (PDDocument document = new PDDocument(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            PDPage page = new PDPage(PAGE_SIZE);
            document.addPage(page);

            PDFont regular = loadFont(document, false);
            PDFont bold = loadFont(document, true);

            try (PDPageContentStream canvas = new PDPageContentStream(document, page)) {
                drawCertificate(document, canvas, certificate, regular, bold);
            }

            document.save(output);
            return output.toByteArray();
        } catch (IOException ex) {
            throw new IllegalStateException("Could not create certificate PDF", ex);
        }
    }

    private void drawCertificate(
            PDDocument document,
            PDPageContentStream canvas,
            CertificateResponse certificate,
            PDFont regular,
            PDFont bold
    ) throws IOException {
        float width = PAGE_SIZE.getWidth();
        float height = PAGE_SIZE.getHeight();

        fillRect(canvas, 0, 0, width, height, PAPER);
        strokeRoundedRect(canvas, 8, 8, width - 16, height - 16, 10, ACCENT, 2);
        drawCornerSeal(document, canvas, height);

        fillRoundedRect(canvas, width / 2 - 20, 482, 40, 40, 7, ACCENT_BRIGHT);
        drawMedalIcon(canvas, width / 2, 502);
        centeredText(canvas, "W E B L E A R N I N G", bold, 9, width / 2, 460, ACCENT);

        centeredText(canvas, "CHỨNG NHẬN HOÀN THÀNH", bold, 23, width / 2, 408, ACCENT);
        centeredText(canvas, "Chứng nhận học viên đã hoàn thành khóa học", regular, 11, width / 2, 376, MUTED);
        centeredText(canvas, "TRAO TẶNG CHO", bold, 9, width / 2, 332, new Color(143, 112, 102));

        centeredFittedText(canvas, value(certificate.getStudentName()), bold, 27, 16, width / 2, 280, TEXT, width - 160);
        strokeLine(canvas, 120, 261, width - 120, 261, new Color(227, 191, 178), 1.2f);
        centeredText(canvas, "Đã hoàn thành xuất sắc chương trình đào tạo", regular, 11, width / 2, 224, new Color(90, 65, 56));
        centeredFittedText(canvas, value(certificate.getCourseTitle()), bold, 17, 11, width / 2, 189, ACCENT, width - 150);

        strokeLine(canvas, 42, 128, width - 42, 128, new Color(227, 191, 178), 1);
        float cardY = 38;
        float cardH = 72;
        float gap = 14;
        float cardW = (width - 84 - gap * 2) / 3;
        drawMeta(canvas, 42, cardY, cardW, cardH, "GIẢNG VIÊN", valueOrDash(certificate.getInstructorName()), regular, bold);
        drawMeta(canvas, 42 + cardW + gap, cardY, cardW, cardH, "NGÀY CẤP",
                certificate.getIssuedAt() == null ? "-" : DATE_FORMAT.format(certificate.getIssuedAt()), regular, bold);
        drawMeta(canvas, 42 + (cardW + gap) * 2, cardY, cardW, cardH, "MÃ CHỨNG CHỈ", value(certificate.getCertificateCode()), regular, bold);
    }

    private void drawCornerSeal(PDDocument document, PDPageContentStream canvas, float height) throws IOException {
        try (InputStream input = getClass().getResourceAsStream("/images/certificate-seal.png")) {
            if (input == null) {
                return;
            }
            PDImageXObject seal = PDImageXObject.createFromByteArray(document, input.readAllBytes(), "certificate-seal");
            float maxWidth = 147;
            float maxHeight = 98;
            float scale = Math.min(maxWidth / seal.getWidth(), maxHeight / seal.getHeight());
            float sealWidth = seal.getWidth() * scale;
            float sealHeight = seal.getHeight() * scale;
            canvas.drawImage(seal, 0, height - 12 - sealHeight, sealWidth, sealHeight);
        }
    }

    private void drawMedalIcon(PDPageContentStream canvas, float centerX, float centerY) throws IOException {
        canvas.setStrokingColor(Color.WHITE);
        canvas.setLineWidth(1.5f);
        canvas.setLineCapStyle(1);
        canvas.setLineJoinStyle(1);

        float scale = 0.75f;

        canvas.moveTo(iconX(centerX, scale, 7.21f), iconY(centerY, scale, 15));
        canvas.lineTo(iconX(centerX, scale, 2.66f), iconY(centerY, scale, 7.14f));
        canvas.curveTo(
                iconX(centerX, scale, 2.3f), iconY(centerY, scale, 6.4f),
                iconX(centerX, scale, 2.35f), iconY(centerY, scale, 5.6f),
                iconX(centerX, scale, 2.79f), iconY(centerY, scale, 4.94f)
        );
        canvas.lineTo(iconX(centerX, scale, 4.4f), iconY(centerY, scale, 2.8f));
        canvas.curveTo(
                iconX(centerX, scale, 4.78f), iconY(centerY, scale, 2.3f),
                iconX(centerX, scale, 5.36f), iconY(centerY, scale, 2),
                iconX(centerX, scale, 6), iconY(centerY, scale, 2)
        );
        canvas.lineTo(iconX(centerX, scale, 18), iconY(centerY, scale, 2));
        canvas.curveTo(
                iconX(centerX, scale, 18.64f), iconY(centerY, scale, 2),
                iconX(centerX, scale, 19.22f), iconY(centerY, scale, 2.3f),
                iconX(centerX, scale, 19.6f), iconY(centerY, scale, 2.8f)
        );
        canvas.lineTo(iconX(centerX, scale, 21.2f), iconY(centerY, scale, 4.94f));
        canvas.curveTo(
                iconX(centerX, scale, 21.65f), iconY(centerY, scale, 5.6f),
                iconX(centerX, scale, 21.7f), iconY(centerY, scale, 6.4f),
                iconX(centerX, scale, 21.34f), iconY(centerY, scale, 7.14f)
        );
        canvas.lineTo(iconX(centerX, scale, 16.79f), iconY(centerY, scale, 15));
        canvas.stroke();

        drawIconLine(canvas, centerX, centerY, scale, 11, 12, 5.12f, 2.2f);
        drawIconLine(canvas, centerX, centerY, scale, 13, 12, 18.88f, 2.2f);
        drawIconLine(canvas, centerX, centerY, scale, 8, 7, 16, 7);

        float circleX = iconX(centerX, scale, 12);
        float circleY = iconY(centerY, scale, 17);
        float radius = 5 * scale;
        float control = radius * 0.55228475f;
        canvas.moveTo(circleX + radius, circleY);
        canvas.curveTo(circleX + radius, circleY + control, circleX + control, circleY + radius, circleX, circleY + radius);
        canvas.curveTo(circleX - control, circleY + radius, circleX - radius, circleY + control, circleX - radius, circleY);
        canvas.curveTo(circleX - radius, circleY - control, circleX - control, circleY - radius, circleX, circleY - radius);
        canvas.curveTo(circleX + control, circleY - radius, circleX + radius, circleY - control, circleX + radius, circleY);
        canvas.closePath();
        canvas.stroke();

        canvas.moveTo(iconX(centerX, scale, 12), iconY(centerY, scale, 18));
        canvas.lineTo(iconX(centerX, scale, 12), iconY(centerY, scale, 16));
        canvas.lineTo(iconX(centerX, scale, 11.5f), iconY(centerY, scale, 16));
        canvas.stroke();
    }

    private void drawIconLine(PDPageContentStream canvas, float centerX, float centerY, float scale,
                              float x1, float y1, float x2, float y2) throws IOException {
        canvas.moveTo(iconX(centerX, scale, x1), iconY(centerY, scale, y1));
        canvas.lineTo(iconX(centerX, scale, x2), iconY(centerY, scale, y2));
        canvas.stroke();
    }

    private float iconX(float centerX, float scale, float x) {
        return centerX + (x - 12) * scale;
    }

    private float iconY(float centerY, float scale, float y) {
        return centerY + (12 - y) * scale;
    }

    private void drawMeta(PDPageContentStream canvas, float x, float y, float w, float h,
                          String label, String value, PDFont regular, PDFont bold) throws IOException {
        fillRoundedRect(canvas, x, y, w, h, 7, CARD);
        strokeRoundedRect(canvas, x, y, w, h, 7, new Color(227, 191, 178), 0.5f);
        text(canvas, label, regular, 8, x + 12, y + h - 21, MUTED);
        fittedText(canvas, value, bold, 11, 8, x + 12, y + 22, TEXT, w - 24);
    }

    private PDFont loadFont(PDDocument document, boolean bold) throws IOException {
        List<Path> candidates = bold
                ? List.of(Path.of("C:/Windows/Fonts/arialbd.ttf"), Path.of("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"))
                : List.of(Path.of("C:/Windows/Fonts/arial.ttf"), Path.of("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"),
                        Path.of("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"));
        for (Path candidate : candidates) {
            if (Files.isRegularFile(candidate)) {
                return PDType0Font.load(document, candidate.toFile());
            }
        }
        throw new IllegalStateException("A Unicode font (Arial or DejaVu Sans) is required to create certificate PDFs");
    }

    private void centeredText(PDPageContentStream canvas, String text, PDFont font, float size,
                              float centerX, float y, Color color) throws IOException {
        float x = centerX - textWidth(text, font, size) / 2;
        text(canvas, text, font, size, x, y, color);
    }

    private void centeredFittedText(PDPageContentStream canvas, String text, PDFont font, float preferredSize,
                                    float minimumSize, float centerX, float y, Color color, float maxWidth) throws IOException {
        float size = fittedSize(text, font, preferredSize, minimumSize, maxWidth);
        centeredText(canvas, text, font, size, centerX, y, color);
    }

    private void fittedText(PDPageContentStream canvas, String text, PDFont font, float preferredSize,
                            float minimumSize, float x, float y, Color color, float maxWidth) throws IOException {
        text(canvas, text, font, fittedSize(text, font, preferredSize, minimumSize, maxWidth), x, y, color);
    }

    private float fittedSize(String text, PDFont font, float preferredSize, float minimumSize, float maxWidth) throws IOException {
        float size = preferredSize;
        while (size > minimumSize && textWidth(text, font, size) > maxWidth) {
            size -= 0.5f;
        }
        return size;
    }

    private float textWidth(String text, PDFont font, float size) throws IOException {
        return font.getStringWidth(text) / 1000 * size;
    }

    private void text(PDPageContentStream canvas, String text, PDFont font, float size,
                      float x, float y, Color color) throws IOException {
        canvas.beginText();
        canvas.setFont(font, size);
        canvas.setNonStrokingColor(color);
        canvas.newLineAtOffset(x, y);
        canvas.showText(text);
        canvas.endText();
    }

    private void fillRect(PDPageContentStream canvas, float x, float y, float w, float h, Color color) throws IOException {
        canvas.setNonStrokingColor(color);
        canvas.addRect(x, y, w, h);
        canvas.fill();
    }

    private void fillRoundedRect(PDPageContentStream canvas, float x, float y, float w, float h,
                                 float radius, Color color) throws IOException {
        canvas.setNonStrokingColor(color);
        addRoundedRect(canvas, x, y, w, h, radius);
        canvas.fill();
    }

    private void strokeRoundedRect(PDPageContentStream canvas, float x, float y, float w, float h,
                                   float radius, Color color, float lineWidth) throws IOException {
        canvas.setStrokingColor(color);
        canvas.setLineWidth(lineWidth);
        addRoundedRect(canvas, x, y, w, h, radius);
        canvas.stroke();
    }

    private void addRoundedRect(PDPageContentStream canvas, float x, float y, float w, float h,
                                float radius) throws IOException {
        float r = Math.min(radius, Math.min(w, h) / 2);
        float control = r * 0.55228475f;

        canvas.moveTo(x + r, y);
        canvas.lineTo(x + w - r, y);
        canvas.curveTo(x + w - r + control, y, x + w, y + r - control, x + w, y + r);
        canvas.lineTo(x + w, y + h - r);
        canvas.curveTo(x + w, y + h - r + control, x + w - r + control, y + h, x + w - r, y + h);
        canvas.lineTo(x + r, y + h);
        canvas.curveTo(x + r - control, y + h, x, y + h - r + control, x, y + h - r);
        canvas.lineTo(x, y + r);
        canvas.curveTo(x, y + r - control, x + r - control, y, x + r, y);
        canvas.closePath();
    }

    private void strokeLine(PDPageContentStream canvas, float x1, float y1, float x2, float y2,
                            Color color, float lineWidth) throws IOException {
        canvas.setStrokingColor(color);
        canvas.setLineWidth(lineWidth);
        canvas.moveTo(x1, y1);
        canvas.lineTo(x2, y2);
        canvas.stroke();
    }

    private String value(String value) {
        return value == null ? "" : value;
    }

    private String valueOrDash(String value) {
        return value == null || value.isBlank() ? "-" : value;
    }
}
