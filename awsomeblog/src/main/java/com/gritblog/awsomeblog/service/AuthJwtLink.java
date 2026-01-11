package com.gritblog.awsomeblog.service;

import com.gritblog.awsomeblog.DTO.LoginRecord;
import com.gritblog.awsomeblog.DTO.PairToken;
import com.gritblog.awsomeblog.models.User;
import com.gritblog.awsomeblog.repository.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthJwtLink {
    private final AuthenticationManager authMann;
    private final UserRepo userRepo;
    private  final JwtService jwtService;
    private  final PasswordEncoder passwordEncoder;

    public PairToken authenticate(LoginRecord request){
        User user = userRepo.findByUsername(request.username())
                .or(() -> userRepo.findByEmail(request.username()))
                .orElseThrow(() ->
                        new UsernameNotFoundException("Invalid credentials provided.")
                );
        authMann.authenticate(
                new UsernamePasswordAuthenticationToken(user.getUsername(),request.password())
        );
        if(user.isDisabled()){
            throw new DisabledException("Account not verified. Please check your email.");
        } else if (user.isLocked()) {
            throw  new LockedException("account blocked due to some violation contact admin");
        }

        String accessToken=jwtService.generateToken(user);
        String refreshToken=jwtService.generateRefreshToken(user);
        return  new PairToken(accessToken,refreshToken);
    }

    public PairToken tokenRefresh(String refreshToken){
        String username=jwtService.extractUsername(refreshToken);
        User user = userRepo.findByUsername(username).orElseThrow(() -> new IllegalArgumentException("User not found"));
        if(!jwtService.isTokenValid(refreshToken,user)){
            throw new IllegalArgumentException("Invalid or expired refresh token");
        }
        String newAccessToken = jwtService.generateToken(user);
        return new PairToken(newAccessToken,refreshToken);
    }
}
