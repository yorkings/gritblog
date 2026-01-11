package com.gritblog.awsomeblog.DTO;

import java.util.List;
import java.util.UUID;

public record PostRequest(UUID userId, Long categoryId, List<String> imageUrls, String title, String content, Status status) {
}
