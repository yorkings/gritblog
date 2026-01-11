package com.gritblog.awsomeblog.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {
    private  final JavaMailSender javaMailSender;

    public void sendMail(String to,String subject, String content){
        try{
            SimpleMailMessage message= new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(content);
            javaMailSender.send(message);
        } catch (Exception e) {
            throw new IllegalArgumentException("failed to communicate with"+e.getMessage());
        }
    }
}
