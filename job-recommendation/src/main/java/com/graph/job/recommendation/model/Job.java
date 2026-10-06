package com.graph.job.recommendation.model;

public record Job(
        Long id,
        String title,
        String location,
        Integer minExperienceYears,
        Double salary,
        String employmentType
) {
}
