package com.gritblog.awsomeblog.models;

import java.util.UUID;

public record ProfileRecord(UUID userId,String avatar,String first_name, String last_name,String  twitter_url,String   facebook_url, String phone_no) {
}
