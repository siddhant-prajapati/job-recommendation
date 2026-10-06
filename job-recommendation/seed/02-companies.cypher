UNWIND [
  {id: 1, name: 'Infosys'},
  {id: 2, name: 'TCS'},
  {id: 3, name: 'Wipro'},
  {id: 4, name: 'Accenture'},
  {id: 5, name: 'Amazon'},
  {id: 6, name: 'Google'},
  {id: 7, name: 'Microsoft'},
  {id: 8, name: 'Flipkart'},
  {id: 9, name: 'Swiggy'},
  {id: 10, name: 'Razorpay'},
  {id: 11, name: 'Zoho'},
  {id: 12, name: 'PhonePe'},
  {id: 13, name: 'Freshworks'},
  {id: 14, name: 'Paytm'},
  {id: 15, name: 'Cognizant'},
  {id: 16, name: 'IBM'}
] AS row
MERGE (co:Company {id: row.id})
SET co.name = row.name;
