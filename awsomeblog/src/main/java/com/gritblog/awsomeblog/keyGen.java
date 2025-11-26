package com.gritblog.awsomeblog;

import java.security.SecureRandom;
import java.util.Base64;

public class keyGen {
    public static  void main(String[] args){
        SecureRandom  random=new SecureRandom();
        byte[]bytes=new byte[64];
         random.nextBytes(bytes);
         String  secret= Base64.getEncoder().encodeToString(bytes);
         System.out.println(secret);

    }
}
