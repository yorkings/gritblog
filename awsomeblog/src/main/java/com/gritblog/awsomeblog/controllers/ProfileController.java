package com.gritblog.awsomeblog.controllers;

import com.gritblog.awsomeblog.DTO.ProfileRecord;
import com.gritblog.awsomeblog.models.UserProfile;
import com.gritblog.awsomeblog.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/profiles")
@RequiredArgsConstructor
public class ProfileController {
    private final ProfileService profileService;
    @PostMapping("/{userId}")
    public ResponseEntity<UserProfile> createProfile(@PathVariable UUID userId, @RequestBody ProfileRecord request) {
        if (!request.userId().equals(userId)) {
            return ResponseEntity.badRequest().build();
        }
        UserProfile createdProfile = profileService.createProfile(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdProfile);
    }
    @GetMapping("/{userId}")
    public ResponseEntity<UserProfile> getProfile(@PathVariable UUID userId) {
        UserProfile profile = profileService.getProfileByUserId(userId);
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/{userId}")
    public ResponseEntity<UserProfile> updateProfile(@PathVariable UUID userId,@RequestBody ProfileRecord request) {
        if (!request.userId().equals(userId)) {
            return ResponseEntity.badRequest().build();
        }
        UserProfile updatedProfile = profileService.updateProfile(userId, request);
        return ResponseEntity.ok(updatedProfile);
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteProfile(@PathVariable UUID userId) {
        profileService.deleteProfileByUserId(userId);
        return ResponseEntity.noContent().build();
    }
}
