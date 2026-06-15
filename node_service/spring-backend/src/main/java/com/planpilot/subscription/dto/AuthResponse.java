package com.planpilot.subscription.dto;

public record AuthResponse(
        String token,
        UserResponse user
) {
}
