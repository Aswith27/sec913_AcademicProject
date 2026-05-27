package com.planpilot.subscription.dto;

import java.time.LocalDateTime;

public record SubscriptionLogResponse(
        Long id,
        String action,
        String message,
        LocalDateTime created_at,
        Long subscription_id
) {
}
