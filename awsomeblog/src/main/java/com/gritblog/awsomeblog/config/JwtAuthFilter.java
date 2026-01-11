package com.gritblog.awsomeblog.config;

import java.io.IOException;
import java.util.Arrays;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.gritblog.awsomeblog.service.CustomUserDetails;
import com.gritblog.awsomeblog.service.JwtService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {
    private  final JwtService jwtService;
    private  final CustomUserDetails customUserDetails;
     @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
         return path.startsWith("/api/v1/auth/") ||
                 path.startsWith("/oauth2/authorization") ||  // Changed
                 path.startsWith("/login/oauth2/code/") ||     // Changed
                 path.equals("/login") ||
                 path.startsWith("/oauth2-test")||
                 path.equals("/error");
    }
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
         String jwt =null;
         if (request.getCookies() !=null){
             jwt= Arrays.stream(request.getCookies())
                     .filter(cookie -> "accessToken".equals(cookie.getName()))
                     .map(Cookie::getValue)
                     .findFirst()
                     .orElse(null);
         }
         if(jwt== null){
             filterChain.doFilter(request, response);
             return;
         }

        final String username = jwtService.extractUsername(jwt);
         if(username != null && SecurityContextHolder.getContext().getAuthentication()==null){
             UserDetails userDetails = this.customUserDetails.loadUserByUsername(username);
             if(jwtService.isTokenValid(jwt,userDetails)){
                 UsernamePasswordAuthenticationToken authToken= new UsernamePasswordAuthenticationToken(
                         userDetails,
                         null,
                         userDetails.getAuthorities()
                 );
                 authToken.setDetails(
                         new WebAuthenticationDetailsSource().buildDetails(request)
                 );
                 SecurityContextHolder.getContext().setAuthentication(authToken);
             }
         }
         filterChain.doFilter(request,response);

    }

}
