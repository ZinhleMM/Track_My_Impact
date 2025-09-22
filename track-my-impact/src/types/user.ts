/*
CM3070 Computer Science Final Project Track My Impact: Data Driven Waste Management
BSc Computer Science, Goldsmiths, University of London
CM3070 Final Project in Data Science (CM3050)
with Extended Features in Machine Learning and Neural Networks (CM3015) and Databases and Advanced Data Techniques (CM3010)
by
Zinhle Maurice-Mopp (210125870)
zm140@student.london.ac.uk

user.ts: Type definitions describing authenticated user profiles returned by the API.
*/
export interface UserProfile {
  id: string;
  username: string;
  email: string;
  full_name?: string | null;
  location?: string | null;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}
