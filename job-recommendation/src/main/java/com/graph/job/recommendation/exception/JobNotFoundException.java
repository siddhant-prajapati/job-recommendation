package com.graph.job.recommendation.exception;

public class JobNotFoundException extends RuntimeException {

    public JobNotFoundException(Long id) {
        super("Job with id " + id + " not found");
    }
}
