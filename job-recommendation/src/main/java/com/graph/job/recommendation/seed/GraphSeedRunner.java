package com.graph.job.recommendation.seed;

import com.graph.job.recommendation.config.CognoDbProperties;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(1)
@ConditionalOnProperty(name = "cognodb.seed", havingValue = "true")
public class GraphSeedRunner implements ApplicationRunner {

    private final GraphSeedService graphSeedService;
    private final CognoDbProperties properties;
    private final ConfigurableApplicationContext context;

    public GraphSeedRunner(
            GraphSeedService graphSeedService,
            CognoDbProperties properties,
            ConfigurableApplicationContext context
    ) {
        this.graphSeedService = graphSeedService;
        this.properties = properties;
        this.context = context;
    }

    @Override
    public void run(ApplicationArguments args) {
        graphSeedService.seed();
        if (properties.seedAndExit()) {
            int exitCode = SpringApplication.exit(context, () -> 0);
            System.exit(exitCode);
        }
    }
}
