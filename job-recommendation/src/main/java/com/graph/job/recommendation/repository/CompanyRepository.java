package com.graph.job.recommendation.repository;

import com.graph.job.recommendation.model.Company;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static com.graph.job.recommendation.mapper.GraphNodeMapper.toCompany;

@Repository
public class CompanyRepository {

    private static final String FIND_ALL = """
            MATCH (co:Company)
            RETURN co
            ORDER BY co.name
            """;

    private static final String FIND_BY_ID = """
            MATCH (co:Company {id: $id})
            RETURN co
            """;

    private final Neo4jClient client;

    public CompanyRepository(Neo4jClient client) {
        this.client = client;
    }

    public List<Company> findAll() {
        return client.read(FIND_ALL, Map.of()).stream()
                .map(record -> toCompany(record.get("co").asNode()))
                .toList();
    }

    public Optional<Company> findById(Long id) {
        return client.read(FIND_BY_ID, Map.of("id", id)).stream()
                .findFirst()
                .map(record -> toCompany(record.get("co").asNode()));
    }
}
