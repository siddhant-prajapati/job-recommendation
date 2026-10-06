package com.graph.job.recommendation.model;

import java.util.List;

public record RecommendedJob(
        Job job,
        Company company,
        List<String> matchedSkills,
        List<String> requiredSkills,
        List<String> colleagueSkills,
        int colleagueCount,
        boolean formerCompany,
        String source
) {
}
