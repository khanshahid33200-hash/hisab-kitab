import { create } from 'zustand';

// Types
export type AppModule = 
  | 'splash'
  | 'onboarding'
  | 'auth'
  | 'biometric'
  | 'dashboard'
  | 'expenses'
  | 'roommate'
  | 'labour'
  | 'bahikhata'
  | 'udhaar'
  | 'lenden'
  | 'reports'
  | 'settings';

export type AccountType = 'personal' | 'family' | 'business' | 'kirana';
export type ThemeMode = 'light' | 'dark';
export type Language = 'en' | 'hi' | 'hinglish';

// 1. Personal Expense Tracker Types
export interface PersonalTransaction {
  id: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  date: string;
  paymentMethod: string;
  notes: string;
  account: AccountType;
}

// 2. Roommate Shared Sheet Types
export interface RoommateGroup {
  id: string;
  name: string;
  members: string[];
}

export interface SharedExpense {
  id: string;
  groupId: string;
  amount: number;
  description: string;
  paidBy: string; // member name
  date: string;
  splitType: 'equal' | 'percentage' | 'custom';
  splits: { [memberName: string]: number }; // Amount owed by each member
}

// 3. Labour Ledger Types
export interface Worker {
  id: string;
  name: string;
  mobile: string;
  dailyWage: number;
  joiningDate: string;
  site: string;
}

export interface AttendanceRecord {
  id: string; // date_workerId
  date: string; // YYYY-MM-DD
  workerId: string;
  status: 'present' | 'absent' | 'halfday';
  overtimeHours: number;
}

export interface LabourPayment {
  id: string;
  workerId: string;
  amount: number;
  type: 'salary' | 'advance';
  date: string;
  notes: string;
}

// 4. Bahi Khata Types
export interface Customer {
  id: string;
  name: string;
  mobile: string;
  address: string;
  shopName?: string;
}

export interface LedgerTransaction {
  id: string;
  customerId: string;
  amount: number;
  type: 'credit' | 'debit'; // credit = you gave (receivable), debit = you took (payable)
  date: string;
  notes: string;
}

// 5. Udhaar Types
export interface UdhaarEntry {
  id: string;
  type: 'lent' | 'borrowed';
  personName: string;
  amount: number;
  interestRate: number; // monthly interest rate in %
  interestType: 'none' | 'simple' | 'compound';
  startDate: string;
  dueDate: string;
  notes: string;
  status: 'pending' | 'settled';
  payments: { amount: number; date: string }[];
}

// Store State Interface
interface HisabKitabState {
  // Navigation & UI preferences
  activeModule: AppModule;
  activeAccount: AccountType;
  theme: ThemeMode;
  language: Language;
  hideBalances: boolean;
  userProfile: {
    name: string;
    email: string;
    mobile: string;
    pin: string;
  } | null;
  
  // Data State
  personalTransactions: PersonalTransaction[];
  roommateGroups: RoommateGroup[];
  sharedExpenses: SharedExpense[];
  workers: Worker[];
  attendance: AttendanceRecord[];
  labourPayments: LabourPayment[];
  customers: Customer[];
  ledgerTransactions: LedgerTransaction[];
  udhaarEntries: UdhaarEntry[];
  
  // Actions - UI Config
  setActiveModule: (module: AppModule) => void;
  setActiveAccount: (account: AccountType) => void;
  toggleTheme: () => void;
  setLanguage: (lang: Language) => void;
  setHideBalances: (hide: boolean) => void;
  setUserProfile: (profile: HisabKitabState['userProfile']) => void;
  resetAllData: () => void;

  // Actions - Personal Expense
  addPersonalTransaction: (tx: Omit<PersonalTransaction, 'id'>) => void;
  deletePersonalTransaction: (id: string) => void;
  editPersonalTransaction: (id: string, tx: Partial<PersonalTransaction>) => void;
  
  // Actions - Roommates Shared Sheet
  addRoommateGroup: (group: Omit<RoommateGroup, 'id'>) => string;
  addSharedExpense: (expense: Omit<SharedExpense, 'id'>) => void;
  deleteSharedExpense: (id: string) => void;
  
  // Actions - Labour Ledger
  addWorker: (worker: Omit<Worker, 'id'>) => void;
  deleteWorker: (id: string) => void;
  markAttendance: (rec: Omit<AttendanceRecord, 'id'>) => void;
  addLabourPayment: (pmt: Omit<LabourPayment, 'id'>) => void;
  deleteLabourPayment: (id: string) => void;
  
  // Actions - Bahi Khata
  addCustomer: (cust: Omit<Customer, 'id'>) => void;
  deleteCustomer: (id: string) => void;
  addLedgerTransaction: (tx: Omit<LedgerTransaction, 'id'>) => void;
  deleteLedgerTransaction: (id: string) => void;
  
