package com.graph.job.recommendation.repository;

import com.graph.job.recommendation.model.Location;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

import static com.graph.job.recommendation.mapper.GraphNodeMapper.toLocation;

@Repository
public class LocationRepository {

    private static final String FIND_ALL = """
            MATCH (loc:Location)
            RETURN loc
            ORDER BY loc.name
            """;

    private final Neo4jClient client;

    public LocationRepository(Neo4jClient client) {
        this.client = client;
    }

    public List<Location> findAll() {
        return client.read(FIND_ALL, Map.of()).stream()
                .map(record -> toLocation(record.get("loc").asNode()))
                .toList();
    }
}
