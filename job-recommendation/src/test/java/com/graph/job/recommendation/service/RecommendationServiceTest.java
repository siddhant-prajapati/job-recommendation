package com.graph.job.recommendation.service;

import com.graph.job.recommendation.dto.JobRecommendationResponse;
import com.graph.job.recommendation.exception.CandidateNotFoundException;
import com.graph.job.recommendation.model.Candidate;
import com.graph.job.recommendation.model.CandidateProfile;
import com.graph.job.recommendation.model.Company;
import com.graph.job.recommendation.model.Job;
import com.graph.job.recommendation.model.RecommendedJob;
import com.graph.job.recommendation.repository.CandidateRepository;
import com.graph.job.recommendation.repository.RecommendationRepository;
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
class RecommendationServiceTest {

    @Mock
    private CandidateRepository candidateRepository;

    @Mock
    private RecommendationRepository recommendationRepository;

    private RecommendationService recommendationService;

    @BeforeEach
    void setUp() {
        recommendationService = new RecommendationService(candidateRepository, recommendationRepository);
    }

    @Test
    void skillScoreIsPercentageOfRequiredSkillsMatched() {
        RecommendedJob job = recommendedJob(List.of("Java", "Spring Boot"), List.of("Java", "Spring Boot", "Kafka"), false, 0);

        assertThat(RecommendationService.skillScore(job)).isCloseTo(66.67, org.assertj.core.data.Offset.offset(0.01));
    }

    @Test
    void experienceScoreIsFullWhenCandidateMeetsMinimum() {
        assertThat(RecommendationService.experienceScore(5, 4)).isEqualTo(100.0);
        assertThat(RecommendationService.experienceScore(3, 6)).isEqualTo(50.0);
        assertThat(RecommendationService.experienceScore(4, 0)).isEqualTo(100.0);
    }

    @Test
    void locationScorePrefersExactThenRemote() {
        assertThat(RecommendationService.locationScore("Bengaluru", "Bengaluru")).isEqualTo(100.0);
        assertThat(RecommendationService.locationScore("Pune", "Remote")).isEqualTo(70.0);
        assertThat(RecommendationService.locationScore("Delhi", "Mumbai")).isEqualTo(0.0);
    }

    @Test
    void recommendThrowsWhenCandidateDoesNotExist() {
        when(candidateRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> recommendationService.recommend(99L))
                .isInstanceOf(CandidateNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    void recommendRanksSkillMatchesAndAddsFormerCompanyBonus() {
        Candidate alice = new Candidate(1L, "Alice Sharma", 5, "Bengaluru");
        when(candidateRepository.findById(1L)).thenReturn(Optional.of(new CandidateProfile(alice, List.of(), List.of())));

        RecommendedJob skillMatch = recommendedJob(
                List.of("Java", "Spring Boot", "PostgreSQL"),
                List.of("Java", "Spring Boot", "PostgreSQL", "REST API"),
                false,
                0
        );
        RecommendedJob formerCompany = new RecommendedJob(
                new Job(3L, "Backend Developer", "Hyderabad", 3, 1600000.0, "FULL_TIME"),
                new Company(1L, "Infosys"),
                List.of("Java", "Spring Boot"),
                List.of("Java", "Spring Boot", "PostgreSQL", "Docker"),
                List.of(),
                0,
                true,
                "COMPANY"
        );

        when(recommendationRepository.findSkillBasedRecommendations(1L)).thenReturn(List.of(skillMatch));
        when(recommendationRepository.findCompanyBasedRecommendations(1L)).thenReturn(List.of(formerCompany));
        when(recommendationRepository.findColleagueNetworkRecommendations(1L)).thenReturn(List.of());

        List<JobRecommendationResponse> results = recommendationService.recommend(1L);

        assertThat(results).hasSize(2);
        assertThat(results.getFirst().jobId()).isEqualTo(1L);
        assertThat(results.getFirst().matchScore()).isGreaterThan(results.get(1).matchScore());
        assertThat(results.get(1).reasons()).anyMatch(reason -> reason.contains("Former employer"));
    }

    @Test
    void recommendReturnsEmptyListWhenThereAreNoMatches() {
        Candidate alice = new Candidate(1L, "Alice Sharma", 5, "Bengaluru");
        when(candidateRepository.findById(1L)).thenReturn(Optional.of(new CandidateProfile(alice, List.of(), List.of())));
        when(recommendationRepository.findSkillBasedRecommendations(1L)).thenReturn(List.of());
        when(recommendationRepository.findCompanyBasedRecommendations(1L)).thenReturn(List.of());
        when(recommendationRepository.findColleagueNetworkRecommendations(1L)).thenReturn(List.of());

        assertThat(recommendationService.recommend(1L)).isEmpty();
    }

    @Test
    void mergeCombinesGraphSignalsForTheSameJob() {
        Candidate alice = new Candidate(1L, "Alice Sharma", 5, "Bengaluru");
        when(candidateRepository.findById(1L)).thenReturn(Optional.of(new CandidateProfile(alice, List.of(), List.of())));

        RecommendedJob fromSkills = recommendedJob(List.of("Java", "Spring Boot"), List.of("Java", "Spring Boot", "Kafka"), false, 0);
        RecommendedJob fromNetwork = new RecommendedJob(
                fromSkills.job(),
                fromSkills.company(),
                List.of("Java"),
                fromSkills.requiredSkills(),
                List.of("Kafka"),
                3,
                false,
                "NETWORK"
        );

        when(recommendationRepository.findSkillBasedRecommendations(1L)).thenReturn(List.of(fromSkills));
        when(recommendationRepository.findCompanyBasedRecommendations(1L)).thenReturn(List.of());
        when(recommendationRepository.findColleagueNetworkRecommendations(1L)).thenReturn(List.of(fromNetwork));

        List<JobRecommendationResponse> results = recommendationService.recommend(1L);

        assertThat(results).hasSize(1);
        assertThat(results.getFirst().reasons()).anyMatch(reason -> reason.contains("colleague"));
        assertThat(results.getFirst().matchedSkills()).contains("Java", "Spring Boot");
    }

    private static RecommendedJob recommendedJob(
            List<String> matched,
            List<String> required,
            boolean formerCompany,
            int colleagues
    ) {
        return new RecommendedJob(
                new Job(1L, "Java Backend Developer", "Bengaluru", 4, 1800000.0, "FULL_TIME"),
                new Company(6L, "Google"),
                matched,
                required,
                List.of(),
                colleagues,
                formerCompany,
                "SKILL"
        );
    }
}
