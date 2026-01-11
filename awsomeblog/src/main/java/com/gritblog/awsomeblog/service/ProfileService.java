package com.gritblog.awsomeblog.service;

import com.gritblog.awsomeblog.DTO.ProfileRecord;
import com.gritblog.awsomeblog.models.User;
import com.gritblog.awsomeblog.models.UserProfile;
import com.gritblog.awsomeblog.repository.UserProfileRepo;
import com.gritblog.awsomeblog.repository.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProfileService {
    private  final UserRepo userRepo;
    private final UserProfileRepo profileRepo;
    @Transactional
    public UserProfile createProfile(ProfileRecord request) {
        User user = userRepo.findById(request.userId()).orElseThrow(() -> new ResourceNotFound("User not found with ID: " + request.userId()));
        UserProfile profile = profileRepo.findByUser(user).orElseGet(() -> UserProfile.builder().user(user).build());


        profile.setAvatar(request.avatar());
        profile.setFacebook_url(request.facebook_url());
        profile.setTwitter_url(request.twitter_url());
        profile.setFirst_name(request.first_name());
        profile.setLast_name(request.last_name());
        return profileRepo.save(profile);
    }
    @Transactional(readOnly = true)
    public UserProfile getProfileByUserId(UUID userId) {
        User user =userRepo.findById(userId).orElseThrow(() -> new ResourceNotFound("User not found with ID: " + userId));
        return profileRepo.findByUser(user).orElseThrow(() -> new ResourceNotFound("Profile not found for User ID: " + userId));
    }


    @Transactional
    public UserProfile updateProfile(UUID userId, ProfileRecord request) {
            User user =userRepo.findById(userId).orElseThrow(() -> new ResourceNotFound("User not found with ID: " + userId));
            UserProfile profile = profileRepo.findByUser(user).orElseThrow(() -> new ResourceNotFound("Profile not found for update, User ID: " + userId));
            profile.setAvatar(request.avatar());
            profile.setFacebook_url(request.facebook_url());
            profile.setTwitter_url(request.twitter_url());
            profile.setFirst_name(request.first_name());
            profile.setLast_name(request.last_name());
            return profileRepo.save(profile);
        }

    @Transactional
    public void deleteProfileByUserId(UUID userId) {
        User user = userRepo.findById(userId).orElseThrow(() -> new ResourceNotFound("User not found with ID: " + userId));
        UserProfile profile =profileRepo.findByUser(user).orElseThrow(() -> new ResourceNotFound("Profile not found for User: " + user.getId()));
        profileRepo.delete(profile);
    }


}
