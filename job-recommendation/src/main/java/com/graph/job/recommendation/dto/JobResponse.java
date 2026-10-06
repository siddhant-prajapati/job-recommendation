package com.graph.job.recommendation.dto;

import java.util.List;

public record JobResponse(
        Long id,
        String title,
        String location,
        Integer minExperienceYears,
        Double salary,
        String employmentType,
        CompanyResponse company,
        LocationResponse locatedIn,
        List<SkillResponse> requiredSkills
) {
}
