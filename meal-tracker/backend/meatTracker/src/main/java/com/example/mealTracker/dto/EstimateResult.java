package com.example.mealTracker.dto;

public record EstimateResult(
        double protein,
        double calories,
        String confidence,   // LOW 고정
        String assumption
) {
    public static EstimateResult unknown(String reason) {
        return new EstimateResult(
                0,
                0,
                "LOW",
                reason
        );
    }
}
