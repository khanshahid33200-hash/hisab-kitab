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

// Initial Data starts empty
const initialPersonalTransactions: PersonalTransaction[] = [];
const initialRoommateGroups: RoommateGroup[] = [];
const initialSharedExpenses: SharedExpense[] = [];
const initialWorkers: Worker[] = [];
const initialAttendance: AttendanceRecord[] = [];
const initialLabourPayments: LabourPayment[] = [];
const initialCustomers: Customer[] = [];
const initialLedgerTransactions: LedgerTransaction[] = [];
const initialUdhaarEntries: UdhaarEntry[] = [];

export const useHisabKitabStore = create<HisabKitabState>((set) => ({
  // Navigation & Preferences
  activeModule: 'splash',
  activeAccount: 'personal',
  theme: 'light',
  language: 'en',
  hideBalances: false,
  userProfile: null,

  // State Data
  personalTransactions: initialPersonalTransactions,
  roommateGroups: initialRoommateGroups,
  sharedExpenses: initialSharedExpenses,
  workers: initialWorkers,
  attendance: initialAttendance,
  labourPayments: initialLabourPayments,
  customers: initialCustomers,
  ledgerTransactions: initialLedgerTransactions,
  udhaarEntries: initialUdhaarEntries,

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
