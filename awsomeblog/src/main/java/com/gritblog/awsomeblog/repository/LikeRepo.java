package com.gritblog.awsomeblog.repository;

import com.gritblog.awsomeblog.models.Like;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LikeRepo extends JpaRepository<Like, UUID> {
    List<Like>findByPostId(UUID post);
    Optional<Like> findByPostIdAndUserId(UUID postId,UUID userId);
}