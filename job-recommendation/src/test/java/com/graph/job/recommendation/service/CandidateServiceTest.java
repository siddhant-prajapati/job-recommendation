package com.graph.job.recommendation.service;

import com.graph.job.recommendation.dto.CandidateResponse;
import com.graph.job.recommendation.exception.CandidateNotFoundException;
import com.graph.job.recommendation.model.Candidate;
import com.graph.job.recommendation.model.CandidateProfile;
import com.graph.job.recommendation.model.Skill;
import com.graph.job.recommendation.repository.CandidateRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CandidateServiceTest {

    @Mock
    private CandidateRepository candidateRepository;

    private CandidateService candidateService;

    @BeforeEach
    void setUp() {
        candidateService = new CandidateService(candidateRepository);
    }

    @Test
    void findByIdMapsProfileToResponse() {
        CandidateProfile profile = new CandidateProfile(
                new Candidate(1L, "Alice Sharma", 5, "Bengaluru"),
                List.of(new Skill(1L, "Java")),
                List.of()
        );
        when(candidateRepository.findById(1L)).thenReturn(Optional.of(profile));

        CandidateResponse response = candidateService.findById(1L);

        assertThat(response.name()).isEqualTo("Alice Sharma");
        assertThat(response.skills()).hasSize(1);
        assertThat(response.skills().getFirst().name()).isEqualTo("Java");
    }

    @Test
    void findByIdThrowsWhenMissing() {
        when(candidateRepository.findById(15L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> candidateService.findById(15L))
                .isInstanceOf(CandidateNotFoundException.class);
    }
}
