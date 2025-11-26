package com.gritblog.awsomeblog.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TokenConfirm {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String token;

    private LocalDateTime createdAt ;

    private LocalDateTime confirmedAt;

    private LocalDateTime expiresAt;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public TokenConfirm(User user){
       this.user=user;
       this.token=UUID.randomUUID().toString();
       this.createdAt=LocalDateTime.now();
       this.expiresAt=LocalDateTime.now().plusHours(24);
    }
}
