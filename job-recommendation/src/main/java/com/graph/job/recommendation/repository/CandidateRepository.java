package com.graph.job.recommendation.repository;

import com.graph.job.recommendation.dto.CandidateCreateRequest;
import com.graph.job.recommendation.model.Candidate;
import com.graph.job.recommendation.model.CandidateProfile;
import com.graph.job.recommendation.model.Skill;
import org.neo4j.driver.Record;
import org.springframework.stereotype.Repository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static com.graph.job.recommendation.mapper.GraphNodeMapper.toCandidate;
import static com.graph.job.recommendation.mapper.GraphNodeMapper.toCompanies;
import static com.graph.job.recommendation.mapper.GraphNodeMapper.toSkill;
import static com.graph.job.recommendation.mapper.GraphNodeMapper.toSkills;

@Repository
public class CandidateRepository {

    private static final String FIND_ALL = """
            MATCH (c:Candidate)
            OPTIONAL MATCH (c)-[:HAS_SKILL]->(s:Skill)
            OPTIONAL MATCH (c)-[:WORKED_AT]->(co:Company)
            RETURN c, collect(DISTINCT s) AS skills, collect(DISTINCT co) AS companies
            ORDER BY c.id
            """;

    private static final String FIND_BY_ID = """
            MATCH (c:Candidate {id: $id})
            OPTIONAL MATCH (c)-[:HAS_SKILL]->(s:Skill)
            OPTIONAL MATCH (c)-[:WORKED_AT]->(co:Company)
            RETURN c, collect(DISTINCT s) AS skills, collect(DISTINCT co) AS companies
            """;

    private static final String FIND_SKILLS = """
            MATCH (c:Candidate {id: $candidateId})-[:HAS_SKILL]->(s:Skill)
            RETURN s
            ORDER BY s.name
            """;

    private static final String EXISTS_BY_ID = """
            MATCH (c:Candidate {id: $id})
            RETURN count(c) AS count
            """;

    private static final String CREATE = """
            OPTIONAL MATCH (existing:Candidate)
            WITH coalesce(max(existing.id), 0) + 1 AS nextId
            CREATE (c:Candidate {
              id: nextId,
              name: $name,
              experienceYears: $experienceYears,
              location: $location
            })
            MERGE (loc:Location {name: $location})
            MERGE (c)-[:LIVES_IN]->(loc)
            WITH c
            CALL {
              WITH c
              UNWIND $skillIds AS skillId
              MATCH (s:Skill {id: skillId})
              MERGE (c)-[:HAS_SKILL]->(s)
            }
            CALL {
              WITH c
              UNWIND $companyIds AS companyId
              MATCH (co:Company {id: companyId})
              MERGE (c)-[:WORKED_AT]->(co)
            }
            WITH c
            OPTIONAL MATCH (c)-[:HAS_SKILL]->(s:Skill)
            OPTIONAL MATCH (c)-[:WORKED_AT]->(co:Company)
            RETURN c, collect(DISTINCT s) AS skills, collect(DISTINCT co) AS companies
            """;

    private final Neo4jClient client;

    public CandidateRepository(Neo4jClient client) {
        this.client = client;
    }

    public List<CandidateProfile> findAll() {
        return client.read(FIND_ALL, Map.of()).stream()
                .map(this::toProfile)
                .toList();
    }

    public Optional<CandidateProfile> findById(Long id) {
        return client.read(FIND_BY_ID, Map.of("id", id)).stream()
                .findFirst()
                .map(this::toProfile);
    }

    public List<Skill> findSkillsByCandidateId(Long candidateId) {
        return client.read(FIND_SKILLS, Map.of("candidateId", candidateId)).stream()
                .map(record -> toSkill(record.get("s").asNode()))
                .toList();
    }

    public boolean existsById(Long id) {
        return client.read(EXISTS_BY_ID, Map.of("id", id)).stream()
                .findFirst()
                .map(record -> record.get("count").asLong() > 0)
                .orElse(false);
    }

    public CandidateProfile create(CandidateCreateRequest request) {
        Map<String, Object> params = new HashMap<>();
        params.put("name", request.name());
        params.put("experienceYears", request.experienceYears());
        params.put("location", request.location());
        params.put("skillIds", request.skillIds() == null ? List.of() : request.skillIds());
        params.put("companyIds", request.companyIds() == null ? List.of() : request.companyIds());

        return client.write(CREATE, params).stream()
                .findFirst()
                .map(this::toProfile)
                .orElseThrow(() -> new IllegalStateException("Failed to create candidate"));
    }

    private CandidateProfile toProfile(Record record) {
        Candidate candidate = toCandidate(record.get("c").asNode());
        return new CandidateProfile(
                candidate,
                toSkills(record.get("skills")),
                toCompanies(record.get("companies"))
        );
    }
}
