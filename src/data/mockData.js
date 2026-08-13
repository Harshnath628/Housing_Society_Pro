export const initialBuildings = [
  { id: 1, name: 'Tower A', floors: 10, totalFlats: 40, yearBuilt: 2018 },
  { id: 2, name: 'Tower B', floors: 8, totalFlats: 32, yearBuilt: 2019 },
  { id: 3, name: 'Tower C', floors: 12, totalFlats: 48, yearBuilt: 2020 },
];

export const initialFlats = [
  { id: 1, buildingId: 1, flatNumber: 'A-101', floor: 1, type: '2BHK', area: 950, ownerName: 'Rahul Sharma', ownerMobile: '9876543210' },
  { id: 2, buildingId: 1, flatNumber: 'A-102', floor: 1, type: '3BHK', area: 1200, ownerName: 'Priya Patel', ownerMobile: '9876543211' },
  { id: 3, buildingId: 1, flatNumber: 'A-201', floor: 2, type: '2BHK', area: 950, ownerName: 'Amit Kumar', ownerMobile: '9876543212' },
  { id: 4, buildingId: 1, flatNumber: 'A-202', floor: 2, type: '3BHK', area: 1200, ownerName: '', ownerMobile: '' },
  { id: 5, buildingId: 2, flatNumber: 'B-101', floor: 1, type: '2BHK', area: 900, ownerName: 'Sneha Gupta', ownerMobile: '9876543213' },
  { id: 6, buildingId: 2, flatNumber: 'B-102', floor: 1, type: '1BHK', area: 650, ownerName: 'Vikram Singh', ownerMobile: '9876543214' },
  { id: 7, buildingId: 2, flatNumber: 'B-201', floor: 2, type: '2BHK', area: 900, ownerName: '', ownerMobile: '' },
  { id: 8, buildingId: 3, flatNumber: 'C-101', floor: 1, type: '3BHK', area: 1350, ownerName: 'Anjali Reddy', ownerMobile: '9876543215' },
  { id: 9, buildingId: 3, flatNumber: 'C-102', floor: 1, type: '2BHK', area: 1000, ownerName: 'Karan Mehta', ownerMobile: '9876543216' },
  { id: 10, buildingId: 3, flatNumber: 'C-201', floor: 2, type: '2BHK', area: 1000, ownerName: '', ownerMobile: '' },
];

export const initialResidents = [
  { id: 1, flatId: 1, name: 'Rahul Sharma', phone: '9876543210', email: 'rahul@email.com', type: 'Owner', moveInDate: '2019-01-15' },
  { id: 2, flatId: 2, name: 'Priya Patel', phone: '9876543211', email: 'priya@email.com', type: 'Owner', moveInDate: '2019-03-20' },
  { id: 3, flatId: 3, name: 'Amit Kumar', phone: '9876543212', email: 'amit@email.com', type: 'Owner', moveInDate: '2019-06-10' },
  { id: 4, flatId: 5, name: 'Sneha Gupta', phone: '9876543213', email: 'sneha@email.com', type: 'Owner', moveInDate: '2020-02-01' },
  { id: 5, flatId: 6, name: 'Ravi Tenant', phone: '9876543220', email: 'ravi@email.com', type: 'Tenant', moveInDate: '2023-04-01' },
  { id: 6, flatId: 8, name: 'Anjali Reddy', phone: '9876543215', email: 'anjali@email.com', type: 'Owner', moveInDate: '2020-08-15' },
  { id: 7, flatId: 9, name: 'Karan Mehta', phone: '9876543216', email: 'karan@email.com', type: 'Tenant', moveInDate: '2024-01-01' },
];

