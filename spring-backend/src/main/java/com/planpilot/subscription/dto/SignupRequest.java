package com.planpilot.subscription.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SignupRequest(
        @NotBlank String name,
        @Email @NotBlank String email,
        @NotBlank String company,
        @NotBlank @Size(min = 6) String password
) {
}
