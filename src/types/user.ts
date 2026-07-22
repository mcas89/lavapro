export interface User {
  id: string;
  planExpiration?: string; // ISO date string
  planId?: string; // identifier of current plan
}
