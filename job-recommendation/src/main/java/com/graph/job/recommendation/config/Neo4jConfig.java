package com.graph.job.recommendation.config;

import org.neo4j.driver.AuthToken;
import org.neo4j.driver.AuthTokens;
import org.neo4j.driver.Config;
import org.neo4j.driver.Driver;
import org.neo4j.driver.GraphDatabase;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

@Configuration
@EnableConfigurationProperties(CognoDbProperties.class)
public class Neo4jConfig {

    private static final Logger log = LoggerFactory.getLogger(Neo4jConfig.class);

    @Bean(destroyMethod = "close")
    public Driver neo4jDriver(CognoDbProperties properties) {
        if (properties.uri() == null || properties.uri().isBlank()) {
            throw new IllegalStateException("COGNODB_URI must be set, for example bolt+s://<instance-id>.databases.cognodb.cloud");
        }
        if (properties.password() == null || properties.password().isBlank()) {
            throw new IllegalStateException("COGNODB_PASSWORD must be set from the environment and must not be committed to Git");
        }

        Config config = Config.builder()
                .withConnectionTimeout(15, TimeUnit.SECONDS)
                .withMaxConnectionPoolSize(10)
                .build();

        AuthToken auth = AuthTokens.basic(properties.username(), properties.password());
        String uri = properties.uri();
        Driver driver = GraphDatabase.driver(uri, auth, config);

        if (uri.contains("cognodb") && uri.startsWith("bolt+s://")) {
            try {
                driver.verifyConnectivity();
            } catch (Exception firstAttempt) {
                log.warn("bolt+s connection to CognoDB failed ({}). Retrying with bolt+ssc://", firstAttempt.getMessage());
                driver.close();
                driver = GraphDatabase.driver(uri.replace("bolt+s://", "bolt+ssc://"), auth, config);
            }
        }

        return driver;
    }
}
