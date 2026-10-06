package com.graph.job.recommendation.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "cognodb")
public record CognoDbProperties(
        String uri,
        String username,
        String password,
        String database,
        boolean seed,
        boolean seedAndExit
) {
}
