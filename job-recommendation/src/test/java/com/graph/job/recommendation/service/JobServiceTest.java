package com.graph.job.recommendation.service;

import com.graph.job.recommendation.dto.JobResponse;
import com.graph.job.recommendation.exception.JobNotFoundException;
import com.graph.job.recommendation.model.Company;
import com.graph.job.recommendation.model.Job;
import com.graph.job.recommendation.model.JobDetails;
import com.graph.job.recommendation.model.Skill;
import com.graph.job.recommendation.repository.JobRepository;
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
class JobServiceTest {

    @Mock
    private JobRepository jobRepository;

    private JobService jobService;

    @BeforeEach
    void setUp() {
        jobService = new JobService(jobRepository);
    }

    @Test
    void findByIdIncludesCompanyAndSkills() {
        JobDetails details = new JobDetails(
                new Job(1L, "Java Backend Developer", "Bengaluru", 4, 1800000.0, "FULL_TIME"),
                new Company(6L, "Google"),
                new com.graph.job.recommendation.model.Location(1L, "Bengaluru"),
                List.of(new Skill(1L, "Java"), new Skill(2L, "Spring Boot"))
        );
        when(jobRepository.findById(1L)).thenReturn(Optional.of(details));

        JobResponse response = jobService.findById(1L);

        assertThat(response.title()).isEqualTo("Java Backend Developer");
        assertThat(response.company().name()).isEqualTo("Google");
        assertThat(response.requiredSkills()).hasSize(2);
    }

    @Test
    void findByIdThrowsWhenMissing() {
        when(jobRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> jobService.findById(99L))
                .isInstanceOf(JobNotFoundException.class);
    }
}
