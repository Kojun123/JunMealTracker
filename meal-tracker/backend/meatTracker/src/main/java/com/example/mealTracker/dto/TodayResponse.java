package com.example.mealTracker.dto;

import com.example.mealTracker.domain.MealItem;
import com.example.mealTracker.domain.TodaySummary;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class TodayResponse {

    private TodaySummary summary;
    private List<MealItem> items;

    public TodayResponse(TodaySummary summary, List<MealItem> items) {
        this.summary = summary;
        this.items = items;
    }

    public static TodayResponse of(TodaySummary summary, List<MealItem> items) {
        return new TodayResponse(
                summary,
                items
        );
    }

   public static TodayResponse empty() {
       return new TodayResponse(null, List.of());
   }

}
