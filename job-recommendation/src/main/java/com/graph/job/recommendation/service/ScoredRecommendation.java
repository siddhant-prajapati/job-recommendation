package com.graph.job.recommendation.service;

import com.graph.job.recommendation.model.RecommendedJob;

import java.util.List;

public record ScoredRecommendation(
        RecommendedJob job,
        double matchScore,
        List<String> reasons
) {
}
