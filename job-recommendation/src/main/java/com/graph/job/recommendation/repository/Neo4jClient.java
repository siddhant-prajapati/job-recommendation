package com.graph.job.recommendation.repository;

import com.graph.job.recommendation.config.CognoDbProperties;
import com.graph.job.recommendation.exception.CognoDbConnectionException;
import com.graph.job.recommendation.exception.CypherQueryException;
import org.neo4j.driver.Driver;
import org.neo4j.driver.QueryConfig;
import org.neo4j.driver.Record;
import org.neo4j.driver.RoutingControl;
import org.neo4j.driver.exceptions.ClientException;
import org.neo4j.driver.exceptions.SecurityException;
import org.neo4j.driver.exceptions.ServiceUnavailableException;
import org.neo4j.driver.exceptions.SessionExpiredException;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class Neo4jClient {

    private final Driver driver;
    private final String database;

    public Neo4jClient(Driver driver, CognoDbProperties properties) {
        this.driver = driver;
        this.database = properties.database();
    }

    public List<Record> read(String cypher, Map<String, Object> parameters) {
        return execute(cypher, parameters, RoutingControl.READ);
    }

    public List<Record> write(String cypher, Map<String, Object> parameters) {
        return execute(cypher, parameters, RoutingControl.WRITE);
    }

    private List<Record> execute(String cypher, Map<String, Object> parameters, RoutingControl routing) {
        try {
            var query = driver.executableQuery(cypher)
                    .withParameters(parameters == null ? Map.of() : parameters);
            var config = QueryConfig.builder().withRouting(routing);
            if (database != null && !database.isBlank()) {
                config.withDatabase(database);
            }
            return query.withConfig(config.build()).execute().records();
        } catch (SecurityException ex) {
            throw new CognoDbConnectionException(ex);
        } catch (ServiceUnavailableException | SessionExpiredException ex) {
            throw new CognoDbConnectionException(ex);
        } catch (ClientException ex) {
            throw new CypherQueryException("The graph query could not be executed", ex);
        }
    }
}
