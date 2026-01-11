package com.gritblog.awsomeblog.repository;

import com.gritblog.awsomeblog.DTO.Status;
import com.gritblog.awsomeblog.models.Post;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PostRepo extends JpaRepository<Post, UUID> {
    List<Post> findByStatus(Status status);
    List<Post> findByAuthorId(UUID userId);
    List<Post> findByTitleContainingIgnoreCase(String keyword);
    List<Post> findByCategoryIdAndStatus(Long categoryId,Status status);
    List<Post> findByStatusOrderByCreatedAtDesc(Status status);
    List<Post>findByAuthorIdAndStatus(UUID authorId, Status status);

    boolean existsBySlug(String slug);
}