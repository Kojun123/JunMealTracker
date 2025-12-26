package com.example.mealTracker.domain;


import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Service;

@Getter
@Service
@NoArgsConstructor
public class FoodMaster {

    private Long id;
    private String name;        // normalizeName 결과와 정확히 일치
    private double protein;     // 기준 단백질 (1회 기준)
    private Double kcal;        // 기준 칼로리 (nullable)
    private String unit;        // "1개", "1인분"
    private String createdBy;   // SYSTEM | USER

}
