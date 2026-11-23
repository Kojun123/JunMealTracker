package com.example.mealTracker.domain;


import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
public class MealLog {

    private Long id;
    private String email;
    private String log;
    private Role role;
    private String createdAt;
    private LocalDate mealDate;


    @Builder
    public MealLog(String email, String log, Role role, LocalDate mealDate) {
        this.email = email;
        this.log = log;
        this.role = role;
        this.mealDate = mealDate;
    }
}
