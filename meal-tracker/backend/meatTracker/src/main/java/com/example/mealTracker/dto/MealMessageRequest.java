package com.example.mealTracker.dto;

import java.time.LocalDate;

public record MealMessageRequest(String message, LocalDate date) {}

