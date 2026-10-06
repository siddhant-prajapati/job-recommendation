package com.graph.job.recommendation.repository;

import com.graph.job.recommendation.dto.JobCreateRequest;
import com.graph.job.recommendation.model.Company;
import com.graph.job.recommendation.model.Job;
import com.graph.job.recommendation.model.JobDetails;
import com.graph.job.recommendation.model.Location;
import org.neo4j.driver.Record;
import org.springframework.stereotype.Repository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static com.graph.job.recommendation.mapper.GraphNodeMapper.toCompany;
import static com.graph.job.recommendation.mapper.GraphNodeMapper.toJob;
import static com.graph.job.recommendation.mapper.GraphNodeMapper.toLocation;
import static com.graph.job.recommendation.mapper.GraphNodeMapper.toSkills;

@Repository
public class JobRepository {

    private static final String FIND_ALL = """
            MATCH (j:Job)
            OPTIONAL MATCH (j)-[:POSTED_BY|OFFERED_BY]->(company:Company)
            OPTIONAL MATCH (j)-[:LOCATED_IN]->(loc:Location)
            OPTIONAL MATCH (j)-[:REQUIRES_SKILL]->(s:Skill)
            RETURN j, company, loc, collect(DISTINCT s) AS skills
            ORDER BY j.id
            """;

    private static final String FIND_BY_ID = """
            MATCH (j:Job {id: $id})
            OPTIONAL MATCH (j)-[:POSTED_BY|OFFERED_BY]->(company:Company)
            OPTIONAL MATCH (j)-[:LOCATED_IN]->(loc:Location)
            OPTIONAL MATCH (j)-[:REQUIRES_SKILL]->(s:Skill)
            RETURN j, company, loc, collect(DISTINCT s) AS skills
            """;

    private static final String FIND_RELATED = """
            MATCH (j:Job {id: $jobId})-[:REQUIRES_SKILL]->(s:Skill)<-[:REQUIRES_SKILL]-(related:Job)
            WHERE related <> j
            OPTIONAL MATCH (related)-[:POSTED_BY|OFFERED_BY]->(company:Company)
            OPTIONAL MATCH (related)-[:LOCATED_IN]->(loc:Location)
            WITH related, company, loc, collect(DISTINCT s.name) AS sharedSkills
            OPTIONAL MATCH (related)-[:REQUIRES_SKILL]->(req:Skill)
            RETURN related AS j, company, loc, collect(DISTINCT req) AS skills, sharedSkills
            ORDER BY size(sharedSkills) DESC, related.title
            LIMIT 10
            """;

    private static final String CREATE = """
            OPTIONAL MATCH (existing:Job)
            WITH coalesce(max(existing.id), 0) + 1 AS nextId
            MATCH (company:Company {id: $companyId})
            MERGE (loc:Location {name: $location})
            ON CREATE SET loc.id = coalesce(nextId + 1000, 1)
            CREATE (j:Job {
              id: nextId,
              title: $title,
              location: $location,
              minExperienceYears: $minExperienceYears,
              salary: $salary,
              employmentType: $employmentType
            })
            MERGE (j)-[:POSTED_BY]->(company)
            MERGE (j)-[:LOCATED_IN]->(loc)
            WITH j, company, loc
            CALL {
              WITH j
              UNWIND $skillIds AS skillId
              MATCH (s:Skill {id: skillId})
              MERGE (j)-[:REQUIRES_SKILL {required: true}]->(s)
            }
            WITH j, company, loc
            OPTIONAL MATCH (j)-[:REQUIRES_SKILL]->(s:Skill)
            RETURN j, company, loc, collect(DISTINCT s) AS skills
            """;

    private final Neo4jClient client;

    public JobRepository(Neo4jClient client) {
        this.client = client;
    }

    public List<JobDetails> findAll() {
        return client.read(FIND_ALL, Map.of()).stream()
                .map(this::toDetails)
                .toList();
    }

    public Optional<JobDetails> findById(Long id) {
        return client.read(FIND_BY_ID, Map.of("id", id)).stream()
                .findFirst()
                .map(this::toDetails);
    }

    public List<JobDetails> findRelated(Long jobId) {
        return client.read(FIND_RELATED, Map.of("jobId", jobId)).stream()
                .map(this::toDetails)
                .toList();
    }

    public JobDetails create(JobCreateRequest request) {
        Map<String, Object> params = new HashMap<>();
        params.put("title", request.title());
        params.put("location", request.location());
        params.put("minExperienceYears", request.minExperienceYears());
        params.put("salary", request.salary());
        params.put("employmentType", request.employmentType());
        params.put("companyId", request.companyId());
        params.put("skillIds", request.skillIds());

        return client.write(CREATE, params).stream()
                .findFirst()
                .map(this::toDetails)
                .orElseThrow(() -> new IllegalStateException("Failed to create job. Check that the company and skills exist."));
    }

    private JobDetails toDetails(Record record) {
        Job job = toJob(record.get("j").asNode());
        Company company = record.get("company").isNull() ? null : toCompany(record.get("company").asNode());
        Location location = record.get("loc").isNull() ? null : toLocation(record.get("loc").asNode());
        return new JobDetails(job, company, location, toSkills(record.get("skills")));
    }
}
