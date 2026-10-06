package com.graph.job.recommendation.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record CandidateCreateRequest(
        @NotBlank String name,
        @NotNull @Min(0) Integer experienceYears,
        @NotBlank String location,
        List<Long> skillIds,
        List<Long> companyIds
) {
}
