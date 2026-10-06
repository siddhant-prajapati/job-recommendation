package com.graph.job.recommendation.controller;

import com.graph.job.recommendation.dto.JobCreateRequest;
import com.graph.job.recommendation.dto.JobRecommendationResponse;
import com.graph.job.recommendation.dto.JobResponse;
import com.graph.job.recommendation.service.JobService;
import com.graph.job.recommendation.service.RecommendationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private final JobService jobService;
    private final RecommendationService recommendationService;

    public JobController(JobService jobService, RecommendationService recommendationService) {
        this.jobService = jobService;
        this.recommendationService = recommendationService;
    }

    @GetMapping
    public List<JobResponse> findAll() {
        return jobService.findAll();
    }

    @GetMapping("/recommendations")
    public List<JobRecommendationResponse> recommend(@RequestParam Long candidateId) {
        return recommendationService.recommend(candidateId);
    }

    @GetMapping("/{id}")
    public JobResponse findById(@PathVariable Long id) {
        return jobService.findById(id);
    }

    @GetMapping("/{id}/related")
    public List<JobResponse> findRelated(@PathVariable Long id) {
        return jobService.findRelated(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public JobResponse create(@Valid @RequestBody JobCreateRequest request) {
        return jobService.create(request);
    }
}