  // Actions - Udhaar
  addUdhaarEntry: (entry: Omit<UdhaarEntry, 'id' | 'status' | 'payments'>) => void;
  payUdhaarPartially: (id: string, amount: number, date: string) => void;
  settleUdhaar: (id: string) => void;
  deleteUdhaar: (id: string) => void;
}

// Initial Mock Data to showcase the rich features instantly
const mockPersonalTransactions: PersonalTransaction[] = [
  { id: 'p1', amount: 45000, category: 'Salary', type: 'income', date: '2026-05-01', paymentMethod: 'Bank Transfer', notes: 'Monthly income credit', account: 'personal' },
  { id: 'p2', amount: 12000, category: 'Rent', type: 'expense', date: '2026-05-02', paymentMethod: 'UPI', notes: 'Apartment rent payment', account: 'personal' },
  { id: 'p3', amount: 1500, category: 'Groceries', type: 'expense', date: '2026-05-15', paymentMethod: 'Cash', notes: 'Weekly groceries checkout', account: 'personal' },
  { id: 'p4', amount: 800, category: 'Dining Out', type: 'expense', date: '2026-05-20', paymentMethod: 'Card', notes: 'Dinner with team', account: 'personal' },
  { id: 'p5', amount: 2500, category: 'Electricity Bill', type: 'expense', date: '2026-05-25', paymentMethod: 'UPI', notes: 'Electricity dues', account: 'personal' },
  { id: 'p6', amount: 6500, category: 'Freelance Design', type: 'income', date: '2026-05-28', paymentMethod: 'UPI', notes: 'Freelance landing page redesign', account: 'business' }
];

const mockRoommateGroups: RoommateGroup[] = [
  { id: 'g1', name: 'Flat 402 Roommates', members: ['Aman', 'Rahul', 'You', 'Vikram'] },
  { id: 'g2', name: 'Manali Summer Trip', members: ['Aman', 'You', 'Sandeep', 'Neha'] }
];

const mockSharedExpenses: SharedExpense[] = [
  {
    id: 's1',
    groupId: 'g1',
    amount: 8000,
    description: 'Electricity & Gas Bills',
    paidBy: 'Aman',
    date: '2026-05-10',
    splitType: 'equal',
    splits: { Aman: 2000, Rahul: 2000, You: 2000, Vikram: 2000 }
  },
  {
    id: 's2',
    groupId: 'g1',
    amount: 1500,
    description: 'High-speed WiFi Connection',
    paidBy: 'You',
    date: '2026-05-12',
    splitType: 'equal',
    splits: { Aman: 375, Rahul: 375, You: 375, Vikram: 375 }
  },
  {
    id: 's3',
    groupId: 'g1',
    amount: 3200,
    description: 'Monthly Groceries stock',
    paidBy: 'Rahul',
    date: '2026-05-18',
    splitType: 'custom',
    splits: { Aman: 1000, Rahul: 200, You: 1200, Vikram: 800 }
  }
];

const mockWorkers: Worker[] = [
  { id: 'w1', name: 'Rajesh Kumar', mobile: '9876543210', dailyWage: 600, joiningDate: '2026-04-10', site: 'Phase 2 Construction' },
  { id: 'w2', name: 'Sohan Singh', mobile: '8765432109', dailyWage: 550, joiningDate: '2026-04-12', site: 'Phase 2 Construction' },
  { id: 'w3', name: 'Manoj Yadav', mobile: '7654321098', dailyWage: 700, joiningDate: '2026-05-01', site: 'Villa Renovation' }
];

