package com.example.mealTracker;


import com.example.mealTracker.common.JwtProvider;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
        "OPENAI_API_KEY=dummy",
        "JWT_SECRET=abcdefghijklmnopqrstuvwxyz123456"
})
@AutoConfigureMockMvc
@Import(JwtSecurityFlowTest.TestMeController.class)
public class JwtSecurityFlowTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    JwtProvider jwtProvider;

    @Autowired
    ObjectMapper objectMapper;


    //토큰 없을시 401 정상적으로 떨어지는지 테스트
    @Test
    void me_without_token_is_401() throws Exception {
        mockMvc.perform(get("/me"))
                .andExpect(status().isUnauthorized());
    }

    //토큰 만료됬을시 401 정상적으로 떨어지는지 테스트
    @Test
    void me_with_expired_access_token_is_401() throws Exception {
        String expired = jwtProvider.createExpiredAccessToken(1L, "test@test.com");

        mockMvc.perform(get("/me")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + expired))
                .andExpect(status().isUnauthorized());
    }

    //토큰 정상일때 문제없이 200떨어지는지 테스트
    @Test
    void me_with_valid_access_token_is_200() throws Exception {
        String access = jwtProvider.createAccessToken(1L, "test@test.com");

        mockMvc.perform(get("/me")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + access))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ok").value(true))
                .andExpect(jsonPath("$.principal").value(1));
    }

    //쿠키없을때 리프레시 하면 401 정상적으로 반환하는지 테스트
    @Test
    void refresh_without_cookie_is_401() throws Exception {
        mockMvc.perform(post("/api/auth/refresh"))
                .andExpect(status().isUnauthorized());
    }

    //쿠키 정상적으로 존재할때 리프레시 하면 200 잘 반환하는지 테스트
    @Test
    void refresh_with_cookie_is_200() throws Exception {
        String refresh = jwtProvider.createRefreshToken(1L, "test@test.com");

        mockMvc.perform(post("/api/auth/refresh")
                        .cookie(new Cookie("refreshToken", refresh)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty());
    }
    
    //로그인 성공시 쿠키를 정상적으로 생성하는지 테스트
    @Test
    void login_success_sets_refresh_cookie_and_returns_access() throws Exception {
        Map<String, String> body = Map.of(
                "email", "test", "password", "1234"
        );

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.SET_COOKIE,
                        org.hamcrest.Matchers.containsString("refreshToken") ))
                .andExpect(header().string(HttpHeaders.SET_COOKIE,
                        org.hamcrest.Matchers.containsString("HttpOnly") ))
                .andExpect(jsonPath("$.accessToken").isNotEmpty());
    }


    @RestController
    static class TestMeController {
        @GetMapping("/me")
        public Map<String, Object> me(Authentication authentication) {
            if (authentication == null) return Map.of("ok", false);
            return Map.of("ok", true, "principal", authentication.getPrincipal());
        }
    }
}
