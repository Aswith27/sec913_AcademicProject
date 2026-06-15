package com.planpilot.subscription.dto;

public record SearchResultResponse(
        PlanResponse plan,
        Double score,
        String reason
) {
}
