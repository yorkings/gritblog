package com.gritblog.awsomeblog.DTO;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record PostRecord(UUID id, String title,
                         String content,
                         String slug,
                         Status status,
                         List<String> imageUrls,
                         LocalDateTime createdAt,
                         LocalDateTime updatedAt,
                         String authorUsername,
                         UUID authorId
                         ) {
}
