
export interface Schedule {
  id: string;
  companyId: string;
  customerId: string;
  vehicleId: string;
  employeeId?: string;
  serviceId: string;
  date: string;
  hour: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'canceled';
  notes?: string;
  createdAt: Date | string;
}
