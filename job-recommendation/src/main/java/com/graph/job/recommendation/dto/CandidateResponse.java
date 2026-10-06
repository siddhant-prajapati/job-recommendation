package com.graph.job.recommendation.dto;

import java.util.List;

public record CandidateResponse(
        Long id,
        String name,
        Integer experienceYears,
        String location,
        List<SkillResponse> skills,
        List<CompanyResponse> previousCompanies
) {
}
