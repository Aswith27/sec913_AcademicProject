package com.planpilot.subscription.dto;

public record UserResponse(
        Long id,
        String name,
        String email,
        String company,
        String role
) {
}
