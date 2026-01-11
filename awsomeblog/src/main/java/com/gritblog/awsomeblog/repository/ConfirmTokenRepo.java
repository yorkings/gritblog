package com.gritblog.awsomeblog.repository;

import com.gritblog.awsomeblog.models.TokenConfirm;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ConfirmTokenRepo extends JpaRepository<TokenConfirm,UUID> {
    Optional<TokenConfirm> findByToken(String token);
}
