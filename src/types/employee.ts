
export interface Employee {
  id: string;
  companyId: string;
  name: string;
  phone?: string;
  role: string;
  commission: number;
  active: boolean;
  createdAt: Date | string;
}
