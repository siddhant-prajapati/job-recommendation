package com.graph.job.recommendation.seed;

import com.graph.job.recommendation.config.CognoDbProperties;
import com.graph.job.recommendation.exception.CognoDbConnectionException;
import org.neo4j.driver.Driver;
import org.neo4j.driver.QueryConfig;
import org.neo4j.driver.Record;
import org.neo4j.driver.RoutingControl;
import org.neo4j.driver.exceptions.ClientException;
import org.neo4j.driver.exceptions.ServiceUnavailableException;
import org.neo4j.driver.exceptions.SessionExpiredException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

@Service
public class GraphSeedService {

    private static final Logger log = LoggerFactory.getLogger(GraphSeedService.class);

    private final Driver driver;
    private final CognoDbProperties properties;
    private final ResourceLoader resourceLoader;
    private volatile boolean useNamedDatabase = true;

    public GraphSeedService(Driver driver, CognoDbProperties properties, ResourceLoader resourceLoader) {
        this.driver = driver;
        this.properties = properties;
        this.resourceLoader = resourceLoader;
    }

    public SeedSummary seed() {
        List<String> statements = new ArrayList<>();
        for (String script : loadScripts()) {
            statements.addAll(parseStatements(script));
        }
        int executed = 0;
        int skipped = 0;

        for (String cypher : statements) {
            try {
                executeWrite(cypher);
                executed++;
                log.info("Seed statement completed: {}", preview(cypher));
            } catch (ClientException ex) {
                if (isSchemaStatement(cypher)) {
                    skipped++;
                    log.warn("Skipping unsupported CognoDB schema statement ({}): {}", ex.getMessage(), preview(cypher));
                } else {
                    throw ex;
                }
            }
        }

        SeedSummary summary = countGraph();
        log.info(
                "CognoDB seed complete. statementsExecuted={}, schemaSkipped={}, candidates={}, skills={}, companies={}, jobs={}, relationships={}",
                executed,
                skipped,
                summary.candidates(),
                summary.skills(),
                summary.companies(),
                summary.jobs(),
                summary.relationships()
        );
        return summary;
    }

    private SeedSummary countGraph() {
        Record record = executeRead("""
                OPTIONAL MATCH (c:Candidate)
                WITH count(c) AS candidates
                OPTIONAL MATCH (s:Skill)
                WITH candidates, count(s) AS skills
                OPTIONAL MATCH (co:Company)
                WITH candidates, skills, count(co) AS companies
                OPTIONAL MATCH (j:Job)
                WITH candidates, skills, companies, count(j) AS jobs
                OPTIONAL MATCH ()-[r]->()
                RETURN candidates, skills, companies, jobs, count(r) AS relationships
                """).getFirst();

        return new SeedSummary(
                record.get("candidates").asLong(),
                record.get("skills").asLong(),
                record.get("companies").asLong(),
                record.get("jobs").asLong(),
                record.get("relationships").asLong()
        );
    }

    private void executeWrite(String cypher) {
        try {
            driver.executableQuery(cypher)
                    .withConfig(queryConfig(RoutingControl.WRITE, useNamedDatabase))
                    .execute();
        } catch (ClientException ex) {
            if (useNamedDatabase && isUnknownDatabase(ex)) {
                log.warn("Database '{}' was not accepted by CognoDB. Retrying against the default database.", properties.database());
                useNamedDatabase = false;
                driver.executableQuery(cypher)
                        .withConfig(queryConfig(RoutingControl.WRITE, false))
                        .execute();
                return;
            }
            throw ex;
        } catch (ServiceUnavailableException | SessionExpiredException ex) {
            throw new CognoDbConnectionException("CognoDB is currently unavailable", ex);
        }
    }

    private List<Record> executeRead(String cypher) {
        try {
            return driver.executableQuery(cypher)
                    .withConfig(queryConfig(RoutingControl.READ, useNamedDatabase))
                    .execute()
                    .records();
        } catch (ServiceUnavailableException | SessionExpiredException ex) {
            throw new CognoDbConnectionException("CognoDB is currently unavailable", ex);
        }
    }

    private static boolean isUnknownDatabase(ClientException ex) {
        String message = ex.getMessage() == null ? "" : ex.getMessage().toLowerCase();
        return message.contains("database") && (message.contains("not found") || message.contains("does not exist") || message.contains("unknown"));
    }

    private QueryConfig queryConfig(RoutingControl routing, boolean includeDatabase) {
        var builder = QueryConfig.builder().withRouting(routing);
        if (includeDatabase && properties.database() != null && !properties.database().isBlank()) {
            builder.withDatabase(properties.database());
        }
        return builder.build();
    }

    private static final List<String> SEED_FILES = List.of(
            "00-schema.cypher",
            "01-skills.cypher",
            "02-companies.cypher",
            "03-locations.cypher",
            "04-candidates.cypher",
            "05-jobs.cypher",
            "06-relationships.cypher"
    );

    private List<String> loadScripts() {
        List<String> scripts = new ArrayList<>();
        for (String fileName : SEED_FILES) {
            scripts.add(readSeedFile(fileName));
        }
        return scripts;
    }

    private String readSeedFile(String fileName) {
        Path local = Path.of("seed", fileName);
        try {
            if (Files.exists(local)) {
                return stripBom(Files.readString(local, StandardCharsets.UTF_8));
            }
            Resource resource = resourceLoader.getResource("classpath:seed/" + fileName);
            try (var input = resource.getInputStream()) {
                return stripBom(new String(input.readAllBytes(), StandardCharsets.UTF_8));
            }
        } catch (IOException ex) {
            throw new IllegalStateException("Unable to load seed/" + fileName, ex);
        }
    }

    static List<String> parseStatements(String script) {
        String withoutBlockComments = script.replaceAll("/\\*[\\s\\S]*?\\*/", " ");
        String[] raw = withoutBlockComments.split(";");
        List<String> statements = new ArrayList<>();
        for (String piece : raw) {
            String statement = stripBom(piece).strip();
            if (!statement.isBlank()) {
                statements.add(statement);
            }
        }
        return statements;
    }

    private static String stripBom(String text) {
        if (text == null || text.isEmpty()) {
            return text;
        }
        return text.replace("\uFEFF", "");
    }

    private static boolean isSchemaStatement(String cypher) {
        String normalized = cypher.strip().toUpperCase();
        return normalized.startsWith("CREATE CONSTRAINT") || normalized.startsWith("CREATE INDEX");
    }

    private static String preview(String cypher) {
        String compact = cypher.replaceAll("\\s+", " ").strip();
        return compact.length() <= 80 ? compact : compact.substring(0, 77) + "...";
    }

    public record SeedSummary(long candidates, long skills, long companies, long jobs, long relationships) {
    }
}
