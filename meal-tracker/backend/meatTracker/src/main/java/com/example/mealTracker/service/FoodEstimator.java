package com.example.mealTracker.service;

import com.example.mealTracker.dto.EstimateResult;
import org.springframework.stereotype.Service;

@Service
public class FoodEstimator {

    public EstimateResult estimate(String name, int count) {

        // 닭볶음탕
        if (name.contains("닭볶음탕")) {
            return new EstimateResult(
                    40.0 * count,
                    0,
                    "LOW",
                    "외식 메뉴 기준 1인분 40g으로 가정"
            );
        }

        // 김치찌개
        if (name.contains("김치찌개")) {
            return new EstimateResult(
                    20.0 * count,
                    0,
                    "LOW",
                    "국물 포함 1인분 기준 추정"
            );
        }

        // 제육볶음
        if (name.contains("제육")) {
            return new EstimateResult(
                    30.0 * count,
                    0,
                    "LOW",
                    "고기 위주 1인분 기준 추정"
            );
        }

        // 모르겠는 경우
        return EstimateResult.unknown(
                "DB에 기준값이 없어 단백질을 계산할 수 없음"
        );
    }
}
