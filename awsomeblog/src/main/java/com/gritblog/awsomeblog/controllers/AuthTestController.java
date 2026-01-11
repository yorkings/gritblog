package com.gritblog.awsomeblog.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthTestController {
    @GetMapping("/oauth-test")
    public String oauthTest() {
        return """
            <h1>OAuth2 Test</h1>
            <p><a href="/oauth2/authorization/google">Login with Google</a></p>
            <p><a href="/oauth2/authorization/github">Login with GitHub</a></p>
            <p><a href="/api/v1/auth/test">Test Public Endpoint</a></p>
            """;
    }

    @GetMapping("/api/v1/auth/test")
    public String test() {
        return "Public auth endpoint works!";
    }
}
