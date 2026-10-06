package com.graph.job.recommendation.mapper;

import com.graph.job.recommendation.model.Candidate;
import com.graph.job.recommendation.model.Company;
import com.graph.job.recommendation.model.Job;
import com.graph.job.recommendation.model.Location;
import com.graph.job.recommendation.model.Skill;
import org.neo4j.driver.Value;
import org.neo4j.driver.types.Node;

import java.util.List;
import java.util.Objects;

public final class GraphNodeMapper {

    private GraphNodeMapper() {
    }

    public static Candidate toCandidate(Node node) {
        return new Candidate(
                asLong(node, "id"),
                asString(node, "name"),
                asInteger(node, "experienceYears"),
                asString(node, "location")
        );
    }

    public static Skill toSkill(Node node) {
        return new Skill(asLong(node, "id"), asString(node, "name"));
    }

    public static Location toLocation(Node node) {
        return new Location(asLong(node, "id"), asString(node, "name"));
    }

    public static Company toCompany(Node node) {
        return new Company(asLong(node, "id"), asString(node, "name"));
    }

    public static Job toJob(Node node) {
        return new Job(
                asLong(node, "id"),
                asString(node, "title"),
                asString(node, "location"),
                asInteger(node, "minExperienceYears"),
                asDouble(node, "salary"),
                asString(node, "employmentType")
        );
    }

    public static List<Skill> toSkills(Value value) {
        return value.asList(item -> item.isNull() ? null : toSkill(item.asNode()))
                .stream()
                .filter(Objects::nonNull)
                .toList();
    }

    public static List<Company> toCompanies(Value value) {
        return value.asList(item -> item.isNull() ? null : toCompany(item.asNode()))
                .stream()
                .filter(Objects::nonNull)
                .toList();
    }

    public static List<String> toStringList(Value value) {
        return value.asList(item -> item.isNull() ? null : item.asString())
                .stream()
                .filter(Objects::nonNull)
                .toList();
    }

    private static Long asLong(Node node, String key) {
        Value value = node.get(key);
        return value.isNull() ? null : value.asNumber().longValue();
    }

    private static Integer asInteger(Node node, String key) {
        Value value = node.get(key);
        return value.isNull() ? null : value.asNumber().intValue();
    }

    private static Double asDouble(Node node, String key) {
        Value value = node.get(key);
        return value.isNull() ? null : value.asNumber().doubleValue();
    }

    private static String asString(Node node, String key) {
        Value value = node.get(key);
        return value.isNull() ? null : value.asString();
    }
}
