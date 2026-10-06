package com.graph.job.recommendation.repository;

import com.graph.job.recommendation.model.Company;
import com.graph.job.recommendation.model.Job;
import com.graph.job.recommendation.model.RecommendedJob;
import org.neo4j.driver.Record;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

import static com.graph.job.recommendation.mapper.GraphNodeMapper.toCompany;
import static com.graph.job.recommendation.mapper.GraphNodeMapper.toJob;
import static com.graph.job.recommendation.mapper.GraphNodeMapper.toStringList;

@Repository
public class RecommendationRepository {

    /**
     * Query 1 — basic parameterized lookup used by job listing.
     * MATCH (j:Job) RETURN j
     *
     * Query 2 — mandatory 2+ hop traversal:
     * Candidate -HAS_SKILL-> Skill <-REQUIRES_SKILL- Job -POSTED_BY-> Company
     */
    private static final String SKILL_BASED = """
            MATCH (c:Candidate {id: $candidateId})-[:HAS_SKILL]->(s:Skill)<-[:REQUIRES_SKILL]-(j:Job)
            OPTIONAL MATCH (j)-[:POSTED_BY|OFFERED_BY]->(company:Company)
            WITH c, j, company, collect(DISTINCT s.name) AS matchedSkills
            OPTIONAL MATCH (j)-[:REQUIRES_SKILL]->(req:Skill)
            RETURN j, company, matchedSkills, collect(DISTINCT req.name) AS requiredSkills
            ORDER BY size(matchedSkills) DESC, j.title
            """;

    /**
     * 2-hop traversal: Candidate -WORKED_AT-> Company <-POSTED_BY- Job
     */
    private static final String COMPANY_BASED = """
            MATCH (c:Candidate {id: $candidateId})-[:WORKED_AT]->(company:Company)<-[:POSTED_BY|OFFERED_BY]-(j:Job)
            OPTIONAL MATCH (c)-[:HAS_SKILL]->(s:Skill)<-[:REQUIRES_SKILL]-(j)
            WITH c, j, company, collect(DISTINCT s.name) AS matchedSkills
            OPTIONAL MATCH (j)-[:REQUIRES_SKILL]->(req:Skill)
            RETURN j, company, matchedSkills, collect(DISTINCT req.name) AS requiredSkills
            ORDER BY size(matchedSkills) DESC, j.title
            """;

    /**
     * Query 3 — awkward in a relational model (self-join over employment,
     * peer skills, jobs, and employers in one traversal):
     *
     * Candidate -WORKED_AT-> Company <-WORKED_AT- Peer -HAS_SKILL-> Skill
     *   <-REQUIRES_SKILL- Job -POSTED_BY-> Company
     */
    private static final String COLLEAGUE_NETWORK = """
            MATCH (c:Candidate {id: $candidateId})-[:WORKED_AT]->(:Company)<-[:WORKED_AT]-(peer:Candidate)
            WHERE peer <> c
            MATCH (peer)-[:HAS_SKILL]->(s:Skill)<-[:REQUIRES_SKILL]-(j:Job)
            OPTIONAL MATCH (j)-[:POSTED_BY|OFFERED_BY]->(employer:Company)
            OPTIONAL MATCH (c)-[:HAS_SKILL]->(own:Skill)<-[:REQUIRES_SKILL]-(j)
            WITH j, employer,
                 collect(DISTINCT s.name) AS colleagueSkills,
                 collect(DISTINCT own.name) AS matchedSkills,
                 count(DISTINCT peer) AS colleagueCount
            OPTIONAL MATCH (j)-[:REQUIRES_SKILL]->(req:Skill)
            RETURN j, employer AS company, matchedSkills, collect(DISTINCT req.name) AS requiredSkills,
                   colleagueSkills, colleagueCount
            ORDER BY colleagueCount DESC, size(matchedSkills) DESC
            """;

    private final Neo4jClient client;

    public RecommendationRepository(Neo4jClient client) {
        this.client = client;
    }

    public List<RecommendedJob> findSkillBasedRecommendations(Long candidateId) {
        return client.read(SKILL_BASED, Map.of("candidateId", candidateId)).stream()
                .map(record -> toRecommendedJob(record, false, "SKILL"))
                .toList();
    }

    public List<RecommendedJob> findCompanyBasedRecommendations(Long candidateId) {
        return client.read(COMPANY_BASED, Map.of("candidateId", candidateId)).stream()
                .map(record -> toRecommendedJob(record, true, "COMPANY"))
                .toList();
    }

    public List<RecommendedJob> findColleagueNetworkRecommendations(Long candidateId) {
        return client.read(COLLEAGUE_NETWORK, Map.of("candidateId", candidateId)).stream()
                .map(record -> {
                    Job job = toJob(record.get("j").asNode());
                    Company company = record.get("company").isNull() ? null : toCompany(record.get("company").asNode());
                    return new RecommendedJob(
                            job,
                            company,
                            toStringList(record.get("matchedSkills")),
                            toStringList(record.get("requiredSkills")),
                            toStringList(record.get("colleagueSkills")),
                            record.get("colleagueCount").asInt(),
                            false,
                            "NETWORK"
                    );
                })
                .toList();
    }

    private RecommendedJob toRecommendedJob(Record record, boolean formerCompany, String source) {
        Job job = toJob(record.get("j").asNode());
        Company company = record.get("company").isNull() ? null : toCompany(record.get("company").asNode());
        return new RecommendedJob(
                job,
                company,
                toStringList(record.get("matchedSkills")),
                toStringList(record.get("requiredSkills")),
                List.of(),
                0,
                formerCompany,
                source
        );
    }
}
