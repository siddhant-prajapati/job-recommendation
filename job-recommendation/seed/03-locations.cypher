UNWIND [
  {id: 1, name: 'Bengaluru'},
  {id: 2, name: 'Pune'},
  {id: 3, name: 'Hyderabad'},
  {id: 4, name: 'Delhi'},
  {id: 5, name: 'Mumbai'},
  {id: 6, name: 'Chennai'},
  {id: 7, name: 'Remote'},
  {id: 8, name: 'Kolkata'},
  {id: 9, name: 'Noida'}
] AS row
MERGE (l:Location {id: row.id})
SET l.name = row.name;
