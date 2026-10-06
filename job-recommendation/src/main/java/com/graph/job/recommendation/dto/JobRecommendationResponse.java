package com.graph.job.recommendation.dto;

import java.util.List;

public record JobRecommendationResponse(
        Long jobId,
        String title,
        String company,
        String location,
        Integer minExperienceYears,
        Double salary,
        String employmentType,
        List<String> matchedSkills,
        List<String> requiredSkills,
        int matchedSkillCount,
        double matchScore,
        List<String> reasons
) {
}
