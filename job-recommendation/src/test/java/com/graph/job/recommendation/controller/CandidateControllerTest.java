package com.graph.job.recommendation.controller;

import com.graph.job.recommendation.dto.CandidateResponse;
import com.graph.job.recommendation.dto.SkillResponse;
import com.graph.job.recommendation.exception.CandidateNotFoundException;
import com.graph.job.recommendation.exception.CognoDbConnectionException;
import com.graph.job.recommendation.exception.GlobalExceptionHandler;
import com.graph.job.recommendation.service.CandidateService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CandidateController.class)
@Import(GlobalExceptionHandler.class)
class CandidateControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CandidateService candidateService;

    @Test
    void findByIdReturnsCandidate() throws Exception {
        when(candidateService.findById(1L)).thenReturn(new CandidateResponse(
                1L,
                "Alice Sharma",
                5,
                "Bengaluru",
                List.of(new SkillResponse(1L, "Java")),
                List.of()
        ));

        mockMvc.perform(get("/api/candidates/1").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Alice Sharma"))
                .andExpect(jsonPath("$.skills[0].name").value("Java"));
    }

    @Test
    void findByIdReturns404WhenMissing() throws Exception {
        when(candidateService.findById(15L)).thenThrow(new CandidateNotFoundException(15L));

        mockMvc.perform(get("/api/candidates/15"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Candidate with id 15 not found"));
    }

    @Test
    void findAllReturns503WhenCognoDbIsDown() throws Exception {
        when(candidateService.findAll())
                .thenThrow(new CognoDbConnectionException("CognoDB is currently unavailable", new RuntimeException("down")));

        mockMvc.perform(get("/api/candidates"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Unable to connect to database"));
    }
}
