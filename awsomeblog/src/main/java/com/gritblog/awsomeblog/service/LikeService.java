package com.gritblog.awsomeblog.service;

import com.gritblog.awsomeblog.models.Like;
import com.gritblog.awsomeblog.models.Post;
import com.gritblog.awsomeblog.models.User;
import com.gritblog.awsomeblog.repository.LikeRepo;
import com.gritblog.awsomeblog.repository.PostRepo;
import com.gritblog.awsomeblog.repository.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LikeService {
    private final LikeRepo likeRepo;
    private final PostRepo postRepo;
    private final UserRepo userRepo;

    @Transactional
    public boolean toggleLike(UUID postId, UUID userId) {
        Optional<Like> existingLike = likeRepo.findByPostIdAndUserId(postId, userId);
        if (existingLike.isPresent()) {
            likeRepo.delete(existingLike.get());
            return  false;
        }
        else{
            Post post = postRepo.findById(postId).orElseThrow(() -> new ResourceNotFound("Post not found"));
            User user = userRepo.findById(userId).orElseThrow(() -> new ResourceNotFound("User not found"));
            Like addLike=Like.builder()
                    .post(post)
                    .user(user)
                    .build();
            likeRepo.save(addLike);
            return true;
        }
    }
    public Long getLikeCountForPost(UUID postId) {
        return (long) likeRepo.findByPostId(postId).size();
    }
}
