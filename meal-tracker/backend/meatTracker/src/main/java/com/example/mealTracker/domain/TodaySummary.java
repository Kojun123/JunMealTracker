package com.example.mealTracker.domain;

import lombok.Data;

@Data
public class TodaySummary {
    private double totalCalories;
    private double totalProtein;
    private double targetCalories;
    private double targetProtein;


    public TodaySummary(double totalCalories, double totalProtein, double targetCalories, double targetProtein) {
        this.totalCalories = totalCalories;
        this.totalProtein = totalProtein;
        this.targetCalories = targetCalories;
        this.targetProtein = targetProtein;
    }
}