package com.graph.job.recommendation.service;

import com.graph.job.recommendation.dto.JobRecommendationResponse;
import com.graph.job.recommendation.exception.CandidateNotFoundException;
import com.graph.job.recommendation.mapper.ApiMapper;
import com.graph.job.recommendation.model.Candidate;
import com.graph.job.recommendation.model.CandidateProfile;
import com.graph.job.recommendation.model.Job;
import com.graph.job.recommendation.model.RecommendedJob;
import com.graph.job.recommendation.repository.CandidateRepository;
import com.graph.job.recommendation.repository.RecommendationRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class RecommendationService {

    static final double SKILL_WEIGHT = 0.60;
    static final double EXPERIENCE_WEIGHT = 0.20;
    static final double LOCATION_WEIGHT = 0.20;
    static final double FORMER_COMPANY_BONUS = 8.0;
    static final double NETWORK_BONUS_PER_COLLEAGUE = 1.5;
    static final double NETWORK_BONUS_CAP = 10.0;

    private final CandidateRepository candidateRepository;
    private final RecommendationRepository recommendationRepository;

    public RecommendationService(
            CandidateRepository candidateRepository,
            RecommendationRepository recommendationRepository
    ) {
        this.candidateRepository = candidateRepository;
        this.recommendationRepository = recommendationRepository;
    }

    public List<JobRecommendationResponse> recommend(Long candidateId) {
        CandidateProfile profile = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new CandidateNotFoundException(candidateId));

        Candidate candidate = profile.candidate();
        Map<Long, ScoredRecommendation> merged = new LinkedHashMap<>();

        merge(merged, recommendationRepository.findSkillBasedRecommendations(candidateId), candidate);
        merge(merged, recommendationRepository.findCompanyBasedRecommendations(candidateId), candidate);
        merge(merged, recommendationRepository.findColleagueNetworkRecommendations(candidateId), candidate);

        return merged.values().stream()
                .sorted(Comparator.comparingDouble(ScoredRecommendation::matchScore).reversed())
                .map(ApiMapper::toRecommendationResponse)
                .toList();
    }

    private void merge(Map<Long, ScoredRecommendation> merged, List<RecommendedJob> jobs, Candidate candidate) {
        for (RecommendedJob job : jobs) {
            merged.merge(job.job().id(), score(job, candidate), (current, incoming) ->
                    score(combine(current.job(), incoming.job()), candidate));
        }
    }

    static RecommendedJob combine(RecommendedJob left, RecommendedJob right) {
        return new RecommendedJob(
                left.job(),
                left.company() != null ? left.company() : right.company(),
                union(left.matchedSkills(), right.matchedSkills()),
                left.requiredSkills().isEmpty() ? right.requiredSkills() : left.requiredSkills(),
                union(left.colleagueSkills(), right.colleagueSkills()),
                Math.max(left.colleagueCount(), right.colleagueCount()),
                left.formerCompany() || right.formerCompany(),
                left.source()
        );
    }

    ScoredRecommendation score(RecommendedJob recommendation, Candidate candidate) {
        Job job = recommendation.job();
        double skillScore = skillScore(recommendation);
        double experienceScore = experienceScore(candidate.experienceYears(), job.minExperienceYears());
        double locationScore = locationScore(candidate.location(), job.location());

        double weighted = (skillScore * SKILL_WEIGHT)
                + (experienceScore * EXPERIENCE_WEIGHT)
                + (locationScore * LOCATION_WEIGHT);

        if (recommendation.formerCompany()) {
            weighted += FORMER_COMPANY_BONUS;
        }
        if (recommendation.colleagueCount() > 0) {
            weighted += Math.min(NETWORK_BONUS_CAP, recommendation.colleagueCount() * NETWORK_BONUS_PER_COLLEAGUE);
        }

        double matchScore = Math.round(Math.min(100.0, weighted) * 10.0) / 10.0;
        return new ScoredRecommendation(recommendation, matchScore, reasons(recommendation, candidate, skillScore, experienceScore, locationScore));
    }

    static double skillScore(RecommendedJob recommendation) {
        int required = recommendation.requiredSkills().size();
        if (required == 0) {
            return 0.0;
        }
        return (recommendation.matchedSkills().size() / (double) required) * 100.0;
    }

    static double experienceScore(Integer candidateYears, Integer minYears) {
        if (minYears == null || minYears == 0) {
            return 100.0;
        }
        if (candidateYears == null) {
            return 0.0;
        }
        if (candidateYears >= minYears) {
            return 100.0;
        }
        return (candidateYears / (double) minYears) * 100.0;
    }

    static double locationScore(String candidateLocation, String jobLocation) {
        if (isBlank(candidateLocation) || isBlank(jobLocation)) {
            return 50.0;
        }
        String candidate = candidateLocation.trim().toLowerCase(Locale.ROOT);
        String job = jobLocation.trim().toLowerCase(Locale.ROOT);
        if (candidate.equals(job)) {
            return 100.0;
        }
        if ("remote".equals(candidate) || "remote".equals(job)) {
            return 70.0;
        }
        return 0.0;
    }

    private static List<String> reasons(
            RecommendedJob recommendation,
            Candidate candidate,
            double skillScore,
            double experienceScore,
            double locationScore
    ) {
        List<String> reasons = new ArrayList<>();
        int matched = recommendation.matchedSkills().size();
        int required = recommendation.requiredSkills().size();
        if (matched > 0) {
            reasons.add("Matches " + matched + " of " + required + " required skills");
        }
        if (experienceScore >= 100.0) {
            reasons.add("Experience meets the job requirement");
        } else if (candidate.experienceYears() != null && recommendation.job().minExperienceYears() != null) {
            reasons.add("Partial experience match (" + candidate.experienceYears()
                    + "/" + recommendation.job().minExperienceYears() + " years)");
        }
        if (locationScore >= 100.0) {
            reasons.add("Same location: " + recommendation.job().location());
        } else if (locationScore >= 70.0) {
            reasons.add("Remote-friendly location match");
        }
        if (recommendation.formerCompany() && recommendation.company() != null) {
            reasons.add("Former employer: " + recommendation.company().name());
        }
        if (recommendation.colleagueCount() > 0) {
            reasons.add("Connected through " + recommendation.colleagueCount()
                    + " colleague" + (recommendation.colleagueCount() == 1 ? "" : "s")
                    + " from previous companies");
        }
        if (skillScore == 0 && reasons.isEmpty()) {
            reasons.add("Graph-connected opportunity");
        }
        return List.copyOf(reasons);
    }

    private static List<String> union(List<String> left, List<String> right) {
        List<String> values = new ArrayList<>(left);
        for (String value : right) {
            if (!values.contains(value)) {
                values.add(value);
            }
        }
        return List.copyOf(values);
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
