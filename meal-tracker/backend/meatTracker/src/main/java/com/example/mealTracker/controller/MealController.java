package com.example.mealTracker.controller;


import com.example.mealTracker.dto.ManualRequest;
import com.example.mealTracker.dto.MealMessageRequest;
import com.example.mealTracker.dto.MealMessageResponse;
import com.example.mealTracker.dto.TodayResponse;
import com.example.mealTracker.service.MealService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/meal")
public class MealController {

    private final MealService mealService;

    public MealController(MealService mealService) {
        this.mealService = mealService;
    }

    @PostMapping("/message")
    public ResponseEntity<MealMessageResponse> message(@RequestBody MealMessageRequest vo, @AuthenticationPrincipal UserDetails user) {
        String userId = user.getUsername();
        return ResponseEntity.ok(mealService.handle(vo, userId));
    }

    @PostMapping("/today")
    public ResponseEntity<TodayResponse> today(@AuthenticationPrincipal UserDetails user) {
        String userId = user.getUsername();
        return ResponseEntity.ok(mealService.getToday(userId));
    }

    @PostMapping("/manual")
    public ResponseEntity<MealMessageResponse> manual(@RequestBody ManualRequest vo) {
        return ResponseEntity.ok(mealService.manualInsert(vo));
    }
}
