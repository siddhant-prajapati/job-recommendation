package com.graph.job.recommendation.controller;

import com.graph.job.recommendation.dto.JobRecommendationResponse;
import com.graph.job.recommendation.exception.GlobalExceptionHandler;
import com.graph.job.recommendation.exception.JobNotFoundException;
import com.graph.job.recommendation.service.JobService;
import com.graph.job.recommendation.service.RecommendationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(JobController.class)
@Import(GlobalExceptionHandler.class)
class JobControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private JobService jobService;

    @MockitoBean
    private RecommendationService recommendationService;

    @Test
    void recommendationsRequireCandidateId() throws Exception {
        mockMvc.perform(get("/api/jobs/recommendations"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void recommendationsReturnJobsForCandidate() throws Exception {
        when(recommendationService.recommend(1L)).thenReturn(List.of(
                new JobRecommendationResponse(
                        1L,
                        "Java Backend Developer",
                        "Google",
                        "Bengaluru",
                        4,
                        1800000.0,
                        "FULL_TIME",
                        List.of("Java"),
                        List.of("Java", "Spring Boot"),
                        1,
                        80.0,
                        List.of("Matches 1 of 2 required skills")
                )
        ));

        mockMvc.perform(get("/api/jobs/recommendations").param("candidateId", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Java Backend Developer"));
    }

    @Test
    void relatedReturnsEmptyListWhenNoMatches() throws Exception {
        when(jobService.findRelated(1L)).thenReturn(List.of());

        mockMvc.perform(get("/api/jobs/1/related"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void relatedReturns404WhenJobIsMissing() throws Exception {
        when(jobService.findRelated(99L)).thenThrow(new JobNotFoundException(99L));

        mockMvc.perform(get("/api/jobs/99/related"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Job with id 99 not found"));
    }
}
