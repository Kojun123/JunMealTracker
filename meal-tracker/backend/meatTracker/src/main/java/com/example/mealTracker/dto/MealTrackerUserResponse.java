package com.example.mealTracker.dto;

import com.example.mealTracker.domain.MealTrackerUser;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class MealTrackerUserResponse {
    private String email;
    private int targetCalories;
    private int targetProtein;

    public MealTrackerUserResponse(MealTrackerUser user) {
        this.email = user.getEmail();
        this.targetCalories = user.getTargetCalories();
        this.targetProtein = user.getTargetProtein();
    }
}
