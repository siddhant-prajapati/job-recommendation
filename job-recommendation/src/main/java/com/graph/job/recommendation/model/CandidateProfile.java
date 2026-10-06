package com.graph.job.recommendation.model;

import java.util.List;

public record CandidateProfile(
        Candidate candidate,
        List<Skill> skills,
        List<Company> previousCompanies
) {
}
