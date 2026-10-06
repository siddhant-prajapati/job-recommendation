package com.graph.job.recommendation.service;

import com.graph.job.recommendation.dto.JobCreateRequest;
import com.graph.job.recommendation.dto.JobResponse;
import com.graph.job.recommendation.exception.JobNotFoundException;
import com.graph.job.recommendation.mapper.ApiMapper;
import com.graph.job.recommendation.model.JobDetails;
import com.graph.job.recommendation.repository.JobRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class JobService {

    private final JobRepository jobRepository;

    public JobService(JobRepository jobRepository) {
        this.jobRepository = jobRepository;
    }

    public List<JobResponse> findAll() {
        return jobRepository.findAll().stream()
                .map(ApiMapper::toJobResponse)
                .toList();
    }

    public JobResponse findById(Long id) {
        JobDetails details = jobRepository.findById(id)
                .orElseThrow(() -> new JobNotFoundException(id));
        return ApiMapper.toJobResponse(details);
    }

    public List<JobResponse> findRelated(Long id) {
        if (jobRepository.findById(id).isEmpty()) {
            throw new JobNotFoundException(id);
        }
        return jobRepository.findRelated(id).stream()
                .map(ApiMapper::toJobResponse)
                .toList();
    }

    public JobResponse create(JobCreateRequest request) {
        return ApiMapper.toJobResponse(jobRepository.create(request));
    }
}
