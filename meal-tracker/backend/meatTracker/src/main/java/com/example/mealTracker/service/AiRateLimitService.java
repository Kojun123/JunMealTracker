package com.example.mealTracker.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;

@Service
public class AiRateLimitService {

    // 사용자당 허용 횟수
    private static final int MAX_REQUESTS = 3;

    // 제한 시간(1분)
    private static final long WINDOW_MILLIS = 60_000L;

    // 사용자별 요청 기록
    private final Map<String, RequestWindow> requestWindows = new HashMap<>();

    public synchronized void checkLimit(String userId) {
        long now = System.currentTimeMillis();

        // 제한 시간 지난 기록 정리
        requestWindows.entrySet().removeIf(
                entry -> now - entry.getValue().startTime >= WINDOW_MILLIS
        );

        RequestWindow window = requestWindows.get(userId);

        // 첫 요청일 경우
        if (window == null) {
            requestWindows.put(userId, new RequestWindow(now, 1));
            return;
        }

        if (window.count >= MAX_REQUESTS) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "요청이 너무 많습니다, 잠시 후 다시 시도해주세요.");
        }

        window.count++;
    }



    private static class RequestWindow {
        private final long startTime;
        private int count;

        public RequestWindow(long startTime, int count) {
            this.startTime = startTime;
            this.count = count;
        }

    }



}
