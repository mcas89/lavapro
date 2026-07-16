const fs = require('fs');
const path = require('path');

const typesDir = path.join(__dirname, 'src', 'types');
if (!fs.existsSync(typesDir)) {
  fs.mkdirSync(typesDir, { recursive: true });
}

// customer.ts
fs.writeFileSync(path.join(typesDir, 'customer.ts'), `
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
`);

// vehicle.ts
fs.writeFileSync(path.join(typesDir, 'vehicle.ts'), `
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
`);

// schedule.ts
fs.writeFileSync(path.join(typesDir, 'schedule.ts'), `
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
`);

// employee.ts
fs.writeFileSync(path.join(typesDir, 'employee.ts'), `
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
`);

// finance.ts
fs.writeFileSync(path.join(typesDir, 'finance.ts'), `
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
`);

console.log('Types created!');
