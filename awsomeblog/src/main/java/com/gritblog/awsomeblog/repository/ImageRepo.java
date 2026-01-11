package com.gritblog.awsomeblog.repository;

import com.gritblog.awsomeblog.models.Image;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ImageRepo extends JpaRepository<Image, UUID> {
    List<Image> findByPostId(UUID uuid);
}
