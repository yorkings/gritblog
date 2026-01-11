package com.gritblog.awsomeblog.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PairToken {
    private  String accessToken;
    private  String refreshToken;
}
