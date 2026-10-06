package com.graph.job.recommendation.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record JobCreateRequest(
        @NotBlank String title,
        @NotBlank String location,
        @NotNull @Min(0) Integer minExperienceYears,
        Double salary,
        @NotBlank String employmentType,
        @NotNull Long companyId,
        @NotEmpty List<Long> skillIds
) {
}
