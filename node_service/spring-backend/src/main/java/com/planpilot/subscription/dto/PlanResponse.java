package com.planpilot.subscription.dto;

import java.util.List;

public record PlanResponse(
        Long id,
        String name,
        String tier,
        Integer monthly_price,
        Integer yearly_price,
        Integer benefits_score,
        Integer seats,
        String support,
        List<String> features,
        List<String> tags,
        String description
) {
}
