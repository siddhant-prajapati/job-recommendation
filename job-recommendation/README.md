# Job Recommendation Backend

Spring Boot API that recommends jobs from a **CognoDB** graph using the **official Neo4j Java Driver** and parameterized Cypher.

Connection details come from environment variables and are never committed.

```text
COGNODB_URI=bolt+s://<instance-id>.databases.cognodb.cloud
COGNODB_USERNAME=cognodb
COGNODB_PASSWORD=...
COGNODB_DATABASE=neo4j
```

Copy `.env.example` locally. Do not put real passwords in Git.

## Why use a graph database over a relational database

A job recommendation system is a **relationship problem**, not a table-lookup problem. The useful questions are not “give me all jobs,” but “which jobs are connected to this candidate through skills, companies, colleagues, and locations?”

### Why graphs fit recommendations

In a relational database, candidates, jobs, skills, and companies live in separate tables. Connecting them means join tables (`candidate_skills`, `job_skills`, `candidate_companies`) and SQL joins. That works for one hop. It gets expensive and hard to read as soon as the path grows:

- Candidate → skills → jobs that require those skills (2 hops)
- Candidate → former companies → jobs posted by those companies (2 hops)
- Candidate → colleagues at the same companies → their skills → jobs those skills unlock (4+ hops)

Each extra hop in SQL is another self-join, another many-to-many table, and another aggregation. Ranking “how many shared skills” or “how many colleagues connect you to this job” becomes a nest of `GROUP BY` queries that are slow to write and slow to change.

A graph database stores those links as **first-class relationships**. Traversing `HAS_SKILL` or `WORKED_AT` is the natural operation, not an afterthought. Adding a new signal (same location, same company, peer skills) is a new path in Cypher, not a new join table and migration.

For recommendations specifically, the product question is “what is nearby in the network?” Graphs answer that directly. Relational schemas answer “what rows match these foreign keys?” and then you assemble the network yourself.

### How this project uses the graph

This backend does not treat CognoDB as a generic store for CRUD rows. The recommendation API walks the graph and then scores the connected jobs in the service layer.

| Recommendation signal | Graph path | Why a graph helps |
|---|---|---|
| Skill match | `Candidate -HAS_SKILL-> Skill <-REQUIRES_SKILL- Job` | One 2-hop traversal finds jobs that share skills and counts matched skills. In SQL this is two many-to-many joins plus grouping. |
| Former employer | `Candidate -WORKED_AT-> Company <-POSTED_BY- Job` | Jobs at companies the candidate already knows, without a separate employment-join query. |
| Related jobs | `Job -REQUIRES_SKILL-> Skill <-REQUIRES_SKILL- Job` | “Jobs like this one” is a walk through shared skills, not a tag-table self-join. |
| Colleague network | `Candidate -WORKED_AT-> Company <-WORKED_AT- Peer -HAS_SKILL-> Skill <-REQUIRES_SKILL- Job` | The query that is awkward in a relational model: peers from shared companies, their skills, and jobs those skills unlock, even at other employers. |

That last query is the reason this project is a graph app. In SQL you would self-join employment, join peer skills, join job requirements, join employers, then aggregate peer counts and skill lists. In Cypher it is one traversal of typed relationships.

The Spring service then applies business scoring (skills, experience, location, former-company bonus, colleague bonus). The graph finds **who is connected**; the service decides **how strong the match is**.

## Graph data model

```text
(:Candidate)-[:HAS_SKILL]->(:Skill)<-[:REQUIRES_SKILL]-(:Job)
(:Candidate)-[:WORKED_AT]->(:Company)<-[:POSTED_BY]-(:Job)
(:Candidate)-[:LIVES_IN]->(:Location)<-[:LOCATED_IN]-(:Job)
```

```text
 ┌────────────┐     HAS_SKILL      ┌─────────┐     REQUIRES_SKILL     ┌─────────┐
 │ Candidate  │ ─────────────────► │  Skill  │ ◄───────────────────── │   Job   │
 └─────┬──────┘                    └─────────┘                        └────┬────┘
       │                                                                   │
       │ WORKED_AT                                                    POSTED_BY
       ▼                                                                   ▼
 ┌────────────┐                                                    ┌────────────┐
 │  Company   │ ◄───────────────────────────────────────────────── │  Company   │
 └────────────┘                                                    └────────────┘
       │                                                                   │
       │ LIVES_IN                                                     LOCATED_IN
       ▼                                                                   ▼
 ┌────────────┐                                                    ┌────────────┐
 │  Location  │                                                    │  Location  │
 └────────────┘                                                    └────────────┘
```

### Node properties

| Label | Properties |
|---|---|
| Candidate | `id`, `name`, `experienceYears`, `location` |
| Job | `id`, `title`, `location`, `minExperienceYears`, `salary`, `employmentType` |
| Skill | `id`, `name` |
| Company | `id`, `name` |
| Location | `id`, `name` |

### Relationship types

| Relationship | From | To |
|---|---|---|
| `HAS_SKILL` | Candidate | Skill |
| `WORKED_AT` | Candidate | Company |
| `LIVES_IN` | Candidate | Location |
| `REQUIRES_SKILL` | Job | Skill |
| `POSTED_BY` | Job | Company |
| `LOCATED_IN` | Job | Location |

## Seed data

Realistic data lives in `seed/`:

```text
seed/
 ├── 00-schema.cypher
 ├── 01-skills.cypher
 ├── 02-companies.cypher
 ├── 03-locations.cypher
 ├── 04-candidates.cypher
 ├── 05-jobs.cypher
 └── 06-relationships.cypher
```

Counts: 36 candidates, 40 skills, 16 companies, 9 locations, 75 jobs.

Load into CognoDB with:

```text
--cognodb.seed=true
```

## Cypher queries

All application Cypher is parameterized (`$candidateId`, `$id`, `$title` is never concatenated).

1. **Basic:** `MATCH (j:Job) RETURN j` via `GET /api/jobs`
2. **2+ hop traversal:** `Candidate -HAS_SKILL-> Skill <-REQUIRES_SKILL- Job`
3. **Awkward in SQL:** colleagues from shared companies connected through skills to jobs at other employers

## API

| Method | Path |
|---|---|
| GET | `/api/jobs` |
| GET | `/api/jobs/{id}` |
| GET | `/api/jobs/recommendations?candidateId={id}` |
| GET | `/api/jobs/{id}/related` |
| GET | `/api/skills` |
| GET | `/api/companies` |
| GET | `/api/locations` |
| GET | `/api/candidates` |
| GET | `/api/candidates/{id}` |
| GET | `/api/candidates/{id}/recommendations` |
| GET | `/actuator/health` |

If CognoDB is unreachable the API returns:

```json
{
  "success": false,
  "message": "Unable to connect to database"
}
```

## Architecture

```text
Controller → Service → Repository / Cypher → Official Neo4j Java Driver → CognoDB
```
