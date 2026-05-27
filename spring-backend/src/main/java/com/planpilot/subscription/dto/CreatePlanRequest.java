package com.planpilot.subscription.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record CreatePlanRequest(
        @NotBlank String name,
        @NotBlank String tier,
        @NotNull @Min(0) Integer monthly_price,
        @NotNull @Min(0) Integer yearly_price,
        @NotNull @Min(0) Integer benefits_score,
        @NotNull @Min(1) Integer seats,
        @NotBlank String support,
        @NotBlank String description,
        List<String> features,
        List<String> tags
) {
}
