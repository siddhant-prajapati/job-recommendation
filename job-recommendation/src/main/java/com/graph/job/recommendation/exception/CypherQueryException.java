package com.graph.job.recommendation.exception;

public class CypherQueryException extends RuntimeException {

    public CypherQueryException(String message, Throwable cause) {
        super(message, cause);
    }
}
