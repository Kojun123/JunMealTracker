package com.example.mealTracker.dto;


import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ManualRequest {

    Long sessionId;
    String rawName;
    int count;
    double protein;
    double kcal;

}
