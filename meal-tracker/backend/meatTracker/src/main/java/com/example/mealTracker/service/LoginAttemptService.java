package com.example.mealTracker.service;


import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

@Service
public class LoginAttemptService {

    // 로그인 최대 실패 허용 횟수
    private static final int MAX_FAILURES = 10;

    // 차단시간(3분)
    private static final long PERIOD_MILLIS = 3*60*1000L;

    private final Map<String, LoginAttempt> attempts = new HashMap<>();

    // 로그인 시도 전 제한 여부 확인
    public synchronized void checkLimit(String email) {
        long now =  System.currentTimeMillis();
        removeExpired(now);

        LoginAttempt attempt = attempts.get(normalize(email));

        if (attempt != null && attempt.blockedUntil > now) {
            throw new ResponseStatusException(
                    HttpStatus.TOO_MANY_REQUESTS,
                    "로그인 시도가 너무 많습니다, 잠시 후 다시 시도해주세요."
            );
        }
    }

    // 인증실패시 호출
    public synchronized void recordFailure(String email) {
        long now = System.currentTimeMillis();
        removeExpired(now);

        String key = normalize(email);
        LoginAttempt attempt = attempts.get(key);

        if (attempt == null) {
            attempt = new LoginAttempt(now);
            attempts.put(key, attempt);
        }

        // 이미 제한중인 경우에는 시간 연장 x
        if (attempt.blockedUntil > now) {
            return;
        }

        attempt.failures++;

        if (attempt.failures >= MAX_FAILURES) {
            attempt.blockedUntil = now + PERIOD_MILLIS;
        }

    }

    // 로그인 성공시 실패기록삭제
    public synchronized void reset(String email) {
        attempts.remove(normalize(email));
    }

    //오래된 기록 삭제(
    private void removeExpired(long now) {
        attempts.entrySet().removeIf(entry -> {
            LoginAttempt attempt = entry.getValue();

            if (attempt.blockedUntil > 0) {
                return now >= attempt.blockedUntil;
            }

            return now - attempt.firstFailureAt >= PERIOD_MILLIS;
        });
    }

    private String normalize(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }

    private static class LoginAttempt {
        // 첫 실패 시간
        private final long firstFailureAt;

        // 실패 횟수
        private int failures;

        // 차단 해제 시간
        private long blockedUntil;

        public LoginAttempt(long firstFailureAt) {
            this.firstFailureAt = firstFailureAt;
        }

    }
}
