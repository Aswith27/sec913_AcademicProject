package com.planpilot.subscription.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record StatusUpdateRequest(
        @NotNull Long subscription_id,
        @NotBlank String status
) {
}
