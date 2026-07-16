
export interface Customer {
  id: string;
  companyId: string;
  name: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  birthday?: string;
  address?: string;
  notes?: string;
  lastVisit?: Date | string;
  nextReminder?: Date | string;
  totalSpent: number;
  visits: number;
  status: 'new' | 'frequent' | 'vip' | 'inactive';
  createdAt: Date | string;
  updatedAt: Date | string;
}
