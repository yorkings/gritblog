package com.gritblog.awsomeblog.controllers;

import com.gritblog.awsomeblog.DTO.AuthResponse;
import com.gritblog.awsomeblog.DTO.LoginRecord;
import com.gritblog.awsomeblog.DTO.PairToken;
import com.gritblog.awsomeblog.models.User;
import com.gritblog.awsomeblog.service.AuthJwtLink;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/v1/auth/")
@RequiredArgsConstructor
public class AuthController {
    private final AuthJwtLink authJwtLink;

    @PostMapping("login")
    public ResponseEntity<AuthResponse>loginUser(@RequestBody LoginRecord request, HttpServletResponse response){
        PairToken tokens =authJwtLink.authenticate(request);
        ResponseCookie accessCookie = ResponseCookie.from("accessToken",tokens.getAccessToken())
                .httpOnly(true)
                .secure(false)
                .maxAge(60*60)
                .sameSite("Strict")
                .build();
        ResponseCookie refreshCookie=ResponseCookie.from("refreshToken",tokens.getRefreshToken())
                .httpOnly(true)
                .secure(false)
                .maxAge(60*60*24*7)
                .sameSite("Strict")
                .build();
        response.addHeader("Set-Cookie",accessCookie.toString());
        response.addHeader("Set-Cookie",refreshCookie.toString());
        return ResponseEntity.ok(new AuthResponse("login successful"));
    }

    @PostMapping("refresh")
    public ResponseEntity<AuthResponse> refresh(@CookieValue("refreshToken") String refreshToken, HttpServletResponse response) {
        PairToken tokens = authJwtLink.tokenRefresh(refreshToken);

        ResponseCookie accessCookie = ResponseCookie.from("accessToken", tokens.getAccessToken())
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(60 * 15)
                .sameSite("Strict")
                .build();

        response.addHeader("Set-Cookie", accessCookie.toString());
        return ResponseEntity.ok(new AuthResponse("Access token refreshed"));
    }
}
