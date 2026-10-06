/*
 * Graph schema for the job recommendation system.
 *
 * Nodes: Candidate, Job, Skill, Company, Location
 * Relationships:
 *   (:Candidate)-[:HAS_SKILL]->(:Skill)
 *   (:Candidate)-[:WORKED_AT]->(:Company)
 *   (:Candidate)-[:LIVES_IN]->(:Location)
 *   (:Job)-[:REQUIRES_SKILL]->(:Skill)
 *   (:Job)-[:POSTED_BY]->(:Company)
 *   (:Job)-[:LOCATED_IN]->(:Location)
 */

CREATE CONSTRAINT candidate_id IF NOT EXISTS FOR (c:Candidate) REQUIRE c.id IS UNIQUE;
CREATE CONSTRAINT skill_id IF NOT EXISTS FOR (s:Skill) REQUIRE s.id IS UNIQUE;
CREATE CONSTRAINT company_id IF NOT EXISTS FOR (co:Company) REQUIRE co.id IS UNIQUE;
CREATE CONSTRAINT job_id IF NOT EXISTS FOR (j:Job) REQUIRE j.id IS UNIQUE;
CREATE CONSTRAINT location_id IF NOT EXISTS FOR (l:Location) REQUIRE l.id IS UNIQUE;
CREATE CONSTRAINT location_name IF NOT EXISTS FOR (l:Location) REQUIRE l.name IS UNIQUE;

CREATE INDEX skill_name IF NOT EXISTS FOR (s:Skill) ON (s.name);
CREATE INDEX candidate_location IF NOT EXISTS FOR (c:Candidate) ON (c.location);
CREATE INDEX job_location IF NOT EXISTS FOR (j:Job) ON (j.location);
CREATE INDEX job_title IF NOT EXISTS FOR (j:Job) ON (j.title);
