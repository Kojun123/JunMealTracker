package com.example.mealTracker.mapper;

import com.example.mealTracker.domain.MealItem;
import com.example.mealTracker.domain.TodaySummary;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface MealItemMapper {
    int insertItem(MealItem item);
    List<MealItem> findItemsByUser(@Param("userId") String userId);
    TodaySummary findSummaryByUser(@Param("userId") String userId);
    int deleteItemsBySessionId(@Param("uesrId") String userId);
}
