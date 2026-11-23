package com.example.mealTracker.service;

import com.example.mealTracker.domain.*;
import com.example.mealTracker.dto.*;
import com.example.mealTracker.mapper.MealItemMapper;
import com.example.mealTracker.mapper.MealLogMapper;
import com.example.mealTracker.mapper.UserMapper;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MealService {

    private final OpenAiService openAiService;
    private final MealItemMapper mealItemMapper;
    private final MealLogMapper mealLogMapper;
    private final UserMapper userMapper;
    private final AiRateLimitService aiRateLimitService;

    public List<MealItem> findItemsBySessionId(String userId, LocalDate date) {
        return mealItemMapper.findItemsByUser(userId, date);
    }


    @Transactional
    public MealMessageResponse handle(MealMessageRequest vo, String userId) {
        String msg = vo.message() == null ? "" : vo.message().trim();


        // 식단기록할 날짜(프론트에서 선택되어 넘어옴)
        LocalDate mealDate = vo.date();

        if (mealDate == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "식단 날짜값이 비어있습니다.");
        }

        if (msg.isBlank()) {
            return buildResponse("빈 입력값입니다.", userId, mealDate);
        }

        if (msg.length() > 200) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "식단 입력은 200자 이내로 입력해주세요."
            );
        }

        // AI 호출 횟수 확인
        aiRateLimitService.checkLimit(userId);

        //유저 요청 로그저장
        insertLog(new MealLogRequest(userId, msg, Role.USER), mealDate);

        JsonNode action = openAiService.parseMealAction(msg);
        JsonNode itemsNode = action.path("items");

        if (!itemsNode.isArray() || itemsNode.isEmpty()) {
            return buildResponse("기록할 음식이 없음", userId, mealDate);
        }

        List<String> lines = new ArrayList<>();
        double addPro = 0;
        double addCal = 0;

        for (JsonNode it : itemsNode) {
            String rawName = it.path("name").asText(); // 사용자가 입력한 음식이름
            int count = it.path("count").asInt(1); // 음식수량~
            if (count < 1) count = 1;
            int calories = it.path("calories").asInt(0) * count;
            int protein = it.path("protein").asInt(0) * count;

            insertItem(rawName, count, calories, protein, userId, mealDate);

            addPro += protein;
            addCal += calories;

            lines.add(rawName + " x" + count + " 단백질 : " + protein + " 칼로리 : " + calories);
        }

        String assistantText =
                String.join("\n", action.path("assistantText").asText() )
                        + "\n총 단백질 : " + addPro
                        + " 총 칼로리 : " + addCal;

        //gpt응답 로그 저장
        insertLog(new MealLogRequest(userId, assistantText, Role.GPT), mealDate);
        return buildResponse(assistantText, userId, mealDate);
    }

    // 먹은 것 기록.
    private void insertItem(String name, int addCount, double addCal, double addPro, String userId, LocalDate mealDate) {
        MealItem item = new MealItem(name, addCount, addCal, addPro, userId, mealDate);
        mealItemMapper.insertItem(item);
    }

    public void insertLog(MealLogRequest vo, LocalDate mealDate) {
        MealLog log = new MealLog(
                vo.getEmail(),
                vo.getLog(),
                vo.getRole(),
                mealDate
        );

        mealLogMapper.insertMealLog(log);
    }

    public MealMessageResponse buildResponse(String assistantText, String userId, LocalDate mealDate) {
        TodaySummary summary = calcSummary(userId, mealDate);

        return MealMessageResponse.normal(
                assistantText + "\n" + remainText(summary),
                summary,
                List.copyOf(mealItemMapper.findItemsByUser(userId, mealDate)),
                List.copyOf(mealLogMapper.getChatLogs(userId, mealDate))
        );
    }

    // 오늘의 칼로리 계산
    public TodaySummary calcSummary(String userId, LocalDate date) {
        double totalCal = 0;
        double totalPro = 0;

        if (date == null) date = LocalDate.now(ZoneId.of("Asia/Seoul"));

        for (MealItem it : mealItemMapper.findItemsByUser(userId, date)) {
            totalCal += it.getCalories();
            totalPro += it.getProtein();
        }

        MealTrackerUser user = userMapper.findByEmail(userId);
        return new TodaySummary(totalCal, totalPro, user.getTargetCalories(), user.getTargetProtein());
    }

    //남은 단백질/칼로리 제공
    private String remainText(TodaySummary s) {
        double remainPro = Math.max(0, s.getTargetProtein() - s.getTotalProtein());
        double remainCal = Math.max(0, s.getTargetCalories() - s.getTotalCalories());

        return "\n" +
                "남은 단백질 " + Math.round(remainPro) + "g"
                + "\n" +
                "남은 칼로리 " + Math.round(remainCal) + "kcal"
                ;
    }

    public TodayResponse getToday(String userId, LocalDate date) {
        if (userId == null) {
            return TodayResponse.empty();
        }

        TodaySummary summary = calcSummary(userId, date);
        List<MealItem> items = findItemsBySessionId(userId, date);
        List<MealLogResponse> chatLog = mealLogMapper.getChatLogs(userId, date);

        return TodayResponse.of(summary, items, chatLog);
    }

    public void deleteItem(String userId, Long itemId) {
        int deleted = mealItemMapper.deleteItem(userId, itemId);
        if (deleted == 0) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
    }

    public void updateItem(UpdateItemRequest vo) {
        MealItem item = vo.toEntity();
        int updated = mealItemMapper.updateItem(item);

        if (updated == 0) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
    }

    public List<FavoriteMealResponse> getFavoriteMeals(String userId) {
        return mealItemMapper.findFavoritesByUser(userId);
    }

    public void insertFavoriteMeal(FavoriteMealRequest vo) {
        MealFavorite item = vo.toEntity();
        int i = mealItemMapper.insertFavorites(item);

        if (i == 0) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
    }

    public void deleteFavoriteMeal(FavoriteMealRequest vo) {
        MealFavorite item = vo.toEntity();
        int i = mealItemMapper.deleteFavorites(item);

        if (i == 0) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
    }




}

