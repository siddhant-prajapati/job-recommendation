package com.graph.job.recommendation.controller;

import com.graph.job.recommendation.dto.CandidateCreateRequest;
import com.graph.job.recommendation.dto.CandidateResponse;
import com.graph.job.recommendation.dto.SkillResponse;
import com.graph.job.recommendation.service.CandidateService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/candidates")
public class CandidateController {

    private final CandidateService candidateService;

    public CandidateController(CandidateService candidateService) {
        this.candidateService = candidateService;
    }

    @GetMapping
    public List<CandidateResponse> findAll() {
        return candidateService.findAll();
    }

    @GetMapping("/{id}")
    public CandidateResponse findById(@PathVariable Long id) {
        return candidateService.findById(id);
    }

    @GetMapping("/{id}/skills")
    public List<SkillResponse> findSkills(@PathVariable Long id) {
        return candidateService.findSkills(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CandidateResponse create(@Valid @RequestBody CandidateCreateRequest request) {
        return candidateService.create(request);
    }
}
