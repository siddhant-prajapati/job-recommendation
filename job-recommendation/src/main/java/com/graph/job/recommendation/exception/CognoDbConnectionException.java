package com.graph.job.recommendation.exception;

public class CognoDbConnectionException extends RuntimeException {

    public CognoDbConnectionException(String message, Throwable cause) {
        super(message, cause);
    }

    public CognoDbConnectionException(Throwable cause) {
        super("Unable to connect to database", cause);
    }
}
