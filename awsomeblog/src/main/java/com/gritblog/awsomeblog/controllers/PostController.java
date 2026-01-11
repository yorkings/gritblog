package com.gritblog.awsomeblog.controllers;

import com.gritblog.awsomeblog.DTO.PostRecord;
import com.gritblog.awsomeblog.DTO.PostRequest;
import com.gritblog.awsomeblog.models.Post;
import com.gritblog.awsomeblog.service.PostService;
import com.gritblog.awsomeblog.DTO.Status;
import com.gritblog.awsomeblog.service.ResourceNotFound;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.config.ConfigDataResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/posts")
@RequiredArgsConstructor
public class PostController {
    private final PostService postService;

    @PostMapping
    public ResponseEntity<Post> createPost(@RequestBody PostRequest request, Principal principal) {
        Post createdPost = postService.createPost(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdPost);
    }

    @GetMapping("/{postId}")
    public ResponseEntity<PostRecord> getPostById(@PathVariable UUID postId) {
        postService.incrementPostViews(postId);
        PostRecord post = postService.getPostById(postId);
        return ResponseEntity.ok(post);
    }

    @GetMapping
    public ResponseEntity<List<PostRecord>> getAllPublishedPosts() {
        List<PostRecord> posts = postService.getPublishedPosts();
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<PostRecord>> getPostsByCategory(@PathVariable Long categoryId) {
        List<PostRecord> posts = postService.getByCategoryAndPublished(categoryId);
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/author/{userId}")
    public ResponseEntity<List<PostRecord>> getAuthorPosts(@PathVariable UUID userId) {
        List<PostRecord> posts = postService.getAuthorAndStatus(userId, Status.PUBLISHED);
        return ResponseEntity.ok(posts);
    }

    @PutMapping("/{postId}")
    public ResponseEntity<Post> updatePost(
            @PathVariable UUID postId,
            @RequestBody PostRequest request,
            Principal principal) {
        Post updatedPost = postService.updatePost(request, postId);
        return ResponseEntity.ok(updatedPost);
    }

    @DeleteMapping("/{postId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePost(@PathVariable UUID postId, Principal principal) {
        postService.deletePost(postId);
    }

    @ExceptionHandler(ConfigDataResourceNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public String handleResourceNotFoundException(ResourceNotFound ex) {
        return ex.getMessage();
    }
}