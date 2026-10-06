package com.graph.job.recommendation.service;

import com.graph.job.recommendation.dto.CandidateCreateRequest;
import com.graph.job.recommendation.dto.CandidateResponse;
import com.graph.job.recommendation.dto.SkillResponse;
import com.graph.job.recommendation.exception.CandidateNotFoundException;
import com.graph.job.recommendation.mapper.ApiMapper;
import com.graph.job.recommendation.model.CandidateProfile;
import com.graph.job.recommendation.repository.CandidateRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CandidateService {

    private final CandidateRepository candidateRepository;

    public CandidateService(CandidateRepository candidateRepository) {
        this.candidateRepository = candidateRepository;
    }

    public List<CandidateResponse> findAll() {
        return candidateRepository.findAll().stream()
                .map(ApiMapper::toCandidateResponse)
                .toList();
    }

    public CandidateResponse findById(Long id) {
        CandidateProfile profile = candidateRepository.findById(id)
                .orElseThrow(() -> new CandidateNotFoundException(id));
        return ApiMapper.toCandidateResponse(profile);
    }

    public List<SkillResponse> findSkills(Long id) {
        if (!candidateRepository.existsById(id)) {
            throw new CandidateNotFoundException(id);
        }
        return candidateRepository.findSkillsByCandidateId(id).stream()
                .map(ApiMapper::toSkillResponse)
                .toList();
    }

    public CandidateResponse create(CandidateCreateRequest request) {
        return ApiMapper.toCandidateResponse(candidateRepository.create(request));
    }
}
