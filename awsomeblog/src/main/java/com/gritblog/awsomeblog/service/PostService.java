package com.gritblog.awsomeblog.service;

import com.gritblog.awsomeblog.DTO.PostRecord;
import com.gritblog.awsomeblog.DTO.PostRequest;
import com.gritblog.awsomeblog.DTO.Status;
import com.gritblog.awsomeblog.models.Category;
import com.gritblog.awsomeblog.models.Image;
import com.gritblog.awsomeblog.models.Post;
import com.gritblog.awsomeblog.models.User;
import com.gritblog.awsomeblog.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PostService {
    private final PostRepo postRepo;
    private final UserRepo userRepo;
    private final LikeRepo likeRepo;
    private final CategoryRepo categoryRepo;
    private final ImageRepo imageRepo;

    @Transactional
    public Post createPost(PostRequest request) {
        User author = userRepo.findById(request.userId()).orElseThrow(() -> new RuntimeException("author not found"));
        Category cate = categoryRepo.findById(request.categoryId()).orElseThrow(() -> new RuntimeException("category searched not found"));
        String slug = generateUniqueSlug(request.title());
        Post newPost = Post.builder()
                .title(request.title())
                .author(author)
                .category(cate)
                .slug(slug)
                .status(request.status())
                .content(request.content())
                .images(new ArrayList<>())
                .build();
        Post savedPost = postRepo.save(newPost);
        if (request.imageUrls() != null && !request.imageUrls().isEmpty()) {
            List<Image> savingImage = new ArrayList<>();
            for (String url : request.imageUrls()) {
                Image image = Image.builder()
                        .post(savedPost)
                        .imageUrl(url)
                        .build();
                savingImage.add(image);
                savedPost.getImages().add(image);
            }
            imageRepo.saveAll(savingImage);
        }
        return savedPost;
    }

    @Transactional
    public Post updatePost(PostRequest request, UUID postId) {
        Post post = postRepo.findById(postId).orElseThrow(() -> new RuntimeException("Post not found with ID: " + postId));
        Category category = categoryRepo.findById(request.categoryId()).orElseThrow(() -> new RuntimeException("Category not found with ID: " + request.categoryId()));
        post.setTitle(request.title());
        post.setCategory(category);
        post.setUpdatedAt(LocalDateTime.now());
        post.setContent(request.content());
        post.setStatus(request.status());
        if (!post.getTitle().equals(request.title())) {
            post.setSlug(generateUniqueSlug(request.title()));
        }
        post.getImages().clear();
        if (request.imageUrls() != null && !request.imageUrls().isEmpty()) {
            for (String url : request.imageUrls()) {
                Image newImage = Image.builder()
                        .imageUrl(url)
                        .post(post)
                        .build();
                post.getImages().add(newImage);
            }
        }
        return postRepo.save(post);
    }

    @Transactional
    public void incrementPostViews(UUID postId) {
        Post post = postRepo.findById(postId).orElseThrow(() -> new RuntimeException("Post not found with ID: " + postId));
        post.setViews(post.getViews() + 1);
    }

    @Transactional
    public void deletePost(UUID postId) {
        postRepo.deleteById(postId);
    }

    @Transactional(readOnly = true)
    public List<PostRecord> getAllPosts() {
        return postRepo.findAll().stream().map(this::mapToPostRecord).toList();
    }

    @Transactional(readOnly = true)
    public PostRecord getPostById(UUID postId) {
        return postRepo.findById(postId)
                .map(this::mapToPostRecord)
                .orElseThrow(() -> new RuntimeException("Post not found with ID: " + postId));
    }

    @Transactional(readOnly = true)
    public List<PostRecord> getByCategoryAndPublished(Long catId) {
        return postRepo.findByCategoryIdAndStatus(catId, Status.PUBLISHED).stream()
                .map(this::mapToPostRecord)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PostRecord> findByStatus() {
        return postRepo.findByStatus(Status.PUBLISHED).stream()
                .map(this::mapToPostRecord)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PostRecord> getAuthorPosts(UUID userId) {
        return postRepo.findByAuthorId(userId).stream()
                .map(this::mapToPostRecord)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PostRecord> getAuthorAndStatus(UUID AuthorId, Status status) {
        return postRepo.findByAuthorIdAndStatus(AuthorId, status).stream()
                .map(this::mapToPostRecord)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PostRecord> getPublishedPosts() {
        return postRepo.findByStatusOrderByCreatedAtDesc(Status.PUBLISHED).stream()
                .map(this::mapToPostRecord)
                .toList();
    }

    private PostRecord mapToPostRecord(Post post) {
        List<String> imageUrls = post.getImages() != null ?
                post.getImages().stream()
                        .map(Image::getImageUrl)
                        .toList() :
                List.of();

        return new PostRecord(
                post.getId(),
                post.getTitle(),
                post.getContent(),
                post.getSlug(),
                post.getStatus(),
                imageUrls,
                post.getCreatedAt(),
                post.getUpdatedAt(),
                post.getAuthor().getUsername(),
                post.getAuthor().getId()
        );
    }

    public String generateUniqueSlug(String title) {
        String baseSlug = generateBaseSlug(title);
        String uniqueSlug = baseSlug;
        int count = 0;
        while (postRepo.existsBySlug(uniqueSlug)) {
            count++;
            uniqueSlug = baseSlug + "-" + count;
        }
        return uniqueSlug;
    }

    private String generateBaseSlug(String title) {
        return title.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("^-|-$", "");
    }
}