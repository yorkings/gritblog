package com.gritblog.awsomeblog.service;

import com.gritblog.awsomeblog.DTO.RegisterRecord;
import com.gritblog.awsomeblog.DTO.UserRoles;
import com.gritblog.awsomeblog.models.TokenConfirm;
import com.gritblog.awsomeblog.models.User;
import com.gritblog.awsomeblog.repository.ConfirmTokenRepo;
import com.gritblog.awsomeblog.repository.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
    private  final UserRepo userRepo;
    private  final PasswordEncoder passwordEncoder;
    private  final ConfirmTokenRepo tokenRepo;
    private  final  EmailService emailService;

    public String registerUser(RegisterRecord request){
        if(userRepo.existsByEmail(request.email())){
            throw  new IllegalArgumentException("email taken");
        }else if(userRepo.existsByUsername(request.username())){
            throw  new IllegalArgumentException("username already taken");
        }
        String password=passwordEncoder.encode(request.password());
        User currentUser=User.builder()
                .username(request.username())
                .roles(UserRoles.ROLE_USER)
                .password(password)
                .disabled(true)
                .build();
        userRepo.save(currentUser);
        TokenConfirm token= new TokenConfirm(currentUser);
        tokenRepo.save(token);
        String link="http://localhost:8080/api/v1/auth/confirm?token=" + token.getToken();
        emailService.sendMail(request.email(),"confirm your gritblog account",emailContent(request.username(),link));
        return token.getToken();
    }

    public User findByUsername(String username) {
        return userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }


    public  String emailContent(String name,String link){
        return  "Hello " + name + ",\n\n"
                + "Thank you for registering. Please click on the below link to activate your account:\n\n"
                + link + "\n\n"
                + "This link will expire in 24 hours.";
    }

}