const mockAttendance: AttendanceRecord[] = [
  // Rajesh Kumar Attendance
  { id: '2026-05-25_w1', date: '2026-05-25', workerId: 'w1', status: 'present', overtimeHours: 2 },
  { id: '2026-05-26_w1', date: '2026-05-26', workerId: 'w1', status: 'present', overtimeHours: 0 },
  { id: '2026-05-27_w1', date: '2026-05-27', workerId: 'w1', status: 'halfday', overtimeHours: 0 },
  { id: '2026-05-28_w1', date: '2026-05-28', workerId: 'w1', status: 'present', overtimeHours: 1 },
  { id: '2026-05-29_w1', date: '2026-05-29', workerId: 'w1', status: 'absent', overtimeHours: 0 },
  
  // Sohan Singh Attendance
  { id: '2026-05-25_w2', date: '2026-05-25', workerId: 'w2', status: 'present', overtimeHours: 0 },
  { id: '2026-05-26_w2', date: '2026-05-26', workerId: 'w2', status: 'present', overtimeHours: 3 },
  { id: '2026-05-27_w2', date: '2026-05-27', workerId: 'w2', status: 'present', overtimeHours: 0 },
  { id: '2026-05-28_w2', date: '2026-05-28', workerId: 'w2', status: 'absent', overtimeHours: 0 },
  { id: '2026-05-29_w2', date: '2026-05-29', workerId: 'w2', status: 'present', overtimeHours: 0 },

  // Manoj Yadav Attendance
  { id: '2026-05-25_w3', date: '2026-05-25', workerId: 'w3', status: 'present', overtimeHours: 0 },
  { id: '2026-05-26_w3', date: '2026-05-26', workerId: 'w3', status: 'present', overtimeHours: 0 },
  { id: '2026-05-27_w3', date: '2026-05-27', workerId: 'w3', status: 'present', overtimeHours: 0 },
  { id: '2026-05-28_w3', date: '2026-05-28', workerId: 'w3', status: 'present', overtimeHours: 0 },
  { id: '2026-05-29_w3', date: '2026-05-29', workerId: 'w3', status: 'present', overtimeHours: 2 }
];

const mockLabourPayments: LabourPayment[] = [
  { id: 'lp1', workerId: 'w1', amount: 1500, type: 'advance', date: '2026-05-20', notes: 'Family emergency advance' },
  { id: 'lp2', workerId: 'w2', amount: 1000, type: 'advance', date: '2026-05-24', notes: 'Festival advance' }
];

const mockCustomers: Customer[] = [
  { id: 'c1', name: 'Verma Ji Kirana', mobile: '9988776655', address: 'Shop 12, Sector 15 Market', shopName: 'Verma Sweets' },
  { id: 'c2', name: 'Amit Gupta (Regular)', mobile: '8877665544', address: 'Flat 101, Block B, Green Heights' },
  { id: 'c3', name: 'Rakesh Hardware', mobile: '7766554433', address: 'Old Main Road Market' }
];

const mockLedgerTransactions: LedgerTransaction[] = [
  { id: 'l1', customerId: 'c1', amount: 3500, type: 'credit', date: '2026-05-05', notes: 'Monthly groceries stock' },
  { id: 'l2', customerId: 'c1', amount: 2000, type: 'debit', date: '2026-05-15', notes: 'Partial cash payment' },
  { id: 'l3', customerId: 'c2', amount: 450, type: 'credit', date: '2026-05-22', notes: 'Lent custom toolkit' },
  { id: 'l4', customerId: 'c3', amount: 8000, type: 'debit', date: '2026-05-10', notes: 'Raw construction pipe supplies' },
  { id: 'l5', customerId: 'c3', amount: 5000, type: 'credit', date: '2026-05-25', notes: 'Online bank settlement' }
];

const mockUdhaarEntries: UdhaarEntry[] = [
  {
    id: 'u1',
    type: 'lent',
    personName: 'Ramesh Sharma',
    amount: 15000,
    interestRate: 2,
    interestType: 'simple',
    startDate: '2026-04-01',
    dueDate: '2026-08-01',
    notes: 'Personal credit support for child fees',
    status: 'pending',
    payments: [{ amount: 3000, date: '2026-05-01' }]
  },
  {
    id: 'u2',
    type: 'borrowed',
    personName: 'Sunil Uncle',
    amount: 50000,
    interestRate: 1.5,
    interestType: 'compound',
    startDate: '2026-03-15',
    dueDate: '2026-09-15',
    notes: 'Borrowed for laptop purchase emergency',
    status: 'pending',
    payments: []
  }
];

