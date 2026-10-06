package com.graph.job.recommendation.service;

import com.graph.job.recommendation.dto.SkillResponse;
import com.graph.job.recommendation.mapper.ApiMapper;
import com.graph.job.recommendation.repository.SkillRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SkillService {

    private final SkillRepository skillRepository;

    public SkillService(SkillRepository skillRepository) {
        this.skillRepository = skillRepository;
    }

    public List<SkillResponse> findAll() {
        return skillRepository.findAll().stream()
                .map(ApiMapper::toSkillResponse)
                .toList();
    }
}
