package com.weblearning.service;

import com.weblearning.dto.chapter.ChapterResponse;
import com.weblearning.entity.Chapter;
import com.weblearning.entity.User;

import java.util.List;

public interface ChapterService {
    List<ChapterResponse> getByCourseId(Long courseId);

    ChapterResponse createForInstructor(Long courseId, Chapter chapter, User instructor);

    ChapterResponse updateForInstructor(Long courseId, Long chapterId, Chapter chapter, User instructor);

    void deleteForInstructor(Long courseId, Long chapterId, User instructor);

    List<ChapterResponse> reorderForInstructor(Long courseId, List<Long> chapterIds, User instructor);
}