export const initialBills = [
  { id: 1, flatId: 1, month: '2025-06', amount: 4750, pendingDues: 0, totalDue: 4750, status: 'Paid', generatedAt: '2025-06-01' },
  { id: 2, flatId: 2, month: '2025-06', amount: 6000, pendingDues: 0, totalDue: 6000, status: 'Paid', generatedAt: '2025-06-01' },
  { id: 3, flatId: 3, month: '2025-06', amount: 4750, pendingDues: 0, totalDue: 4750, status: 'Pending', generatedAt: '2025-06-01' },
  { id: 4, flatId: 5, month: '2025-06', amount: 4500, pendingDues: 0, totalDue: 4500, status: 'Paid', generatedAt: '2025-06-01' },
  { id: 5, flatId: 6, month: '2025-06', amount: 3250, pendingDues: 0, totalDue: 3250, status: 'Pending', generatedAt: '2025-06-01' },
  { id: 6, flatId: 8, month: '2025-06', amount: 6750, pendingDues: 0, totalDue: 6750, status: 'Paid', generatedAt: '2025-06-01' },
  { id: 7, flatId: 9, month: '2025-06', amount: 5000, pendingDues: 0, totalDue: 5000, status: 'Partial', generatedAt: '2025-06-01' },
  { id: 8, flatId: 1, month: '2025-07', amount: 4750, pendingDues: 0, totalDue: 4750, status: 'Paid', generatedAt: '2025-07-01' },
  { id: 9, flatId: 2, month: '2025-07', amount: 6000, pendingDues: 0, totalDue: 6000, status: 'Pending', generatedAt: '2025-07-01' },
  { id: 10, flatId: 3, month: '2025-07', amount: 4750, pendingDues: 4750, totalDue: 9500, status: 'Pending', generatedAt: '2025-07-01' },
  { id: 11, flatId: 5, month: '2025-07', amount: 4500, pendingDues: 0, totalDue: 4500, status: 'Pending', generatedAt: '2025-07-01' },
  { id: 12, flatId: 6, month: '2025-07', amount: 3250, pendingDues: 3250, totalDue: 6500, status: 'Pending', generatedAt: '2025-07-01' },
  { id: 13, flatId: 8, month: '2025-07', amount: 6750, pendingDues: 0, totalDue: 6750, status: 'Pending', generatedAt: '2025-07-01' },
  { id: 14, flatId: 9, month: '2025-07', amount: 5000, pendingDues: 2000, totalDue: 7000, status: 'Pending', generatedAt: '2025-07-01' },
];

export const initialPayments = [
  { id: 1, billId: 1, flatId: 1, amount: 4750, mode: 'UPI', reference: 'UPI-2025060112345', date: '2025-06-05', receivedBy: 'Admin' },
  { id: 2, billId: 2, flatId: 2, amount: 6000, mode: 'Bank Transfer', reference: 'NEFT-20250602ABC', date: '2025-06-08', receivedBy: 'Admin' },
  { id: 3, billId: 4, flatId: 5, amount: 4500, mode: 'Cash', reference: 'CASH-20250604', date: '2025-06-10', receivedBy: 'Admin' },
  { id: 4, billId: 6, flatId: 8, amount: 6750, mode: 'Cheque', reference: 'CHQ-00456789', date: '2025-06-12', receivedBy: 'Admin' },
  { id: 5, billId: 7, flatId: 9, amount: 3000, mode: 'UPI', reference: 'UPI-2025060678', date: '2025-06-15', receivedBy: 'Admin' },
  { id: 6, billId: 8, flatId: 1, amount: 4750, mode: 'UPI', reference: 'UPI-2025070112345', date: '2025-07-03', receivedBy: 'Admin' },
];

export const initialExpenses = [
  { id: 1, category: 'Security', description: 'Security guard salary - June', amount: 25000, date: '2025-06-30', paidTo: 'SecureGuard Services' },
  { id: 2, category: 'Electricity', description: 'Common area electricity bill', amount: 18500, date: '2025-06-28', paidTo: 'State Electricity Board' },
  { id: 3, category: 'Cleaning', description: 'Housekeeping staff salary', amount: 15000, date: '2025-06-30', paidTo: 'CleanPro Services' },
  { id: 4, category: 'Lift Maintenance', description: 'Quarterly lift servicing', amount: 12000, date: '2025-06-15', paidTo: 'Otis Elevators' },
  { id: 5, category: 'Garden', description: 'Garden maintenance and plants', amount: 5000, date: '2025-06-20', paidTo: 'GreenScape' },
  { id: 6, category: 'Repairs', description: 'Water pump motor repair', amount: 8500, date: '2025-06-22', paidTo: 'MotorFix Enterprises' },
  { id: 7, category: 'Security', description: 'Security guard salary - July', amount: 25000, date: '2025-07-30', paidTo: 'SecureGuard Services' },
  { id: 8, category: 'Electricity', description: 'Common area electricity bill', amount: 19200, date: '2025-07-28', paidTo: 'State Electricity Board' },
];

export const initialNotices = [
  { id: 1, title: 'Annual General Meeting', content: 'The AGM is scheduled for Aug 15, 2025 at 6 PM in the community hall. All residents are requested to attend.', priority: 'High', date: '2025-07-25', author: 'Secretary' },
  { id: 2, title: 'Water Tank Cleaning', content: 'Water supply will be interrupted on Aug 5 from 9 AM to 2 PM for tank cleaning.', priority: 'Normal', date: '2025-07-28', author: 'Admin' },
  { id: 3, title: 'Parking Rule Update', content: 'Please park only in designated spots. Visitor parking is available in basement B2.', priority: 'Low', date: '2025-07-20', author: 'Admin' },
];

export const EXPENSE_CATEGORIES = ['Security', 'Electricity', 'Cleaning', 'Lift Maintenance', 'Garden', 'Repairs', 'Water', 'Insurance', 'Admin', 'Other'];
export const MAINTENANCE_RATE_PER_SQFT = 5;
