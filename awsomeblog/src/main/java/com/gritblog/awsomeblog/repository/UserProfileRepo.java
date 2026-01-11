package com.gritblog.awsomeblog.repository;

import com.gritblog.awsomeblog.models.User;
import com.gritblog.awsomeblog.models.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserProfileRepo extends JpaRepository<UserProfile, UUID> {
    Optional<UserProfile> findByUser(User user);
}
