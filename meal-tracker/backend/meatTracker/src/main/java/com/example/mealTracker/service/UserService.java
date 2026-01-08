package com.example.mealTracker.service;


import com.example.mealTracker.domain.MealTrackerUser;
import com.example.mealTracker.dto.MealTrackerUserResponse;
import com.example.mealTracker.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserMapper userMapper;

    public MealTrackerUserResponse getUser(String email) {
        MealTrackerUser user = userMapper.findByEmail(email);

        if (user == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);

        return new MealTrackerUserResponse(user);
    }
}
