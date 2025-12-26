package com.example.mealTracker.mapper;

import com.example.mealTracker.domain.FoodMaster;
import com.example.mealTracker.dto.FoodMasterResponse;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface FoodMasterMapper {
        FoodMaster findByName(String name);
}