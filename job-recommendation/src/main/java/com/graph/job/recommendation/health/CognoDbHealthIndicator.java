package com.graph.job.recommendation.health;

import org.neo4j.driver.Driver;
import org.springframework.boot.health.contributor.Health;
import org.springframework.boot.health.contributor.HealthIndicator;
import org.springframework.stereotype.Component;

@Component
public class CognoDbHealthIndicator implements HealthIndicator {

    private final Driver driver;

    public CognoDbHealthIndicator(Driver driver) {
        this.driver = driver;
    }

    @Override
    public Health health() {
        try {
            driver.verifyConnectivity();
            return Health.up()
                    .withDetail("database", "CognoDB")
                    .withDetail("driver", "official-neo4j-java-driver")
                    .build();
        } catch (Exception ex) {
            return Health.down(ex)
                    .withDetail("database", "CognoDB")
                    .build();
        }
    }
}
