package com.planpilot.subscription.dto;

import jakarta.validation.constraints.NotNull;

public record PlanChangeRequest(
        @NotNull Long subscription_id,
        @NotNull Long new_plan_id,
        String billing_cycle
) {
}
