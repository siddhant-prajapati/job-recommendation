package com.graph.job.recommendation.service;

import com.graph.job.recommendation.dto.CompanyResponse;
import com.graph.job.recommendation.mapper.ApiMapper;
import com.graph.job.recommendation.repository.CompanyRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CompanyService {

    private final CompanyRepository companyRepository;

    public CompanyService(CompanyRepository companyRepository) {
        this.companyRepository = companyRepository;
    }

    public List<CompanyResponse> findAll() {
        return companyRepository.findAll().stream()
                .map(ApiMapper::toCompanyResponse)
                .toList();
    }
}
