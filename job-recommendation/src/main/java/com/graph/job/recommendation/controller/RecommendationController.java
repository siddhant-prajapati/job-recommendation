package com.graph.job.recommendation.controller;

import com.graph.job.recommendation.dto.JobRecommendationResponse;
import com.graph.job.recommendation.service.RecommendationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class RecommendationController {

    private final RecommendationService recommendationService;

    public RecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    @GetMapping("/api/candidates/{id}/recommendations")
    public List<JobRecommendationResponse> recommendForCandidate(@PathVariable Long id) {
        return recommendationService.recommend(id);
    }
}
