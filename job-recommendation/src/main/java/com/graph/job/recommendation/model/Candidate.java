package com.graph.job.recommendation.model;

public record Candidate(
        Long id,
        String name,
        Integer experienceYears,
        String location
) {
}
