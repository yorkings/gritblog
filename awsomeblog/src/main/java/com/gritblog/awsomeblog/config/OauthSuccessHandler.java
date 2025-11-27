package com.gritblog.awsomeblog.config;

import com.gritblog.awsomeblog.DTO.UserRoles;
import com.gritblog.awsomeblog.models.User;
import com.gritblog.awsomeblog.models.UserProfile;
import com.gritblog.awsomeblog.repository.UserProfileRepo;
import com.gritblog.awsomeblog.repository.UserRepo;
import com.gritblog.awsomeblog.service.JwtService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class OauthSuccessHandler implements AuthenticationSuccessHandler {

    private static final Logger log = LoggerFactory.getLogger(OauthSuccessHandler.class);

    // Dependencies injected
    private final UserRepo userRepo;
    private final UserProfileRepo userProfileRepo;
    private final JwtService jwtService;

    // Configuration constants (centralized for clarity and re-use)
    private final String FRONTEND_REDIRECT_URL = "http://localhost:5173/oauth-success";
    private final int ACCESS_TOKEN_EXPIRATION_SECONDS = 3600; // 1 hour
    private final int REFRESH_TOKEN_EXPIRATION_SECONDS = 604800; // 7 days

    @Override
    @Transactional // Re-introduced for atomicity: ensure user and profile save/update is one transaction
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException {

        // 1. Check if authentication is the expected type
        if (!(authentication instanceof OAuth2AuthenticationToken)) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Authentication must be an OAuth2AuthenticationToken");
            return;
        }

        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
        String providerId = oauthToken.getAuthorizedClientRegistrationId();


        if (oauth2User == null) {
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Authentication principal (OAuth2User) not found. Cannot proceed with login.");
            return;
        }


        log.info("--- OAuth2 Attributes for Provider {} ---", providerId);
        oauth2User.getAttributes().forEach((key, value) -> log.info("Attribute: {} = {}", key, value));
        log.info("------------------------------------------");


        String email = getEmailFromOAuth2User(oauth2User, providerId);
        String initialUsername = getUsernameFromOAuth2User(oauth2User, providerId);


        if (email == null || email.isEmpty()) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Email not found from OAuth2 provider: " + providerId);
            return;
        }

        // 4. Extract names
        String firstName = null;
        String lastName = null;
        String profileImageUrl = null;
        if ("google".equals(providerId)) {
            firstName = oauth2User.getAttribute("given_name");
            lastName = oauth2User.getAttribute("family_name");
            profileImageUrl=oauth2User.getAttribute("picture");

            // Fallback: If either first name OR last name is missing, use the full name if available.
            if ((firstName == null || lastName == null) && oauth2User.getAttribute("name") != null) {
                String fullName = oauth2User.getAttribute("name");
                String[] nameParts = fullName.split(" ", 2);
                firstName = nameParts[0];
                lastName = nameParts.length > 1 ? nameParts[1] : null;
            }
        } else if ("github".equals(providerId)) {
            firstName = oauth2User.getAttribute("login");
            lastName = null;
            profileImageUrl = oauth2User.getAttribute("avatar_url");
            // Fallback to name attribute if available, as it might be the full name
            if (oauth2User.getAttribute("name") != null) {
                String fullName = oauth2User.getAttribute("name");
                String[] nameParts = fullName.split(" ", 2);
                firstName = nameParts[0];
                lastName = nameParts.length > 1 ? nameParts[1] : null;
            }
        }

        // 5. Determine Username and Load/Create User
        final String determinedUsername = (initialUsername != null && !initialUsername.isEmpty())
                ? initialUsername
                : email;

        // Use your clean orElseGet logic for User creation
        User user = userRepo.findByEmail(email)
                .orElseGet(() -> userRepo.save(
                        User.builder()
                                .username(determinedUsername)
                                .provider(providerId)
                                .email(email)
                                .roles(UserRoles.ROLE_USER)
                                .locked(false)
                                .disabled(false)
                                .build()
                ));

        // 6. Load/Create and Update UserProfile

        UserProfile profile = userProfileRepo.findByUserId(user.getId())
                .orElseGet(() -> userProfileRepo.save(
                        UserProfile.builder()
                                .user(user)
                                .build()
                ));

        profile.setFirst_name(firstName);
        profile.setAvatar(profileImageUrl);
        profile.setLast_name(lastName);
        userProfileRepo.save(profile); // Explicitly save changes to profile

        // 7. Generate JWTs
        String accessToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        // 8. Create HttpOnly Cookies

        // Access Token Cookie
        Cookie accessTokenCookie = new Cookie("accessToken", accessToken);
        accessTokenCookie.setPath("/");
        accessTokenCookie.setMaxAge(ACCESS_TOKEN_EXPIRATION_SECONDS);
        accessTokenCookie.setHttpOnly(true);
        response.addCookie(accessTokenCookie);

        // Refresh Token Cookie
        Cookie refreshTokenCookie = new Cookie("refreshToken", refreshToken);
        refreshTokenCookie.setPath("/");
        refreshTokenCookie.setMaxAge(REFRESH_TOKEN_EXPIRATION_SECONDS);
        refreshTokenCookie.setHttpOnly(true);
        response.addCookie(refreshTokenCookie);

        // 9. Redirect
        response.sendRedirect(FRONTEND_REDIRECT_URL);
    }

    private String getEmailFromOAuth2User(OAuth2User oAuth2User, String registrationId) {
        String email = oAuth2User.getAttribute("email");

        if ("github".equalsIgnoreCase(registrationId) && (email == null || email.isEmpty())) {
            return oAuth2User.getAttribute("login");
        }
        return email;
    }

    private String getUsernameFromOAuth2User(OAuth2User oAuthUser, String providerId) {
        if ("github".equalsIgnoreCase(providerId)) {
            return oAuthUser.getAttribute("login");
        } else {
            String name = oAuthUser.getAttribute("name");
            if (name != null) {
                return name;
            }
            return oAuthUser.getName();
        }
    }
}