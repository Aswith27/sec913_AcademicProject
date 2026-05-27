package com.planpilot.subscription.dto;

import jakarta.validation.constraints.NotNull;

public record SubscribeRequest(
        @NotNull Long user_id,
        @NotNull Long plan_id,
        @NotNull String billing_cycle
) {
}
