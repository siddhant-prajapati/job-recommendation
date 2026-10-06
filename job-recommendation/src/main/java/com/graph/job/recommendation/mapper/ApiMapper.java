package com.graph.job.recommendation.mapper;

import com.graph.job.recommendation.dto.CandidateResponse;
import com.graph.job.recommendation.dto.CompanyResponse;
import com.graph.job.recommendation.dto.JobRecommendationResponse;
import com.graph.job.recommendation.dto.JobResponse;
import com.graph.job.recommendation.dto.LocationResponse;
import com.graph.job.recommendation.dto.SkillResponse;
import com.graph.job.recommendation.model.CandidateProfile;
import com.graph.job.recommendation.model.Company;
import com.graph.job.recommendation.model.Job;
import com.graph.job.recommendation.model.JobDetails;
import com.graph.job.recommendation.model.Location;
import com.graph.job.recommendation.model.Skill;
import com.graph.job.recommendation.service.ScoredRecommendation;

import java.util.List;

public final class ApiMapper {

    private ApiMapper() {
    }

    public static CandidateResponse toCandidateResponse(CandidateProfile profile) {
        return new CandidateResponse(
                profile.candidate().id(),
                profile.candidate().name(),
                profile.candidate().experienceYears(),
                profile.candidate().location(),
                profile.skills().stream().map(ApiMapper::toSkillResponse).toList(),
                profile.previousCompanies().stream().map(ApiMapper::toCompanyResponse).toList()
        );
    }

    public static JobResponse toJobResponse(JobDetails details) {
        Company company = details.company();
        Location location = details.location();
        String locationName = location != null ? location.name() : details.job().location();
        return new JobResponse(
                details.job().id(),
                details.job().title(),
                locationName,
                details.job().minExperienceYears(),
                details.job().salary(),
                details.job().employmentType(),
                company == null ? null : toCompanyResponse(company),
                location == null ? null : toLocationResponse(location),
                details.requiredSkills().stream().map(ApiMapper::toSkillResponse).toList()
        );
    }

    public static SkillResponse toSkillResponse(Skill skill) {
        return new SkillResponse(skill.id(), skill.name());
    }

    public static LocationResponse toLocationResponse(Location location) {
        return new LocationResponse(location.id(), location.name());
    }

    public static CompanyResponse toCompanyResponse(Company company) {
        return new CompanyResponse(company.id(), company.name());
    }

    public static JobRecommendationResponse toRecommendationResponse(ScoredRecommendation scored) {
        Job job = scored.job().job();
        Company company = scored.job().company();
        List<String> matched = scored.job().matchedSkills();
        return new JobRecommendationResponse(
                job.id(),
                job.title(),
                company == null ? null : company.name(),
                job.location(),
                job.minExperienceYears(),
                job.salary(),
                job.employmentType(),
                matched,
                scored.job().requiredSkills(),
                matched.size(),
                scored.matchScore(),
                scored.reasons()
        );
    }
}
