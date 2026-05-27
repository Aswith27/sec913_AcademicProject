package com.planpilot.subscription.dto;

import java.util.List;
import java.util.Map;

public record DashboardResponse(
        Map<String, Object> metrics,
        List<PlanResponse> plans,
        List<SubscriptionResponse> subscriptions,
        List<SubscriptionLogResponse> logs,
        List<UserResponse> users
) {
}