export const useHisabKitabStore = create<HisabKitabState>((set) => ({
  // Navigation & Preferences
  activeModule: 'splash',
  activeAccount: 'personal',
  theme: 'light',
  language: 'en',
  hideBalances: false,
  userProfile: {
    name: 'Gaurav Aggarwal',
    email: 'gaurav.hisab@gmail.com',
    mobile: '9898989898',
    pin: '1234'
  },

  // State Data loaded with mocks
  personalTransactions: mockPersonalTransactions,
  roommateGroups: mockRoommateGroups,
  sharedExpenses: mockSharedExpenses,
  workers: mockWorkers,
  attendance: mockAttendance,
  labourPayments: mockLabourPayments,
  customers: mockCustomers,
  ledgerTransactions: mockLedgerTransactions,
  udhaarEntries: mockUdhaarEntries,

  // Global preference actions
  setActiveModule: (module) => set({ activeModule: module }),
  setActiveAccount: (account) => set({ activeAccount: account }),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
  setLanguage: (lang) => set({ language: lang }),
  setHideBalances: (hide) => set({ hideBalances: hide }),
  setUserProfile: (profile) => set({ userProfile: profile }),
  resetAllData: () => set({
    personalTransactions: [],
    roommateGroups: [],
    sharedExpenses: [],
    workers: [],
    attendance: [],
    labourPayments: [],
    customers: [],
    ledgerTransactions: [],
    udhaarEntries: []
  }),

  // Personal Transactions actions
  addPersonalTransaction: (tx) => set((state) => ({
    personalTransactions: [
      ...state.personalTransactions,
      { ...tx, id: 'ptx_' + Math.random().toString(36).substr(2, 9) }
    ]
  })),
  deletePersonalTransaction: (id) => set((state) => ({
    personalTransactions: state.personalTransactions.filter(t => t.id !== id)
  })),
  editPersonalTransaction: (id, updatedTx) => set((state) => ({
    personalTransactions: state.personalTransactions.map(t => t.id === id ? { ...t, ...updatedTx } : t)
  })),

  // Roommate Group actions
  addRoommateGroup: (group) => {
    const id = 'group_' + Math.random().toString(36).substr(2, 9);
    set((state) => ({
      roommateGroups: [...state.roommateGroups, { ...group, id }]
    }));
    return id;
  },
  addSharedExpense: (exp) => set((state) => ({
    sharedExpenses: [
      ...state.sharedExpenses,
      { ...exp, id: 'sexp_' + Math.random().toString(36).substr(2, 9) }
    ]
  })),
  deleteSharedExpense: (id) => set((state) => ({
    sharedExpenses: state.sharedExpenses.filter(e => e.id !== id)
  })),

  // Worker actions
  addWorker: (worker) => set((state) => ({
    workers: [
      ...state.workers,
      { ...worker, id: 'w_' + Math.random().toString(36).substr(2, 9) }
    ]
  })),
  deleteWorker: (id) => set((state) => ({
    workers: state.workers.filter(w => w.id !== id),
    attendance: state.attendance.filter(a => a.workerId !== id),
    labourPayments: state.labourPayments.filter(p => p.workerId !== id)
  })),
  markAttendance: (rec) => set((state) => {
    const recordId = `${rec.date}_${rec.workerId}`;
    const filtered = state.attendance.filter(a => a.id !== recordId);
    return {
      attendance: [...filtered, { ...rec, id: recordId }]
    };
  }),
  addLabourPayment: (pmt) => set((state) => ({
    labourPayments: [
      ...state.labourPayments,
      { ...pmt, id: 'lpmt_' + Math.random().toString(36).substr(2, 9) }
    ]
  })),
  deleteLabourPayment: (id) => set((state) => ({
    labourPayments: state.labourPayments.filter(p => p.id !== id)
  })),

  // Customer Bahi Khata Actions
  addCustomer: (cust) => set((state) => ({
    customers: [
      ...state.customers,
      { ...cust, id: 'cust_' + Math.random().toString(36).substr(2, 9) }
    ]
  })),
  deleteCustomer: (id) => set((state) => ({
    customers: state.customers.filter(c => c.id !== id),
    ledgerTransactions: state.ledgerTransactions.filter(l => l.customerId !== id)
  })),
  addLedgerTransaction: (tx) => set((state) => ({
    ledgerTransactions: [
      ...state.ledgerTransactions,
      { ...tx, id: 'ltx_' + Math.random().toString(36).substr(2, 9) }
    ]
  })),
  deleteLedgerTransaction: (id) => set((state) => ({
    ledgerTransactions: state.ledgerTransactions.filter(l => l.id !== id)
  })),

  // Udhaar Actions
  addUdhaarEntry: (entry) => set((state) => ({
    udhaarEntries: [
      ...state.udhaarEntries,
      {
        ...entry,
        id: 'udh_' + Math.random().toString(36).substr(2, 9),
        status: 'pending',
        payments: []
      }
    ]
  })),
  payUdhaarPartially: (id, amt, dte) => set((state) => ({
    udhaarEntries: state.udhaarEntries.map(u => {
      if (u.id === id) {
        const newPayments = [...u.payments, { amount: amt, date: dte }];
        const totalPaid = newPayments.reduce((sum, p) => sum + p.amount, 0);
        // Interest calculations would ideally happen here, but for simplicity:
        const status = totalPaid >= u.amount ? 'settled' : 'pending';
        return {
          ...u,
          payments: newPayments,
          status
        };
      }
      return u;
    })
  })),
  settleUdhaar: (id) => set((state) => ({
    udhaarEntries: state.udhaarEntries.map(u => 
      u.id === id ? { ...u, status: 'settled' } : u
    )
  })),
  deleteUdhaar: (id) => set((state) => ({
    udhaarEntries: state.udhaarEntries.filter(u => u.id !== id)
  }))
}));
