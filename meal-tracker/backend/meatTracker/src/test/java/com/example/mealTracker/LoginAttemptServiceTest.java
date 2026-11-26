package com.example.mealTracker;

import com.example.mealTracker.service.LoginAttemptService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class LoginAttemptServiceTest {

    private LoginAttemptService service;

    @BeforeEach
    void setUp() {
        // 각 테스트가 서로 영향을 주지 않도록 새 서비스 인스턴스를 사용한다.
        service = new LoginAttemptService();
    }

    @Test
    void allowsLoginUntilTheTenthFailure() {
        String email = "test@example.com";

        // 9번 실패한 상태에서는 아직 로그인을 시도할 수 있다.
        for (int i = 0; i < 9; i++) {
            service.recordFailure(email);
        }

        assertThatCode(() -> service.checkLimit(email)).doesNotThrowAnyException();

        // 10번째 실패 이후에는 429 응답으로 차단된다.
        service.recordFailure(email);

        assertThatThrownBy(() -> service.checkLimit(email))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(exception -> assertThat(((ResponseStatusException) exception).getStatusCode())
                        .isEqualTo(HttpStatus.TOO_MANY_REQUESTS));
    }

    @Test
    void resetClearsFailuresAndRemovesBlock() {
        String email = "test@example.com";
        // 먼저 실패를 10번 기록해 계정을 차단한다.
        for (int i = 0; i < 10; i++) {
            service.recordFailure(email);
        }

        // 초기화 후 차단이 해제되고 실패 횟수도 처음부터 다시 센다.
        service.reset(email);
        assertThatCode(() -> service.checkLimit(email)).doesNotThrowAnyException();

        for (int i = 0; i < 9; i++) {
            service.recordFailure(email);
        }
        assertThatCode(() -> service.checkLimit(email)).doesNotThrowAnyException();
    }

    @Test
    void treatsEmailCaseAndSurroundingWhitespaceAsSameAccount() {
        // 공백과 대문자가 포함된 이메일로 실패를 기록한다.
        for (int i = 0; i < 10; i++) {
            service.recordFailure("  Test@Example.com  ");
        }

        // 표기가 달라도 같은 계정으로 차단되며 초기화할 수 있다.
        assertThatThrownBy(() -> service.checkLimit("test@example.com"))
                .isInstanceOf(ResponseStatusException.class);

        service.reset(" TEST@example.com ");
        assertThatCode(() -> service.checkLimit("test@example.com")).doesNotThrowAnyException();
    }

    @Test
    void keepsFailureCountsSeparateForDifferentAccounts() {
        // 첫 번째 계정의 실패가 두 번째 계정의 로그인에 영향을 주지 않는다.
        for (int i = 0; i < 10; i++) {
            service.recordFailure("first@example.com");
        }

        assertThatCode(() -> service.checkLimit("second@example.com")).doesNotThrowAnyException();
    }
}
