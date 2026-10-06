package com.graph.job.recommendation.repository;

import com.graph.job.recommendation.model.Skill;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static com.graph.job.recommendation.mapper.GraphNodeMapper.toSkill;

@Repository
public class SkillRepository {

    private static final String FIND_ALL = """
            MATCH (s:Skill)
            RETURN s
            ORDER BY s.name
            """;

    private static final String FIND_BY_ID = """
            MATCH (s:Skill {id: $id})
            RETURN s
            """;

    private final Neo4jClient client;

    public SkillRepository(Neo4jClient client) {
        this.client = client;
    }

    public List<Skill> findAll() {
        return client.read(FIND_ALL, Map.of()).stream()
                .map(record -> toSkill(record.get("s").asNode()))
                .toList();
    }

    public Optional<Skill> findById(Long id) {
        return client.read(FIND_BY_ID, Map.of("id", id)).stream()
                .findFirst()
                .map(record -> toSkill(record.get("s").asNode()));
    }
}
