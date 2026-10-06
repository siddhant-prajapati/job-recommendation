UNWIND [
  {candidateId: 1, skillIds: [1, 2, 3, 7, 17, 18, 21, 22]},
  {candidateId: 2, skillIds: [10, 12, 13, 18, 28, 22]},
  {candidateId: 3, skillIds: [14, 15, 16, 26, 27, 9]},
  {candidateId: 4, skillIds: [7, 8, 9, 23, 24, 25]},
  {candidateId: 5, skillIds: [1, 2, 10, 12, 17, 18]},
  {candidateId: 6, skillIds: [14, 16, 27, 5, 9, 3]},
  {candidateId: 7, skillIds: [29, 7, 3, 18, 22]},
  {candidateId: 8, skillIds: [1, 2, 5, 6, 17, 31]},
  {candidateId: 9, skillIds: [10, 11, 12, 19, 28]},
  {candidateId: 10, skillIds: [1, 2, 3, 4, 21, 18]},
  {candidateId: 11, skillIds: [10, 12, 28, 22, 32]},
  {candidateId: 12, skillIds: [1, 2, 5, 8, 9, 17, 31]},
  {candidateId: 13, skillIds: [14, 15, 26, 16, 40]},
  {candidateId: 14, skillIds: [7, 8, 9, 25, 23, 30]},
  {candidateId: 15, skillIds: [1, 2, 3, 18, 20]},
  {candidateId: 16, skillIds: [1, 2, 17, 31, 5, 8, 9]},
  {candidateId: 17, skillIds: [10, 12, 13, 19]},
  {candidateId: 18, skillIds: [14, 27, 5, 9, 16, 30]},
  {candidateId: 19, skillIds: [11, 12, 10, 18]},
  {candidateId: 20, skillIds: [1, 2, 7, 8, 9, 23]},
  {candidateId: 21, skillIds: [1, 2, 3, 5, 6, 20]},
  {candidateId: 22, skillIds: [10, 12, 28, 19, 18]},
  {candidateId: 23, skillIds: [7, 8, 24, 9, 25, 23]},
  {candidateId: 24, skillIds: [14, 13, 12, 4, 18]},
  {candidateId: 25, skillIds: [1, 2, 5, 33, 17, 6]},
  {candidateId: 26, skillIds: [37, 14, 3, 18, 38]},
  {candidateId: 27, skillIds: [10, 36, 12, 28, 18]},
  {candidateId: 28, skillIds: [14, 39, 27, 35, 16]},
  {candidateId: 29, skillIds: [34, 7, 8, 23, 24]},
  {candidateId: 30, skillIds: [1, 2, 18, 22, 32]},
  {candidateId: 31, skillIds: [1, 2, 10, 19, 17, 31]},
  {candidateId: 32, skillIds: [14, 38, 15, 26, 40]},
  {candidateId: 33, skillIds: [13, 12, 4, 19, 18]},
  {candidateId: 34, skillIds: [1, 2, 8, 9, 17, 31, 5]},
  {candidateId: 35, skillIds: [10, 12, 22, 32, 18]},
  {candidateId: 36, skillIds: [14, 37, 39, 16, 9]}
] AS row
MATCH (c:Candidate {id: row.candidateId})
UNWIND row.skillIds AS skillId
MATCH (s:Skill {id: skillId})
MERGE (c)-[:HAS_SKILL]->(s);

UNWIND [
  {candidateId: 1, companyIds: [1]},
  {candidateId: 2, companyIds: [2]},
  {candidateId: 3, companyIds: [5]},
  {candidateId: 4, companyIds: [1, 3]},
  {candidateId: 5, companyIds: [1, 4]},
  {candidateId: 6, companyIds: [8]},
  {candidateId: 7, companyIds: [11]},
  {candidateId: 8, companyIds: [12, 5]},
  {candidateId: 9, companyIds: [2]},
  {candidateId: 10, companyIds: [3]},
  {candidateId: 11, companyIds: [6]},
  {candidateId: 12, companyIds: [6, 5]},
  {candidateId: 13, companyIds: [4]},
  {candidateId: 14, companyIds: [3]},
  {candidateId: 15, companyIds: [1]},
  {candidateId: 16, companyIds: [7]},
  {candidateId: 17, companyIds: [9]},
  {candidateId: 18, companyIds: [8]},
  {candidateId: 19, companyIds: [11]},
  {candidateId: 20, companyIds: [7]},
  {candidateId: 21, companyIds: [10, 1]},
  {candidateId: 22, companyIds: [9]},
  {candidateId: 23, companyIds: [4]},
  {candidateId: 24, companyIds: [10]},
  {candidateId: 25, companyIds: [12, 14]},
  {candidateId: 26, companyIds: [11, 13]},
  {candidateId: 27, companyIds: [2, 9]},
  {candidateId: 28, companyIds: [5, 8]},
  {candidateId: 29, companyIds: [16, 7]},
  {candidateId: 30, companyIds: [1, 15]},
  {candidateId: 31, companyIds: [4, 10]},
  {candidateId: 32, companyIds: [5, 6]},
  {candidateId: 33, companyIds: [13]},
  {candidateId: 34, companyIds: [6, 16]},
  {candidateId: 35, companyIds: [2, 15]},
  {candidateId: 36, companyIds: [8, 3]}
] AS row
MATCH (c:Candidate {id: row.candidateId})
UNWIND row.companyIds AS companyId
MATCH (co:Company {id: companyId})
MERGE (c)-[:WORKED_AT]->(co);

MATCH (j:Job)-[old:OFFERED_BY]->(co:Company)
MERGE (j)-[:POSTED_BY]->(co);
