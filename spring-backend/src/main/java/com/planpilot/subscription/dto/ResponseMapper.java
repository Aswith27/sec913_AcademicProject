package com.planpilot.subscription.dto;

import com.planpilot.subscription.entity.AppUser;
import com.planpilot.subscription.entity.Plan;
import com.planpilot.subscription.entity.Subscription;
import com.planpilot.subscription.entity.SubscriptionLog;

import java.util.ArrayList;

public final class ResponseMapper {

    private ResponseMapper() {
    }

    public static UserResponse toUserResponse(AppUser user) {
        return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getCompany(), user.getRole().name());
    }

    public static PlanResponse toPlanResponse(Plan plan) {
        return new PlanResponse(
                plan.getId(),
                plan.getName(),
                plan.getTier(),
                plan.getMonthlyPrice(),
                plan.getYearlyPrice(),
                plan.getBenefitsScore(),
                plan.getSeats(),
                plan.getSupport(),
                new ArrayList<>(plan.getFeatures()),
                new ArrayList<>(plan.getTags()),
                plan.getDescription()
        );
    }

    public static SubscriptionResponse toSubscriptionResponse(Subscription subscription) {
        return new SubscriptionResponse(
                subscription.getId(),
                subscription.getStatus(),
                subscription.getBillingCycle(),
                subscription.getStartedOn(),
                subscription.getRenewsOn(),
                subscription.getAutoRenew(),
                subscription.getUsageHealth(),
                toUserResponse(subscription.getUser()),
                toPlanResponse(subscription.getPlan())
        );
    }

    public static SubscriptionLogResponse toLogResponse(SubscriptionLog log) {
        return new SubscriptionLogResponse(
                log.getId(),
                log.getAction(),
                log.getMessage(),
                log.getCreatedAt(),
                log.getSubscription().getId()
        );
    }
}
