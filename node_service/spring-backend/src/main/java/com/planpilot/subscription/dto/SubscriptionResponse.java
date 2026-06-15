package com.planpilot.subscription.dto;

import java.time.LocalDate;

public record SubscriptionResponse(
        Long id,
        String status,
        String billing_cycle,
        LocalDate started_on,
        LocalDate renews_on,
        Boolean auto_renew,
        String usage_health,
        UserResponse user,
        PlanResponse plan
) {
}
