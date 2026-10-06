package com.graph.job.recommendation.controller;

import com.graph.job.recommendation.dto.JobRecommendationResponse;
import com.graph.job.recommendation.exception.CandidateNotFoundException;
import com.graph.job.recommendation.exception.CognoDbConnectionException;
import com.graph.job.recommendation.exception.GlobalExceptionHandler;
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

@WebMvcTest(RecommendationController.class)
@Import(GlobalExceptionHandler.class)
class RecommendationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private RecommendationService recommendationService;

    @Test
    void recommendReturnsRankedJobs() throws Exception {
        when(recommendationService.recommend(1L)).thenReturn(List.of(
                new JobRecommendationResponse(
                        101L,
                        "Senior Java Developer",
                        "XYZ Technologies",
                        "Bengaluru",
                        5,
                        2400000.0,
                        "FULL_TIME",
                        List.of("Java", "Spring Boot", "PostgreSQL"),
                        List.of("Java", "Spring Boot", "PostgreSQL", "Kafka"),
                        3,
                        92.0,
                        List.of("Matches 3 of 4 required skills")
                )
        ));

        mockMvc.perform(get("/api/candidates/1/recommendations"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].jobId").value(101))
                .andExpect(jsonPath("$[0].matchScore").value(92.0))
                .andExpect(jsonPath("$[0].matchedSkills[0]").value("Java"));
    }

    @Test
    void recommendReturnsEmptyArrayWhenThereAreNoMatches() throws Exception {
        when(recommendationService.recommend(1L)).thenReturn(List.of());

        mockMvc.perform(get("/api/candidates/1/recommendations"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void recommendReturns404WhenCandidateIsMissing() throws Exception {
        when(recommendationService.recommend(15L)).thenThrow(new CandidateNotFoundException(15L));

        mockMvc.perform(get("/api/candidates/15/recommendations"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Candidate with id 15 not found"));
    }

    @Test
    void recommendReturns503WhenCognoDbIsUnavailable() throws Exception {
        when(recommendationService.recommend(1L))
                .thenThrow(new CognoDbConnectionException("CognoDB is currently unavailable", new RuntimeException("down")));

        mockMvc.perform(get("/api/candidates/1/recommendations"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Unable to connect to database"));
    }

    @Test
    void recommendReturns400ForInvalidId() throws Exception {
        mockMvc.perform(get("/api/candidates/abc/recommendations"))
                .andExpect(status().isBadRequest());
    }
}
