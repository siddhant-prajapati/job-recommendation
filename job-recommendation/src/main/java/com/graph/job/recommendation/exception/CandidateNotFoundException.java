package com.graph.job.recommendation.exception;

public class CandidateNotFoundException extends RuntimeException {

    public CandidateNotFoundException(Long id) {
        super("Candidate with id " + id + " not found");
    }
}
