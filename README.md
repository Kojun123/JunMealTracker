# JunMealTracker

> 자연어 입력을 AI로 구조화해 음식별 칼로리와 단백질을 기록하는 개인 식단 관리 웹 서비스

**Live**: [junmeal.com](https://junmeal.com)  
**Repository**: [Kojun123/JunMealTracker](https://github.com/Kojun123/JunMealTracker)  
**구성**: React 프론트엔드 + Spring Boot REST API + MySQL + OpenAI Responses API

![Java 21](https://img.shields.io/badge/Java-21-ED8B00?logo=openjdk&logoColor=white) ![Spring Boot 3.4.4](https://img.shields.io/badge/Spring_Boot-3.4.4-6DB33F?logo=springboot&logoColor=white) ![MyBatis 3.0.4](https://img.shields.io/badge/MyBatis-3.0.4-2E5B8A) ![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black) ![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?logo=mysql&logoColor=white)

## 1. 프로젝트 소개

기존 식단 관리 앱에서 외식 등 영양정보가 불분명한 음식을 기록하기 불편했던 경험을 바탕으로 개발한 개인 프로젝트입니다.

음식의 영양정보를 일일이 검색하거나 직접 계산해야 하는 번거로움을 줄이고자, 
사용자가 **"계란 2개, 닭가슴살 1개"**처럼 자연어로 말하면 AI가 칼로리와 단백질을 추정하여 기록하는 식단 관리 서비스를 개발했습니다.

**JunMealTracker는 영양정보의 정밀한 분석보다는 기록의 편의성과 지속 가능성에 중점을 둔 서비스입니다.**

 사용자가 부담 없이 식단을 기록하고 꾸준히 관리할 수 있도록 설계했으며, 현재 직접 개발한 서비스를 실제 식단 관리에 활용하고 있습니다.

 프론트엔드는 React 기반의 토큰(Chip) 입력 UI를 구현하여 즐겨찾기 및 최근 음식 선택 시 입력창에 음식 정보를 시각적으로 표시하도록 구성했습니다.
 
 동일 음식 재선택 시 수량을 자동 증가시키는 등 반복적인 식단 입력 과정을 간소화 하는 것에 집중했습니다.

백엔드는 자연어로 입력된 식단 정보를 구조화된 데이터로 변환하고 관리하는 데 집중했습니다.

OpenAI API에 미리 정의한 JSON Schema를 적용하여 음식명, 수량, 칼로리, 단백질 등의 정보를 일관된 형식으로 전달받고, Spring Boot 기반으로 이를 처리하여 식단 기록과 일일 영양 섭취량을 관리하도록 구현했습니다.

### 주요 기능

| 기능 | 실제 구현 내용 |
| --- | --- |
| 자연어 식단 입력 | OpenAI Responses API와 JSON Schema를 이용해 여러 음식 항목을 구조화 |
| 영양 정보 계산 | AI가 제공한 1회 제공량 추정값에 수량을 곱해 서버에서 항목별 총량 계산 |
| 식단 기록 | 사용자와 날짜 기준으로 음식 등록, 목록 조회, 수정, 삭제 |
| 대시보드 | 섭취 칼로리/단백질 합계와 사용자 목표 대비 잔여량 확인 |
| 빠른 입력 | 즐겨찾기, 현재 조회 중인 기록에서 도출한 음식명, 수량 토큰 UI |
| 사용자 인증 | 이메일/비밀번호 로그인, Google OAuth2 로그인, JWT Access Token 및 Refresh Token 쿠키 |
| 운영 및 배포 | Jenkins로 백엔드/프론트 빌드 후 Docker 서비스 재기동 |


## 2. 서비스 화면

![JunMealTracker 식단 대시보드](https://github.com/user-attachments/assets/3a7ca604-58eb-4b48-8314-20ca8f92d97e)

![JunMealTracker 주요 기능](https://github.com/user-attachments/assets/2dad08f0-ca69-4f0c-95a7-b9eb5db7cc8f)



## 3. 기술 스택

| 구분 | 기술 스택 |
| --- | --- |
| **Frontend** | React, JavaScript, Vite |
| **Backend** | Java 21, Spring Boot 3.4.4, Spring Security, MyBatis |
| **Database** | MySQL |
| **AI** | OpenAI API |
| **Infra / CI·CD** | AWS EC2, Docker, Jenkins, Nginx |

## 4. 아키텍처

<img width="1774" height="887" alt="JunMealTracker 시스템 아키텍처와 식단 처리 흐름" src="https://github.com/user-attachments/assets/5604305c-9f58-4829-af06-a1985180db2c" />


## 5. 핵심 구현

### 5.1 AI 응답을 JSON Schema로 제한

- 자유로운 자연어 문장을 서버에서 다룰 수 있는 구조화된 객체로 변환
- 여러 음식이 한 번에 입력되어도 배열로 처리
- 1개 기준 영양값을 반환하도록 프롬프트에 규칙을 제시하고, 수량 곱셈은 서비스 로직에서 처리
- 모델 요청 및 JSON 파싱 오류에 대한 기본 실패 응답 구성


### 5.2 JWT 인증 정보 기반 사용자별 데이터 접근 제어

 **사용자가 자신의 식단 기록에만 접근할 수 있도록 인증 정보와 데이터 조회 조건을 연결했습니다.**

클라이언트에서 전달한 사용자 식별자를 그대로 신뢰하지 않고, Spring Security의 `JwtAuthFilter`에서 JWT를 검증한 뒤 `SecurityContextHolder`에 저장된 인증 정보를 기준으로 사용자를 식별합니다.

`MealController`는 `Authentication` 객체에서 사용자 이메일을 추출해 `MealService`로 전달하고, MyBatis Mapper에서는 이를 `user_id` 조건으로 사용하여 조회·수정·삭제 대상을 제한합니다.

**인증 정보 기반 사용자 식별**

예시)

```java
String userId = (String) authentication.getPrincipal();

return ResponseEntity.ok(
    mealService.handle(vo, userId)
);
```

**데이터베이스 접근 범위 제한**

예시)

```sql
DELETE FROM meal_item
WHERE user_id = #{userId}
  AND id = #{itemId}
```

아이템 ID뿐 아니라 인증된 사용자의 식별자를 함께 조건으로 사용하므로, 다른 사용자의 식단 ID를 알고 있더라도 해당 데이터를 삭제할 수 없도록 구성했습니다.

또한 수정·삭제 작업에서는 SQL 실행 결과를 확인하고, 해당 조건에 일치하는 데이터가 없으면 `404 Not Found`를 반환하도록 처리했습니다.

이를 통해 **인증된 사용자 식별부터 실제 데이터 접근 제한까지 서버 측에서 일관되게 처리**하도록 구현했습니다.


### 5.3 Access / Refresh Token의 역할 분리

- 로그인 성공 시 Access Token을 JSON 응답으로 발급하고 프론트엔드 메모리 변수로 관리합니다.
- Refresh Token은 `HttpOnly`, `Secure`, `SameSite=Lax` 쿠키에 저장합니다.
- API 요청에는 Access Token을 `Authorization: Bearer ...`로 전달합니다.
- 401 응답이 돌아오면 `apiFetch()`가 토큰 재발급을 시도한 뒤 요청을 **최대 1회** 재시도합니다.
- `refreshingPromise`를 공유해 동시 요청이 여러 번 실패해도 갱신 요청이 중복되는 것을 줄이도록 구현했습니다.

Google OAuth2 로그인 성공 시 자체 Refresh Token을 HttpOnly 쿠키로 발급하고, 프론트엔드의 콜백 페이지에서 Access Token을 재발급받도록 구현했습니다.

일반 API 요청은 JWT 기반으로 인증하며, OAuth2 로그인 과정에서는 Spring Security의 세션 관리 기능을 활용할 수 있도록 구성했습니다.


### 5.4 반복 입력을 줄이는 토큰 UI

`Composer.jsx`는 즐겨찾기 또는 최근 표시된 음식을 클릭하면 음식 토큰을 만들고, 같은 이름을 선택하면 수량을 증가시킵니다. 전송 시 토큰의 이름, 영양값 및 수량을 자연어 문자열에 포함해 서버로 전달합니다. 기록 수정은 모달을 통해 수행합니다.


### 5.5 Jenkins 기반 빌드와 배포

간략한 흐름은 다음과 같습니다.

1. Gradle 8 / JDK 21 컨테이너에서 Spring Boot `bootJar` 빌드
2. Node 20 컨테이너에서 `npm ci`, `npm run build` 수행
3. 백엔드 JAR 및 프론트엔드 `dist`를 배포 디렉터리에 복사
4. `docker compose up -d --build spring` 실행
5. Nginx 컨테이너 재시작



## 6. 주요 API

| Method | Endpoint | 설명 |
| --- | --- | --- |
| POST | `/api/auth/login` | 이메일 로그인, Access Token 응답 및 Refresh Token 쿠키 발급 |
| POST | `/api/auth/refresh` | 쿠키 검증 후 Access Token 재발급 |
| POST | `/api/auth/logout` | 클라이언트 Refresh Token 쿠키 만료 처리 |
| POST | `/api/auth/me` | 사용자 목표 정보 조회 |
| POST | `/api/auth/signup` | 이메일 회원가입 API 구현 (현 SecurityConfig의 익명 접근 허용 여부 점검 필요) |
| PUT | `/api/auth/target` | 목표 칼로리/단백질 수정 |
| POST | `/api/meal/item` | 자연어 식단 기록 |
| PUT | `/api/meal/item/{itemId}` | 음식 수정 |
| DELETE | `/api/meal/item/{itemId}` | 음식 삭제 |
| POST | `/api/meal/today?date=YYYY-MM-DD` | 날짜별 식단·합계·대화 로그 |
| GET | `/api/meal/favorite` | 즐겨찾기 목록 |
| POST | `/api/meal/favorite` | 즐겨찾기 추가 |
| DELETE | `/api/meal/favorite` | 즐겨찾기 삭제 |


## 7. 프로젝트 구조

```text
meal-tracker/
├── backend/meatTracker/
│   ├── src/main/java/com/example/mealTracker/
│   │   ├── common/            # JWT 필터, 토큰, OAuth2 성공 처리
│   │   ├── config/            # Spring Security 설정
│   │   ├── controller/        # 인증 및 식단 API
│   │   ├── dto/               # 요청/응답 모델
│   │   ├── domain/            # 식단/사용자/로그 모델
│   │   ├── mapper/            # MyBatis Mapper 인터페이스
│   │   └── service/           # 사용자, 식단, AI 연동 서비스
│   ├── src/main/resources/mapper/ # MyBatis SQL XML
│   └── src/test/            # 일부 JWT 관련 테스트
├── frontend/
│   └── src/
│       ├── components/        # 식단 입력 및 편집 UI
│       ├── lib/apiFetch.js    # Access Token 관리 및 401 재시도
│       ├── AppRouter.jsx      # 로그인 복원과 보호 라우팅
│       └── Dashboard.jsx      # 날짜별 기록 및 대시보드
└── Jenkinsfile               # 빌드 및 배포 파이프라인
```



---

