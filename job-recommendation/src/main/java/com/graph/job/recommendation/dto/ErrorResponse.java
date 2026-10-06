package com.graph.job.recommendation.dto;

import java.time.Instant;

public record ErrorResponse(
        boolean success,
        String message,
        Instant timestamp,
        int status,
        String error,
        String path
) {
}
