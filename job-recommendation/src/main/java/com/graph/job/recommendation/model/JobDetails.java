package com.graph.job.recommendation.model;

import java.util.List;

public record JobDetails(
        Job job,
        Company company,
        Location location,
        List<Skill> requiredSkills
) {
}
