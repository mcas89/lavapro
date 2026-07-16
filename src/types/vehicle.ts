
export interface Vehicle {
  id: string;
  companyId: string;
  customerId: string;
  plate: string;
  brand: string;
  model: string;
  year?: string;
  color?: string;
  notes?: string;
  createdAt: Date | string;
}
