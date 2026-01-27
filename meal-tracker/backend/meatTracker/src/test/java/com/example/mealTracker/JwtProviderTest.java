package com.example.mealTracker;


import com.example.mealTracker.common.JwtProvider;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;


public class JwtProviderTest {


    @Test
    void create_and_parse_access_token() {
        String secret = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
        JwtProvider jwtProvider = new JwtProvider(secret,15,14);

        String token = jwtProvider.createAccessToken(1L, "test@test.com");

        assertThat(jwtProvider.isType(token, "access")).isTrue();
        assertThat(jwtProvider.getUserId(token)).isEqualTo(1L);
    }
}
