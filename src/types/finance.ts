
export interface Finance {
  id: string;
  companyId: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  value: number;
  date: Date | string;
  paymentMethod: 'cash' | 'credit' | 'debit' | 'pix' | 'bank_transfer';
  workOrderId?: string;
  createdAt: Date | string;
}
