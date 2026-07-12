package com.weblearning.utils;

import java.text.Normalizer;
import java.util.Locale;

public class StringUnitls {
    public static String slugify(String input) {

        input = input.trim();
        input = input.toLowerCase();

        input = Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("[á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ]", "a")
                .replaceAll("[é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ]", "e")
                .replaceAll("[i|í|ì|ỉ|ĩ|ị]", "i")
                .replaceAll("[ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ]", "o")
                .replaceAll("[ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự]", "u")
                .replaceAll("[ý|ỳ|ỷ|ỹ|ỵ]", "y")
                .replaceAll("[đ|Đ]", "d")
                .replaceAll("[^\\p{ASCII}]", "")
                .replaceAll("[^\\w+]", "-")
                .replaceAll("\\s+", "-")
                .replaceAll("[-]+", "-")
                .replaceAll("^-", "")
                .replaceAll("-$", "");
        return input;
    }

    public static String toSlug(String value) {
        String v = slugify(value);
        String normalized = Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
        return normalized.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9\\s-]", "")
                .trim()
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-");
    }

}
