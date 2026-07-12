package com.weblearning.service;

import com.weblearning.entity.User;

public interface CourseReviewService {
    /**
     * When a published course's content changes, move it back to PENDING for admin re-approval.
     *
     * @return true if status was changed to PENDING
     */
    boolean markPendingReviewIfPublished(Long courseId, User instructor);
}
