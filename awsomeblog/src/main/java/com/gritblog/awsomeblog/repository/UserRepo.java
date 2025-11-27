package com.gritblog.awsomeblog.repository;

import com.gritblog.awsomeblog.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepo extends JpaRepository<User,UUID> {
     Optional<User>findByUsername(String name);
     Optional<User>findByEmail(String email);
     boolean existsByUsername(String name);
    boolean existsByEmail(String email);


}
