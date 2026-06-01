import { useState, useMemo, useEffect } from 'react';
import { useHisabKitabStore } from './store';
import type { AccountType } from './store';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  Users,
  Briefcase,
  BookOpen,
  ArrowLeftRight,
  Settings,
  Sun,
  Moon,
  DollarSign,
  AlertCircle,
  QrCode,
  Printer,
  Search,
  Bell,
  ChevronRight,
  X,
  Lock,
  Shield,
  Activity,
  FileText,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  Download,
  CheckCircle,
  MessageSquare,
  ChevronLeft,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';

export default function App() {
  const store = useHisabKitabStore();
  const isDark = store.theme === 'dark';

  // Modal State for Quick Add Mobile FAB
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddType, setQuickAddType] = useState<'income' | 'expense' | 'udhaar' | 'worker' | 'customer'>('expense');

  // Unified Toasts State
  const [toasts, setToasts] = useState<{ id: string; msg: string; type: 'success' | 'info' | 'warning' }[]>([]);
  const showToast = (msg: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = Math.random().toString();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  // Sync dark theme class on documentElement
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
  }, [isDark]);

  // General Screen Calculations (Personal Finance Balance)
  const stats = useMemo(() => {
    const accountTxs = store.personalTransactions.filter(t => t.account === store.activeAccount);
    const income = accountTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = accountTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    
    // Udhaar calculations
    const pendingLent = store.udhaarEntries
      .filter(u => u.type === 'lent' && u.status === 'pending')
      .reduce((sum, u) => {
        const paid = u.payments.reduce((s, p) => s + p.amount, 0);
        return sum + (u.amount - paid);
      }, 0);
      
    const pendingBorrowed = store.udhaarEntries
      .filter(u => u.type === 'borrowed' && u.status === 'pending')
      .reduce((sum, u) => {
        const paid = u.payments.reduce((s, p) => s + p.amount, 0);
        return sum + (u.amount - paid);
      }, 0);

    // Bahi Khata Customer Ledger calculations
    // Ledger transaction type: credit = receivable, debit = payable
    const totalReceivableLedger = store.ledgerTransactions
      .reduce((sum, t) => {
        if (t.type === 'credit') return sum + t.amount;
        return sum - t.amount;
      }, 0);

    return {
      income,
      expense,
      balance: income - expense,
      pendingLent,
      pendingBorrowed,
      totalReceivableLedger
    };
  }, [store.personalTransactions, store.activeAccount, store.udhaarEntries, store.ledgerTransactions]);

  // Shared sheet details
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const selectedGroup = store.roommateGroups.find(g => g.id === selectedGroupId) || null;
  const groupExpenses = store.sharedExpenses.filter(e => e.groupId === selectedGroupId);
  
  // Calculate roommate split ledger for selected group
  const groupBalances = useMemo(() => {
    if (!selectedGroup) return {};
    const balances: { [member: string]: number } = {};
    selectedGroup.members.forEach(m => { balances[m] = 0; });

    groupExpenses.forEach(exp => {
      // Amount paid by paidBy member is credited
      balances[exp.paidBy] += exp.amount;
      // Subtract what each member owes
      Object.entries(exp.splits).forEach(([member, oweAmt]) => {
        if (balances[member] !== undefined) {
          balances[member] -= oweAmt;
        }
      });
    });

    return balances;
  }, [selectedGroup, groupExpenses]);

  // Labour Management State
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const selectedWorker = store.workers.find(w => w.id === selectedWorkerId) || null;
  const [attendanceDate, setAttendanceDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Compute selected worker details & net salary
  const workerStats = useMemo(() => {
    if (!selectedWorker) return null;
    const workerAttendance = store.attendance.filter(a => a.workerId === selectedWorker.id);
    const presentDays = workerAttendance.filter(a => a.status === 'present').length;
    const halfDays = workerAttendance.filter(a => a.status === 'halfday').length;
    const overtimeHours = workerAttendance.reduce((sum, a) => sum + (a.overtimeHours || 0), 0);
    
    // Wage calculation
    const attendanceWage = (presentDays * selectedWorker.dailyWage) + (halfDays * (selectedWorker.dailyWage / 2));
    const overtimeWage = overtimeHours * (selectedWorker.dailyWage / 8); // Assumes 8-hour workday
    const totalEarned = attendanceWage + overtimeWage;

    // Advances subtracted
    const workerPayments = store.labourPayments.filter(p => p.workerId === selectedWorker.id);
    const advances = workerPayments.filter(p => p.type === 'advance').reduce((s, p) => s + p.amount, 0);
    const wagesPaid = workerPayments.filter(p => p.type === 'salary').reduce((s, p) => s + p.amount, 0);

    return {
      presentDays,
      halfDays,
      overtimeHours,
      totalEarned,
      advances,
      wagesPaid,
      netPending: totalEarned - advances - wagesPaid
    };
  }, [selectedWorker, store.attendance, store.labourPayments]);

  // Bahi Khata Customer State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const selectedCustomer = store.customers.find(c => c.id === selectedCustomerId) || null;
  const customerLedgerTransactions = store.ledgerTransactions.filter(t => t.customerId === selectedCustomerId);
  
  const customerBalance = useMemo(() => {
    return customerLedgerTransactions.reduce((sum, t) => {
      if (t.type === 'credit') return sum + t.amount; // they owe us (credit/lent)
      return sum - t.amount; // they paid us (debit/taken)
    }, 0);
  }, [customerLedgerTransactions]);

  // Udhaar State & Interest calculator
  const [selectedUdhaarId, setSelectedUdhaarId] = useState<string | null>(null);
  const selectedUdhaar = store.udhaarEntries.find(u => u.id === selectedUdhaarId) || null;

  const calculatedUdhaarInterest = useMemo(() => {
    if (!selectedUdhaar) return { interest: 0, total: 0 };
    const amt = selectedUdhaar.amount;
    const rate = selectedUdhaar.interestRate / 100; // monthly rate
    
    // Calculate months elapsed
    const start = new Date(selectedUdhaar.startDate);
    const end = new Date(selectedUdhaar.dueDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const months = diffDays / 30.4; // avg month length

    if (selectedUdhaar.interestType === 'simple') {
      const interest = amt * rate * months;
      return { interest, total: amt + interest };
    } else if (selectedUdhaar.interestType === 'compound') {
      // Compound monthly
      const total = amt * Math.pow(1 + rate, months);
      return { interest: total - amt, total };
    }
    return { interest: 0, total: amt };
  }, [selectedUdhaar]);

  // Consolidated Search & Filter state (Len Den)
  const [globalSearch, setGlobalSearch] = useState('');
  const [globalFilterType, setGlobalFilterType] = useState<'all' | 'income' | 'expense' | 'udhaar' | 'ledger'>('all');

  const consolidatedTransactions = useMemo(() => {
    const list: { id: string; source: string; amount: number; type: 'income' | 'expense'; date: string; title: string; subtitle: string }[] = [];

    // Personal expenses
    store.personalTransactions.forEach(t => {
      list.push({
        id: t.id,
        source: 'Personal Expense',
        amount: t.amount,
        type: t.type,
        date: t.date,
        title: t.notes || t.category,
        subtitle: `${t.category} • ${t.paymentMethod}`
      });
    });

    // Bahi Khata
    store.ledgerTransactions.forEach(t => {
      const cust = store.customers.find(c => c.id === t.customerId);
      list.push({
        id: t.id,
        source: 'Bahi Khata Ledger',
        amount: t.amount,
        type: t.type === 'credit' ? 'expense' : 'income', // credit means we gave hardware/goods, debit means we took cash
        date: t.date,
        title: t.notes || (t.type === 'credit' ? 'Goods Sold' : 'Payment Received'),
        subtitle: cust ? `Customer: ${cust.name}` : 'Ledger customer'
      });
    });

    // Udhaar entries
    store.udhaarEntries.forEach(t => {
      list.push({
        id: t.id,
        source: 'Udhaar Credit',
        amount: t.amount,
        type: t.type === 'lent' ? 'expense' : 'income',
        date: t.startDate,
        title: `${t.type === 'lent' ? 'Lent to' : 'Borrowed from'} ${t.personName}`,
        subtitle: `Due: ${t.dueDate} • Interest: ${t.interestRate}%`
      });
    });

    // Filter and Search
    return list.filter(item => {
      const matchSearch = 
        item.title.toLowerCase().includes(globalSearch.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(globalSearch.toLowerCase()) ||
        item.source.toLowerCase().includes(globalSearch.toLowerCase());
      
      if (globalFilterType === 'all') return matchSearch;
      if (globalFilterType === 'income') return matchSearch && item.type === 'income';
      if (globalFilterType === 'expense') return matchSearch && item.type === 'expense';
      if (globalFilterType === 'udhaar') return matchSearch && item.source.includes('Udhaar');
      if (globalFilterType === 'ledger') return matchSearch && item.source.includes('Bahi Khata');
      return matchSearch;
    }).sort((a,b) => b.date.localeCompare(a.date));
  }, [store.personalTransactions, store.ledgerTransactions, store.udhaarEntries, store.customers, globalSearch, globalFilterType]);

  // --- Web Desktop Dashboard Invoice Generator State ---
  const [invoiceCustomer, setInvoiceCustomer] = useState('Verma Ji Kirana');
  const [invoiceItems, setInvoiceItems] = useState<{ desc: string; qty: number; rate: number }[]>([
    { desc: 'Super Basmati Rice 10kg', qty: 2, rate: 850 },
    { desc: 'Fortune Refined Oil 5L', qty: 1, rate: 740 },
    { desc: 'Tata Premium Tea 1kg', qty: 3, rate: 320 }
  ]);
  const [invoiceNewDesc, setInvoiceNewDesc] = useState('');
  const [invoiceNewQty, setInvoiceNewQty] = useState(1);
  const [invoiceNewRate, setInvoiceNewRate] = useState(100);
  const [invoiceGstEnabled, setInvoiceGstEnabled] = useState(true);

  const addInvoiceItem = () => {
    if (!invoiceNewDesc) return;
    setInvoiceItems(prev => [...prev, { desc: invoiceNewDesc, qty: invoiceNewQty, rate: invoiceNewRate }]);
    setInvoiceNewDesc('');
    setInvoiceNewQty(1);
    setInvoiceNewRate(100);
    showToast('Invoice item added');
  };

  const deleteInvoiceItem = (index: number) => {
    setInvoiceItems(prev => prev.filter((_, i) => i !== index));
    showToast('Invoice item removed', 'warning');
  };

  const invoiceTotals = useMemo(() => {
    const subtotal = invoiceItems.reduce((sum, item) => sum + (item.qty * item.rate), 0);
    const gst = invoiceGstEnabled ? subtotal * 0.18 : 0; // 18% GST (9% CGST + 9% SGST)
    return {
      subtotal,
      gst,
      cgst: gst / 2,
      sgst: gst / 2,
      total: subtotal + gst
    };
  }, [invoiceItems, invoiceGstEnabled]);

  // Dynamic Charts calculated from store details
  const personalCategoryData = useMemo(() => {
    const cats: { [name: string]: number } = {};
    store.personalTransactions
      .filter(t => t.account === store.activeAccount && t.type === 'expense')
      .forEach(t => {
        cats[t.category] = (cats[t.category] || 0) + t.amount;
      });
    return Object.entries(cats).map(([name, value]) => ({ name, value }));
  }, [store.personalTransactions, store.activeAccount]);

  const maxCategoryVal = useMemo(() => {
    if (personalCategoryData.length === 0) return 1;
    return Math.max(...personalCategoryData.map(c => c.value));
  }, [personalCategoryData]);


  return (
    <div className="app-container">
      
      {/* Toast Alert overlay notifications */}
      <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {toasts.map(t => (
          <div 
            key={t.id} 
            className={`glass-card slide-in-right badge-${t.type === 'success' ? 'success' : t.type === 'warning' ? 'danger' : 'primary'}`}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 12, 
              padding: '12px 24px', 
              boxShadow: 'var(--shadow-xl)', 
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              backgroundColor: t.type === 'success' ? '#22c55e' : t.type === 'warning' ? '#ef4444' : '#2563eb',
              color: '#ffffff'
            }}
          >
            {t.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{t.msg}</span>
          </div>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* LEFT COLUMN: Premium Smartphone Device Simulator Frame                 */}
      {/* ========================================================================= */}
      <div className="simulator-container">
        <div className="smartphone-frame">
          <div className="smartphone-notch">
            <div className="notch-sensor"></div>
            <div className="notch-camera"></div>
          </div>
          
          <div className="smartphone-screen">
            
            {/* Phone Top Status Bar */}
            <div className="smartphone-statusbar">
              <div>23:28 🔋</div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {store.theme === 'dark' ? <Moon size={11} /> : <Sun size={11} />}
                <span>LTE 📶</span>
              </div>
            </div>

            {/* Simulated Phone Screen Navigation Route Dispatcher */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '0 16px 20px', position: 'relative' }}>
              
              {/* --- SPLASH MODULE --- */}
              {store.activeModule === 'splash' && (
                <div className="fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 20 }}>
                  <div style={{ width: 90, height: 90, borderRadius: 28, backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(37,99,235,0.3)', transform: 'rotate(10deg)' }}>
                    <BookOpen size={48} color="#ffffff" style={{ transform: 'rotate(-10deg)' }} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: 26, fontWeight: 800 }}>HISAB KITAB</h2>
                    <p style={{ fontSize: 13, marginTop: 4, letterSpacing: '0.05em' }}>YOUR SMART DIGITAL LEDGER</p>
                  </div>
                  <div className="glass-card" style={{ padding: '6px 16px', fontSize: 11, fontWeight: 600, color: 'var(--primary)', cursor: 'pointer', marginTop: 30 }} onClick={() => store.setActiveModule('onboarding')}>
                    Tap Screen to Open ⚡
                  </div>
                </div>
              )}

              {/* --- ONBOARDING MODULE --- */}
              {store.activeModule === 'onboarding' && (
                <div className="slide-up" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: 16 }}>Hisab Kitab</span>
                    <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => store.setActiveModule('auth')}>Skip</button>
                  </div>
                  
                  <div style={{ textAlign: 'center', padding: '40px 10px' }}>
                    <div style={{ display: 'inline-flex', padding: 20, borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', marginBottom: 20 }}>
                      <Activity size={48} />
                    </div>
                    <h3 style={{ fontSize: 22, fontWeight: 700 }}>Lose the Paper Notebook</h3>
                    <p style={{ marginTop: 10, fontSize: 13 }}>Track daily cash registers, roommate rents, labor ledger books, and lent credits securely with full automatic cloud backup syncing.</p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 10 }}>
                      <span style={{ width: 16, height: 6, borderRadius: 3, backgroundColor: 'var(--primary)' }}></span>
                      <span style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: 'var(--border)' }}></span>
                      <span style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: 'var(--border)' }}></span>
                    </div>
                    <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => store.setActiveModule('auth')}>
                      Get Started <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* --- AUTHENTICATION MODULE --- */}
              {store.activeModule === 'auth' && (
                <div className="slide-up" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20, padding: '20px 0' }}>
                  <div>
                    <h3 style={{ fontSize: 22, fontWeight: 700 }}>Secure Login</h3>
                    <p style={{ fontSize: 12, marginTop: 4 }}>Access your account or create a new database in seconds.</p>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Mobile Number</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span className="form-control" style={{ width: '65px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 10, fontWeight: 600 }}>+91</span>
                      <input type="tel" className="form-control" placeholder="98765 43210" defaultValue="9898989898" />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => {
                      showToast('OTP code sent successfully', 'info');
                      store.setActiveModule('biometric');
                    }}>
                      Send Mobile OTP Verification
                    </button>
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 11, margin: '8px 0' }}>— OR —</div>
                    <button className="btn btn-secondary" style={{ width: '100%', gap: 10 }} onClick={() => {
                      showToast('Logged in with Google');
                      store.setActiveModule('biometric');
                    }}>
                      <span style={{ color: '#ea4335', fontWeight: 800 }}>G</span> Log In with Google Account
                    </button>
                  </div>

                  <div className="glass-card" style={{ marginTop: 'auto', padding: 14, textAlign: 'center', fontSize: 11 }}>
                    🛡️ Protected by Firebase App Check and 256-bit AES encryption.
                  </div>
                </div>
              )}

              {/* --- BIOMETRIC SECURITY LOCK SCREEN --- */}
              {store.activeModule === 'biometric' && (
                <div className="fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30, padding: '20px 0' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', padding: 16, borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', marginBottom: 16 }}>
                      <Lock size={32} />
                    </div>
                    <h3 style={{ fontSize: 20, fontWeight: 700 }}>Enter App PIN</h3>
                    <p style={{ fontSize: 12, marginTop: 4 }}>Hi, {store.userProfile?.name || 'Gaurav'}. Input code or bypass security lock.</p>
                  </div>

                  {/* Passcode Circles mockup */}
                  <div style={{ display: 'flex', gap: 16 }}>
                    <span style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: 'var(--primary)' }}></span>
                    <span style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: 'var(--primary)' }}></span>
                    <span style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: 'var(--primary)' }}></span>
                    <span style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: 'var(--primary)' }}></span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
                    <button className="btn btn-primary" style={{ width: '100%', gap: 10 }} onClick={() => {
                      showToast('Unlock success');
                      store.setActiveModule('dashboard');
                    }}>
                      <Shield size={16} /> Unlock with Fingerprint/PIN
                    </button>
                    <button className="btn btn-secondary" style={{ width: '100%', fontSize: 11 }} onClick={() => store.setActiveModule('auth')}>
                      Switch Account
                    </button>
                  </div>
                </div>
              )}

              {/* --- SMART DASHBOARD MODULE --- */}
              {store.activeModule === 'dashboard' && (
                <div className="slide-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  
                  {/* Dashboard Header Profile Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 38, height: 38, borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', color: '#ffffff', fontWeight: 600 }}>
                        GA
                      </div>
                      <div>
                        <h4 style={{ fontSize: 14, fontWeight: 700 }}>{store.userProfile?.name}</h4>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Pro Subscriber 🌟</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-secondary btn-icon" onClick={() => {
                        store.toggleTheme();
                        showToast(`Theme switched to ${!isDark ? 'Dark' : 'Light'} Mode`);
                      }}>
                        {isDark ? <Sun size={15} /> : <Moon size={15} />}
                      </button>
                      <button className="btn btn-secondary btn-icon" style={{ position: 'relative' }}>
                        <Bell size={15} />
                        <span style={{ position: 'absolute', top: 2, right: 2, width: 7, height: 7, backgroundColor: 'var(--danger)', borderRadius: '50%' }}></span>
                      </button>
                    </div>
                  </div>

                  {/* Multi Account Toggle */}
                  <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
                    {(['personal', 'family', 'business', 'kirana'] as AccountType[]).map(type => (
                      <span 
                        key={type}
                        className={`badge cursor-pointer ${store.activeAccount === type ? 'badge-primary' : 'badge-warning'}`}
                        style={{ border: store.activeAccount === type ? '1px solid var(--primary)' : '1px solid transparent' }}
                        onClick={() => {
                          store.setActiveAccount(type);
                          showToast(`Switched account to ${type.toUpperCase()}`);
                        }}
                      >
                        {type}
                      </span>
                    ))}
                  </div>

                  {/* Primary Balance Display Card */}
                  <div className="glass-card" style={{ 
                    background: 'linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)', 
                    color: '#ffffff',
                    border: 'none',
                    padding: 20
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.7)' }}>Total Balance</span>
                      <Sparkles size={16} color="#fbbf24" />
                    </div>
                    <h2 style={{ fontSize: 28, fontWeight: 800, marginTop: 4, color: '#ffffff' }}>
                      {store.hideBalances ? '••••••' : `₹${stats.balance.toLocaleString()}`}
                    </h2>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 18, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                      <div>
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', display: 'block' }}>Monthly Income</span>
                        <span style={{ fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, color: '#4ade80' }}>
                          <TrendingUp size={12} /> ₹{stats.income.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', display: 'block' }}>Expenses</span>
                        <span style={{ fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, color: '#f87171' }}>
                          <TrendingDown size={12} /> ₹{stats.expense.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Secondary Quick info: Udhaar & Bahi Khata receivables */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div className="glass-card" style={{ padding: 12 }}>
                      <span style={{ fontSize: 9, color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Lent Udhaar</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--success)', display: 'block', marginTop: 4 }}>
                        ₹{stats.pendingLent.toLocaleString()}
                      </span>
                    </div>
                    <div className="glass-card" style={{ padding: 12 }}>
                      <span style={{ fontSize: 9, color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Bahi Khata Ledger</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', display: 'block', marginTop: 4 }}>
                        ₹{stats.totalReceivableLedger.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Modules quick buttons grid */}
                  <div>
                    <h5 style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 8 }}>Core Modules</h5>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                      
                      <div className="glass-card text-center" style={{ padding: 10, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }} onClick={() => store.setActiveModule('expenses')}>
                        <Wallet size={16} color="var(--primary)" />
                        <span style={{ fontSize: 10, fontWeight: 600 }}>Expenses</span>
                      </div>

                      <div className="glass-card text-center" style={{ padding: 10, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }} onClick={() => store.setActiveModule('roommate')}>
                        <Users size={16} color="var(--secondary)" />
                        <span style={{ fontSize: 10, fontWeight: 600 }}>Roommates</span>
                      </div>

                      <div className="glass-card text-center" style={{ padding: 10, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }} onClick={() => store.setActiveModule('labour')}>
                        <Briefcase size={16} color="#e11d48" />
                        <span style={{ fontSize: 10, fontWeight: 600 }}>Labour</span>
                      </div>

                      <div className="glass-card text-center" style={{ padding: 10, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }} onClick={() => store.setActiveModule('bahikhata')}>
                        <BookOpen size={16} color="#7c3aed" />
                        <span style={{ fontSize: 10, fontWeight: 600 }}>Bahi Khata</span>
                      </div>

                      <div className="glass-card text-center" style={{ padding: 10, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }} onClick={() => store.setActiveModule('udhaar')}>
                        <DollarSign size={16} color="var(--warning)" />
                        <span style={{ fontSize: 10, fontWeight: 600 }}>Udhaar</span>
                      </div>

                      <div className="glass-card text-center" style={{ padding: 10, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }} onClick={() => store.setActiveModule('reports')}>
                        <Activity size={16} color="var(--success)" />
                        <span style={{ fontSize: 10, fontWeight: 600 }}>Reports</span>
                      </div>

                    </div>
                  </div>

                  {/* Recent Activity list */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <h5 style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Recent Transactions</h5>
                      <span style={{ fontSize: 10, color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }} onClick={() => store.setActiveModule('lenden')}>See All</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {store.personalTransactions.slice(0, 3).map(tx => (
                        <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 10, borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <div style={{ padding: 6, borderRadius: '50%', backgroundColor: tx.type === 'income' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)', color: tx.type === 'income' ? 'var(--success)' : 'var(--danger)' }}>
                              {tx.type === 'income' ? <ArrowDownLeft size={13} /> : <ArrowUpRight size={13} />}
                            </div>
                            <div>
                              <span style={{ fontSize: 12, fontWeight: 600, display: 'block' }}>{tx.notes || tx.category}</span>
                              <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>{tx.category} • {tx.date}</span>
                            </div>
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 700, color: tx.type === 'income' ? 'var(--success)' : 'var(--danger)' }}>
                            {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* --- EXPENSE TRACKER MODULE --- */}
              {store.activeModule === 'expenses' && (
                <div className="slide-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
                    <button className="btn btn-secondary btn-icon" style={{ width: 28, height: 28 }} onClick={() => store.setActiveModule('dashboard')}>
                      <ChevronLeft size={14} />
                    </button>
                    <h3 style={{ fontSize: 18, fontWeight: 700 }}>Personal Expenses</h3>
                  </div>

                  {/* Add expense form */}
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    const amount = parseFloat(fd.get('amount') as string);
                    const category = fd.get('category') as string;
                    const type = fd.get('type') as 'income' | 'expense';
                    const notes = fd.get('notes') as string;
                    const paymentMethod = fd.get('paymentMethod') as string;
                    const date = fd.get('date') as string;

                    if (!amount) return;
                    store.addPersonalTransaction({
                      amount,
                      category,
                      type,
                      notes,
                      paymentMethod,
                      date,
                      account: store.activeAccount
                    });
                    showToast('Transaction recorded successfully');
                    e.currentTarget.reset();
                  }} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                        <input type="radio" name="type" value="expense" defaultChecked /> 💸 Expense
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                        <input type="radio" name="type" value="income" /> 💰 Income
                      </label>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Amount (₹)</label>
                        <input type="number" name="amount" required className="form-control" placeholder="500" />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Category</label>
                        <select name="category" className="form-control">
                          <option value="Food">🍔 Food</option>
                          <option value="Rent">🏠 Rent</option>
                          <option value="Bills">🔌 Utility Bills</option>
                          <option value="Salary">💼 Salary</option>
                          <option value="Freelance">💻 Freelance</option>
                          <option value="Shopping">🛍️ Shopping</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Method</label>
                        <select name="paymentMethod" className="form-control">
                          <option value="UPI">UPI / GPay</option>
                          <option value="Cash">Cash</option>
                          <option value="Card">Credit Card</option>
                          <option value="NetBanking">Net Banking</option>
                        </select>
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Date</label>
                        <input type="date" name="date" className="form-control" defaultValue={new Date().toISOString().split('T')[0]} />
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Note / Remark</label>
                      <input type="text" name="notes" className="form-control" placeholder="Dinner with roommates..." />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 4 }}>Add Entry</button>
                  </form>

                  {/* Category breakdown visual meters */}
                  <div>
                    <h5 style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 8 }}>Spending by Category</h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {personalCategoryData.map(cat => (
                        <div key={cat.name} className="glass-card" style={{ padding: 10 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>
                            <span>{cat.name}</span>
                            <span>₹{cat.value.toLocaleString()}</span>
                          </div>
                          <div style={{ width: '100%', height: 6, backgroundColor: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ height: '100%', backgroundColor: 'var(--primary)', width: `${(cat.value / maxCategoryVal) * 100}%` }}></div>
                          </div>
                        </div>
                      ))}
                      {personalCategoryData.length === 0 && (
                        <div className="text-center" style={{ padding: 10, color: 'var(--text-muted)', fontSize: 12 }}>No expenses recorded this month yet.</div>
                      )}
                    </div>
                  </div>

                </div>
              )}

              {/* --- ROOMMATE HISAB KITAB (SHARED SHEET) --- */}
              {store.activeModule === 'roommate' && (
                <div className="slide-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
                    <button className="btn btn-secondary btn-icon" style={{ width: 28, height: 28 }} onClick={() => {
                      if (selectedGroupId) {
                        setSelectedGroupId(null);
                      } else {
                        store.setActiveModule('dashboard');
                      }
                    }}>
                      <ChevronLeft size={14} />
                    </button>
                    <h3 style={{ fontSize: 18, fontWeight: 700 }}>
                      {selectedGroup ? selectedGroup.name : 'Roommate Shared Sheets'}
                    </h3>
                  </div>

                  {/* If no group selected, display list of roommate groups */}
                  {!selectedGroup ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div className="glass-card">
                        <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Create Roommate Group</h4>
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          const fd = new FormData(e.currentTarget);
                          const name = fd.get('name') as string;
                          const membersStr = fd.get('members') as string;
                          if (!name || !membersStr) return;
                          
                          const members = membersStr.split(',').map(m => m.trim()).filter(Boolean);
                          members.push('You'); // auto-include logged in user
                          
                          const newId = store.addRoommateGroup({ name, members });
                          setSelectedGroupId(newId);
                          showToast('Shared sheet created');
                          e.currentTarget.reset();
                        }} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          <input type="text" name="name" required className="form-control" placeholder="Group Name (e.g. Flat 402)" />
                          <input type="text" name="members" required className="form-control" placeholder="Members separate by comma (e.g. Aman, Rahul)" />
                          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Create Group</button>
                        </form>
                      </div>

                      <h5 style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Active Groups</h5>
                      {store.roommateGroups.map(grp => (
                        <div 
                          key={grp.id} 
                          className="glass-card" 
                          style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                          onClick={() => setSelectedGroupId(grp.id)}
                        >
                          <div>
                            <span style={{ fontSize: 14, fontWeight: 700, display: 'block' }}>{grp.name}</span>
                            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{grp.members.join(', ')}</span>
                          </div>
                          <ChevronRight size={16} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    // GROUP DETAIL SCREEN VIEW
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      
                      {/* Active split totals */}
                      <div className="glass-card" style={{ background: 'var(--primary-light)', border: '1px solid var(--primary)' }}>
                        <h4 style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--primary)' }}>Group Balances</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {Object.entries(groupBalances).map(([member, balance]) => (
                            <div key={member} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600 }}>
                              <span>{member}</span>
                              <span style={{ color: balance >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                                {balance >= 0 ? `gets back ₹${balance.toFixed(0)}` : `owes ₹${Math.abs(balance).toFixed(0)}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Add shared expense form */}
                      <div className="glass-card">
                        <h4 style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Record Common Bill</h4>
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          const fd = new FormData(e.currentTarget);
                          const amount = parseFloat(fd.get('amount') as string);
                          const description = fd.get('description') as string;
                          const paidBy = fd.get('paidBy') as string;
                          if (!amount || !description) return;

                          // Split equally
                          const splitAmt = amount / selectedGroup.members.length;
                          const splits: { [m: string]: number } = {};
                          selectedGroup.members.forEach(m => { splits[m] = splitAmt; });

                          store.addSharedExpense({
                            groupId: selectedGroup.id,
                            amount,
                            description,
                            paidBy,
                            date: new Date().toISOString().split('T')[0],
                            splitType: 'equal',
                            splits
                          });

                          showToast('Shared bill logged');
                          e.currentTarget.reset();
                        }} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                            <input type="number" name="amount" required className="form-control" placeholder="Amount (₹)" />
                            <select name="paidBy" className="form-control">
                              {selectedGroup.members.map(m => (
                                <option key={m} value={m}>{m}</option>
                              ))}
                            </select>
                          </div>
                          
                          <input type="text" name="description" required className="form-control" placeholder="Description (e.g. WiFi Bill)" />
                          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Add Split Expense</button>
                        </form>
                      </div>

                      {/* Settlement details & Custom QR generator */}
                      <div className="glass-card text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                        <h4 style={{ fontSize: 12, fontWeight: 700 }}>Quick UPI Settlement QR</h4>
                        <QrCode size={120} color="var(--text)" />
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                          Scan to settle outstanding group debts instantly via UPI GPay/PhonePe
                        </div>
                      </div>

                      {/* Group bill history list */}
                      <div>
                        <h5 style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 8 }}>Group Expenses Log</h5>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {groupExpenses.map(exp => (
                            <div key={exp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 10, borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                              <div>
                                <span style={{ fontSize: 12, fontWeight: 600, display: 'block' }}>{exp.description}</span>
                                <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>Paid by {exp.paidBy} • {exp.date}</span>
                              </div>
                              <span style={{ fontSize: 12, fontWeight: 700 }}>₹{exp.amount.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}

                </div>
              )}

              {/* --- LABOUR LEDGER MODULE --- */}
              {store.activeModule === 'labour' && (
                <div className="slide-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
                    <button className="btn btn-secondary btn-icon" style={{ width: 28, height: 28 }} onClick={() => {
                      if (selectedWorkerId) {
                        setSelectedWorkerId(null);
                      } else {
                        store.setActiveModule('dashboard');
                      }
                    }}>
                      <ChevronLeft size={14} />
                    </button>
                    <h3 style={{ fontSize: 18, fontWeight: 700 }}>
                      {selectedWorker ? `${selectedWorker.name}` : 'Contract & Labour Ledger'}
                    </h3>
                  </div>

                  {!selectedWorker ? (
                    // WORKERS DIRECTORY VIEW
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      
                      {/* Add new worker card */}
                      <div className="glass-card">
                        <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Register Daily-Wage Worker</h4>
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          const fd = new FormData(e.currentTarget);
                          const name = fd.get('name') as string;
                          const mobile = fd.get('mobile') as string;
                          const dailyWage = parseFloat(fd.get('dailyWage') as string);
                          const site = fd.get('site') as string;
                          if (!name || !mobile || !dailyWage) return;

                          store.addWorker({
                            name,
                            mobile,
                            dailyWage,
                            site: site || 'Phase 1 Site',
                            joiningDate: new Date().toISOString().split('T')[0]
                          });
                          showToast('Worker profile added successfully');
                          e.currentTarget.reset();
                        }} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                            <input type="text" name="name" required className="form-control" placeholder="Worker Name" />
                            <input type="tel" name="mobile" required className="form-control" placeholder="Mobile Number" />
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                            <input type="number" name="dailyWage" required className="form-control" placeholder="Daily Wage (₹/day)" />
                            <input type="text" name="site" className="form-control" placeholder="Site Location" />
                          </div>
                          
                          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Register Worker</button>
                        </form>
                      </div>

                      <h5 style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Registered Labour</h5>
                      {store.workers.map(worker => {
                        const wAttendance = store.attendance.filter(a => a.workerId === worker.id && a.status === 'present').length;
                        return (
                          <div 
                            key={worker.id} 
                            className="glass-card" 
                            style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                            onClick={() => setSelectedWorkerId(worker.id)}
                          >
                            <div>
                              <span style={{ fontSize: 14, fontWeight: 700, display: 'block' }}>{worker.name}</span>
                              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>₹{worker.dailyWage}/day • {worker.site}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span className="badge badge-success">{wAttendance} days Present</span>
                              <ChevronRight size={16} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    // SELECTED WORKER DETAIL PAGE VIEW
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      
                      {/* Worker summary totals */}
                      {workerStats && (
                        <div className="glass-card" style={{ background: 'var(--primary-light)', border: '1px solid var(--primary)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                          <div>
                            <span style={{ fontSize: 9, color: 'var(--text-muted)', display: 'block' }}>Total Earnings</span>
                            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>₹{workerStats.totalEarned.toLocaleString()}</span>
                          </div>
                          <div>
                            <span style={{ fontSize: 9, color: 'var(--text-muted)', display: 'block' }}>Advances Subtracted</span>
                            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--danger)' }}>₹{workerStats.advances.toLocaleString()}</span>
                          </div>
                          <div style={{ gridColumn: 'span 2', paddingTop: 8, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 10, fontWeight: 600 }}>Net Pending Wage:</span>
                            <span style={{ fontSize: 14, fontWeight: 800, color: workerStats.netPending >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                              ₹{workerStats.netPending.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Daily Attendance Grid marker */}
                      <div className="glass-card">
                        <h4 style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Attendance Tracker</h4>
                        <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                          <input 
                            type="date" 
                            className="form-control" 
                            value={attendanceDate}
                            onChange={(e) => setAttendanceDate(e.target.value)} 
                          />
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn-success" style={{ flex: 1, padding: 8, fontSize: 12 }} onClick={() => {
                            store.markAttendance({ workerId: selectedWorker.id, date: attendanceDate, status: 'present', overtimeHours: 0 });
                            showToast('Worker marked Present');
                          }}>Present ✔️</button>
                          
                          <button className="btn btn-secondary" style={{ flex: 1, padding: 8, fontSize: 12 }} onClick={() => {
                            store.markAttendance({ workerId: selectedWorker.id, date: attendanceDate, status: 'halfday', overtimeHours: 0 });
                            showToast('Worker marked Half Day');
                          }}>Half Day ⏳</button>
                          
                          <button className="btn btn-danger" style={{ flex: 1, padding: 8, fontSize: 12 }} onClick={() => {
                            store.markAttendance({ workerId: selectedWorker.id, date: attendanceDate, status: 'absent', overtimeHours: 0 });
                            showToast('Worker marked Absent');
                          }}>Absent ✖️</button>
                        </div>
                      </div>

                      {/* Log wage payment / advance form */}
                      <div className="glass-card">
                        <h4 style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Log Wages / Advance Paid</h4>
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          const fd = new FormData(e.currentTarget);
                          const amount = parseFloat(fd.get('amount') as string);
                          const type = fd.get('type') as 'salary' | 'advance';
                          const notes = fd.get('notes') as string;
                          if (!amount) return;

                          store.addLabourPayment({
                            workerId: selectedWorker.id,
                            amount,
                            type,
                            notes: notes || (type === 'advance' ? 'Weekly emergency advance' : 'Wages settlement'),
                            date: new Date().toISOString().split('T')[0]
                          });
                          showToast('Labour payment registered');
                          e.currentTarget.reset();
                        }} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                            <input type="number" name="amount" required className="form-control" placeholder="Amount (₹)" />
                            <select name="type" className="form-control">
                              <option value="salary">Wages Paid</option>
                              <option value="advance">Advance Taken</option>
                            </select>
                          </div>
                          <input type="text" name="notes" className="form-control" placeholder="Payment remarks..." />
                          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Register Payment</button>
                        </form>
                      </div>

                      {/* Payment History and logs list */}
                      <div>
                        <h5 style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 8 }}>Payment Records</h5>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {store.labourPayments.filter(p => p.workerId === selectedWorker.id).map(pmt => (
                            <div key={pmt.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 10, borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                              <div>
                                <span style={{ fontSize: 12, fontWeight: 600, display: 'block', textTransform: 'capitalize' }}>{pmt.type} Payment</span>
                                <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>{pmt.notes} • {pmt.date}</span>
                              </div>
                              <span style={{ fontSize: 12, fontWeight: 700, color: pmt.type === 'advance' ? 'var(--danger)' : 'var(--success)' }}>
                                ₹{pmt.amount.toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}

                </div>
              )}

              {/* --- BAHI KHATA (DIGITAL LEDGER) MODULE --- */}
              {store.activeModule === 'bahikhata' && (
                <div className="slide-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
                    <button className="btn btn-secondary btn-icon" style={{ width: 28, height: 28 }} onClick={() => {
                      if (selectedCustomerId) {
                        setSelectedCustomerId(null);
                      } else {
                        store.setActiveModule('dashboard');
                      }
                    }}>
                      <ChevronLeft size={14} />
                    </button>
                    <h3 style={{ fontSize: 18, fontWeight: 700 }}>
                      {selectedCustomer ? `${selectedCustomer.name}` : 'Bahi Khata Accounts'}
                    </h3>
                  </div>

                  {!selectedCustomer ? (
                    // CUSTOMERS DIRECTORY
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      
                      {/* Register new customer */}
                      <div className="glass-card">
                        <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Register Ledger Account</h4>
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          const fd = new FormData(e.currentTarget);
                          const name = fd.get('name') as string;
                          const mobile = fd.get('mobile') as string;
                          const address = fd.get('address') as string;
                          if (!name || !mobile) return;

                          store.addCustomer({ name, mobile, address });
                          showToast('Ledger account registered successfully');
                          e.currentTarget.reset();
                        }} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                            <input type="text" name="name" required className="form-control" placeholder="Full Name" />
                            <input type="tel" name="mobile" required className="form-control" placeholder="Mobile Number" />
                          </div>
                          
                          <input type="text" name="address" className="form-control" placeholder="Address/Market Area" />
                          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Register Account</button>
                        </form>
                      </div>

                      <h5 style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Customer Accounts</h5>
                      {store.customers.map(cust => {
                        const txs = store.ledgerTransactions.filter(l => l.customerId === cust.id);
                        const bal = txs.reduce((s,t) => t.type === 'credit' ? s + t.amount : s - t.amount, 0);
                        return (
                          <div 
                            key={cust.id} 
                            className="glass-card" 
                            style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                            onClick={() => setSelectedCustomerId(cust.id)}
                          >
                            <div>
                              <span style={{ fontSize: 14, fontWeight: 700, display: 'block' }}>{cust.name}</span>
                              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{cust.mobile}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: 12, fontWeight: 700, color: bal >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                                {bal >= 0 ? `gets ₹${bal}` : `pays ₹${Math.abs(bal)}`}
                              </span>
                              <ChevronRight size={16} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    // SELECTED CUSTOMER LEDGER ACCOUNT VIEW
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      
                      {/* Ledger Running Balance */}
                      <div className="glass-card text-center" style={{ background: customerBalance >= 0 ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)', border: customerBalance >= 0 ? '1px solid var(--success)' : '1px solid var(--danger)' }}>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Ledger Balance Status</span>
                        <h2 style={{ fontSize: 24, fontWeight: 800, marginTop: 4, color: customerBalance >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                          {customerBalance >= 0 ? `You will get ₹${customerBalance.toLocaleString()}` : `You will pay ₹${Math.abs(customerBalance).toLocaleString()}`}
                        </h2>
                      </div>

                      {/* Add Ledger debit/credit form */}
                      <div className="glass-card">
                        <h4 style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Add Ledger Entry</h4>
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          const fd = new FormData(e.currentTarget);
                          const amount = parseFloat(fd.get('amount') as string);
                          const type = fd.get('type') as 'credit' | 'debit';
                          const notes = fd.get('notes') as string;
                          if (!amount) return;

                          store.addLedgerTransaction({
                            customerId: selectedCustomer.id,
                            amount,
                            type,
                            notes: notes || (type === 'credit' ? 'Goods bought on credit' : 'Cash deposit paid'),
                            date: new Date().toISOString().split('T')[0]
                          });
                          showToast('Ledger sheet updated');
                          e.currentTarget.reset();
                        }} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                            <input type="number" name="amount" required className="form-control" placeholder="Amount (₹)" />
                            <select name="type" className="form-control">
                              <option value="credit">You Gave (Lent Credit) 💸</option>
                              <option value="debit">You Took (Got Payment) 💰</option>
                            </select>
                          </div>
                          
                          <input type="text" name="notes" className="form-control" placeholder="Item description, bill details..." />
                          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Add Ledger Entry</button>
                        </form>
                      </div>

                      {/* Journal records lists */}
                      <div>
                        <h5 style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 8 }}>Journal Records</h5>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {customerLedgerTransactions.map(tx => (
                            <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 10, borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                              <div>
                                <span style={{ fontSize: 12, fontWeight: 600, display: 'block' }}>{tx.notes}</span>
                                <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>{tx.date}</span>
                              </div>
                              <span style={{ fontSize: 12, fontWeight: 700, color: tx.type === 'credit' ? 'var(--success)' : 'var(--danger)' }}>
                                {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}

                </div>
              )}

              {/* --- UDHAAR MODULE --- */}
              {store.activeModule === 'udhaar' && (
                <div className="slide-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
                    <button className="btn btn-secondary btn-icon" style={{ width: 28, height: 28 }} onClick={() => {
                      if (selectedUdhaarId) {
                        setSelectedUdhaarId(null);
                      } else {
                        store.setActiveModule('dashboard');
                      }
                    }}>
                      <ChevronLeft size={14} />
                    </button>
                    <h3 style={{ fontSize: 18, fontWeight: 700 }}>
                      {selectedUdhaar ? `${selectedUdhaar.personName} Credit` : 'Udhaar & Loans Tracker'}
                    </h3>
                  </div>

                  {!selectedUdhaar ? (
                    // LOANS DIRECTORY LIST VIEW
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      
                      {/* Register loan form */}
                      <div className="glass-card">
                        <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Log New Credit / Debt</h4>
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          const fd = new FormData(e.currentTarget);
                          const personName = fd.get('personName') as string;
                          const amount = parseFloat(fd.get('amount') as string);
                          const type = fd.get('type') as 'lent' | 'borrowed';
                          const interestRate = parseFloat(fd.get('interestRate') as string);
                          const interestType = fd.get('interestType') as 'none' | 'simple' | 'compound';
                          const dueDate = fd.get('dueDate') as string;
                          const notes = fd.get('notes') as string;
                          
                          if (!personName || !amount || !dueDate) return;

                          store.addUdhaarEntry({
                            personName,
                            amount,
                            type,
                            interestRate: interestRate || 0,
                            interestType,
                            startDate: new Date().toISOString().split('T')[0],
                            dueDate,
                            notes: notes || 'Emergency credit support'
                          });
                          showToast('Loan ledger updated');
                          e.currentTarget.reset();
                        }} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                            <input type="text" name="personName" required className="form-control" placeholder="Contact Name" />
                            <input type="number" name="amount" required className="form-control" placeholder="Amount (₹)" />
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                            <select name="type" className="form-control">
                              <option value="lent">Money Lent 💸</option>
                              <option value="borrowed">Money Borrowed 💰</option>
                            </select>
                            <input type="date" name="dueDate" required className="form-control" />
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                            <input type="number" name="interestRate" step="0.1" className="form-control" placeholder="Interest Rate %/month" />
                            <select name="interestType" className="form-control">
                              <option value="none">No Interest</option>
                              <option value="simple">Simple Interest</option>
                              <option value="compound">Compound Interest</option>
                            </select>
                          </div>

                          <input type="text" name="notes" className="form-control" placeholder="Credit purpose..." />
                          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Register Loan</button>
                        </form>
                      </div>

                      <h5 style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Lent / Borrowed Records</h5>
                      {store.udhaarEntries.map(udh => {
                        const paid = udh.payments.reduce((s,p) => s + p.amount, 0);
                        const bal = udh.amount - paid;
                        return (
                          <div 
                            key={udh.id} 
                            className="glass-card" 
                            style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                            onClick={() => setSelectedUdhaarId(udh.id)}
                          >
                            <div>
                              <span style={{ fontSize: 14, fontWeight: 700, display: 'block' }}>{udh.personName}</span>
                              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                                {udh.type === 'lent' ? 'Lent' : 'Borrowed'} • Due {udh.dueDate}
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: 12, fontWeight: 700, color: udh.type === 'lent' ? 'var(--success)' : 'var(--danger)' }}>
                                ₹{bal.toLocaleString()}
                              </span>
                              <ChevronRight size={16} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    // SELECTED LOAN ACC DETAILS
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      
                      {/* Interest calculations info card */}
                      <div className="glass-card" style={{ background: 'var(--primary-light)', border: '1px solid var(--primary)' }}>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Loan Ledger Details</span>
                        <h3 style={{ fontSize: 18, fontWeight: 800, marginTop: 4 }}>
                          Base Principal: ₹{selectedUdhaar.amount.toLocaleString()}
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8, fontSize: 11, borderTop: '1px solid var(--border)', paddingTop: 8 }}>
                          <div>Interest Type: <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{selectedUdhaar.interestType}</span></div>
                          <div>Monthly Rate: <span style={{ fontWeight: 600 }}>{selectedUdhaar.interestRate}%</span></div>
                          <div style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 13, marginTop: 4 }}>
                            Accumulated Interest Value: ₹{calculatedUdhaarInterest.interest.toFixed(0)}
                          </div>
                          <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--text)', marginTop: 2 }}>
                            Net Payable Total: ₹{calculatedUdhaarInterest.total.toFixed(0)}
                          </div>
                        </div>
                      </div>

                      {/* Log payment installment */}
                      <div className="glass-card">
                        <h4 style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Log Installment Payment</h4>
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          const fd = new FormData(e.currentTarget);
                          const amount = parseFloat(fd.get('amount') as string);
                          if (!amount) return;

                          store.payUdhaarPartially(selectedUdhaar.id, amount, new Date().toISOString().split('T')[0]);
                          showToast('Installment payment registered successfully');
                          e.currentTarget.reset();
                        }} style={{ display: 'flex', gap: 8 }}>
                          <input type="number" name="amount" required className="form-control" placeholder="Amount (₹)" style={{ flex: 1 }} />
                          <button type="submit" className="btn btn-success" style={{ padding: '0 18px' }}>Pay</button>
                        </form>
                      </div>

                      {/* Automated WhatsApp reminder sender */}
                      <button className="btn btn-secondary" style={{ width: '100%', gap: 10, border: '1px solid #22c55e', color: '#22c55e' }} onClick={() => {
                        showToast('Automatic credit reminder sent to WhatsApp', 'info');
                      }}>
                        <MessageSquare size={16} /> Send Auto WhatsApp Reminder
                      </button>

                      {/* Payments installments history */}
                      <div>
                        <h5 style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 8 }}>Payments History</h5>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {selectedUdhaar.payments.map((p, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: 8, borderBottom: '1px solid var(--border)' }}>
                              <span>Installment {idx+1}</span>
                              <span style={{ fontWeight: 700 }}>₹{p.amount.toLocaleString()} ({p.date})</span>
                            </div>
                          ))}
                          {selectedUdhaar.payments.length === 0 && (
                            <div className="text-center" style={{ color: 'var(--text-muted)', padding: 10, fontSize: 11 }}>No payments registered yet.</div>
                          )}
                        </div>
                      </div>

                    </div>
                  )}

                </div>
              )}

              {/* --- LEN DEN CONSOLIDATED SEARCH --- */}
              {store.activeModule === 'lenden' && (
                <div className="slide-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
                    <button className="btn btn-secondary btn-icon" style={{ width: 28, height: 28 }} onClick={() => store.setActiveModule('dashboard')}>
                      <ChevronLeft size={14} />
                    </button>
                    <h3 style={{ fontSize: 18, fontWeight: 700 }}>Len Den Ledger Book</h3>
                  </div>

                  {/* Search and Filters */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type="text" 
                        placeholder="Search contact, note, category..." 
                        className="form-control" 
                        style={{ paddingLeft: 34 }} 
                        value={globalSearch} 
                        onChange={(e) => setGlobalSearch(e.target.value)} 
                      />
                      <Search size={14} style={{ position: 'absolute', left: 12, top: 15 }} className="text-muted" />
                    </div>

                    <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 2 }}>
                      {(['all', 'income', 'expense', 'udhaar', 'ledger'] as const).map(type => (
                        <span 
                          key={type} 
                          className={`badge cursor-pointer ${globalFilterType === type ? 'badge-primary' : 'badge-warning'}`}
                          onClick={() => setGlobalFilterType(type)}
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Table lists */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {consolidatedTransactions.map(tx => (
                      <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span className="badge badge-success" style={{ fontSize: 8, padding: '2px 6px' }}>{tx.source}</span>
                            <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>{tx.date}</span>
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 700, display: 'block', marginTop: 4 }}>{tx.title}</span>
                          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{tx.subtitle}</span>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 800, color: tx.type === 'income' ? 'var(--success)' : 'var(--danger)' }}>
                          {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                    {consolidatedTransactions.length === 0 && (
                      <div className="text-center" style={{ padding: 20, color: 'var(--text-muted)' }}>No financial transactions match your query.</div>
                    )}
                  </div>

                </div>
              )}

              {/* --- REPORTS & ANALYTICS --- */}
              {store.activeModule === 'reports' && (
                <div className="slide-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
                    <button className="btn btn-secondary btn-icon" style={{ width: 28, height: 28 }} onClick={() => store.setActiveModule('dashboard')}>
                      <ChevronLeft size={14} />
                    </button>
                    <h3 style={{ fontSize: 18, fontWeight: 700 }}>Reports & PDF Export</h3>
                  </div>

                  <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <h4 style={{ fontSize: 12, fontWeight: 700 }}>Download Personal / Ledger Statements</h4>
                    <p style={{ fontSize: 11 }}>Generate neat, printer-friendly reports and download Excel or professional PDF ledger files instantly.</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 4 }}>
                      <button className="btn btn-primary" style={{ fontSize: 11, padding: 8 }} onClick={() => showToast('PDF statement downloaded successfully')}>
                        <Download size={13} /> Export PDF Report
                      </button>
                      <button className="btn btn-secondary" style={{ fontSize: 11, padding: 8 }} onClick={() => showToast('Excel statement exported')}>
                        <Download size={13} /> Export Excel
                      </button>
                    </div>
                  </div>

                  {/* Expense trends visual custom SVG chart mockup */}
                  <div className="glass-card">
                    <h4 style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Weekly Expense Trend</h4>
                    <div className="css-chart-bar" style={{ height: 120 }}>
                      <div className="css-chart-bar-item">
                        <div className="css-chart-bar-fill" data-value="₹1,200" style={{ height: '35%', backgroundColor: 'var(--primary)' }}></div>
                        <span className="css-chart-bar-label">Mon</span>
                      </div>
                      <div className="css-chart-bar-item">
                        <div className="css-chart-bar-fill" data-value="₹4,500" style={{ height: '80%', backgroundColor: 'var(--primary)' }}></div>
                        <span className="css-chart-bar-label">Tue</span>
                      </div>
                      <div className="css-chart-bar-item">
                        <div className="css-chart-bar-fill" data-value="₹800" style={{ height: '15%', backgroundColor: 'var(--primary)' }}></div>
                        <span className="css-chart-bar-label">Wed</span>
                      </div>
                      <div className="css-chart-bar-item">
                        <div className="css-chart-bar-fill" data-value="₹2,300" style={{ height: '50%', backgroundColor: 'var(--primary)' }}></div>
                        <span className="css-chart-bar-label">Thu</span>
                      </div>
                      <div className="css-chart-bar-item">
                        <div className="css-chart-bar-fill" data-value="₹6,000" style={{ height: '95%', backgroundColor: 'var(--primary)' }}></div>
                        <span className="css-chart-bar-label">Fri</span>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* --- SETTINGS SCREEN --- */}
              {store.activeModule === 'settings' && (
                <div className="slide-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
                    <button className="btn btn-secondary btn-icon" style={{ width: 28, height: 28 }} onClick={() => store.setActiveModule('dashboard')}>
                      <ChevronLeft size={14} />
                    </button>
                    <h3 style={{ fontSize: 18, fontWeight: 700 }}>App Settings</h3>
                  </div>

                  {/* Profile Edit Card */}
                  <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: 'var(--primary)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18 }}>
                      GA
                    </div>
                    <div>
                      <h4 style={{ fontSize: 15, fontWeight: 700 }}>{store.userProfile?.name}</h4>
                      <p style={{ fontSize: 11 }}>{store.userProfile?.email} • {store.userProfile?.mobile}</p>
                    </div>
                  </div>

                  {/* Preference Controls */}
                  <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <h4 style={{ fontSize: 12, fontWeight: 700, marginBottom: 2 }}>Preferences</h4>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>App Theme Mode</span>
                      <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => {
                        store.toggleTheme();
                        showToast('Theme updated');
                      }}>
                        {isDark ? '🌙 Dark Mode' : '☀️ Light Mode'}
                      </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>Hide Account Balances</span>
                      <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => {
                        store.setHideBalances(!store.hideBalances);
                        showToast(`Privacy mode ${!store.hideBalances ? 'enabled' : 'disabled'}`);
                      }}>
                        {store.hideBalances ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>App Language</span>
                      <select 
                        className="form-control" 
                        style={{ width: '120px', padding: '4px 8px', fontSize: 12 }}
                        value={store.language}
                        onChange={(e) => {
                          store.setLanguage(e.target.value as any);
                          showToast(`Language set to ${e.target.value.toUpperCase()}`);
                        }}
                      >
                        <option value="en">English</option>
                        <option value="hi">हिन्दी (Hindi)</option>
                        <option value="hinglish">Hinglish</option>
                      </select>
                    </div>
                  </div>

                  {/* Actions buttons backup etc */}
                  <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <h4 style={{ fontSize: 12, fontWeight: 700 }}>Data & Account Safety</h4>
                    <button className="btn btn-secondary" style={{ width: '100%', fontSize: 12 }} onClick={() => showToast('Firebase cloud sync completes')}>
                      🔄 Force Cloud Backup Sync
                    </button>
                    <button className="btn btn-danger" style={{ width: '100%', fontSize: 12 }} onClick={() => {
                      if (window.confirm('Are you sure you want to restore all ledger books to empty states?')) {
                        store.resetAllData();
                        showToast('Database wiped', 'warning');
                      }
                    }}>
                      ⚠️ Wipe All Local Records
                    </button>
                  </div>

                </div>
              )}

            </div>

            {/* Smart Phone Bottom Tab Bar Navigator (Only renders when authenticated & not in onboarding/splash) */}
            {!(store.activeModule === 'splash' || store.activeModule === 'onboarding' || store.activeModule === 'auth' || store.activeModule === 'biometric') && (
              <div className="phone-bottom-nav">
                
                <div className={`phone-nav-item ${store.activeModule === 'dashboard' ? 'active' : ''}`} onClick={() => store.setActiveModule('dashboard')}>
                  <Activity size={18} />
                  <span>Home</span>
                </div>

                <div className={`phone-nav-item ${store.activeModule === 'lenden' ? 'active' : ''}`} onClick={() => store.setActiveModule('lenden')}>
                  <ArrowLeftRight size={18} />
                  <span>Len Den</span>
                </div>

                {/* Floating Quick Action Button */}
                <div className="phone-fab" onClick={() => setIsQuickAddOpen(true)}>
                  <Plus size={24} />
                </div>

                <div className={`phone-nav-item ${store.activeModule === 'reports' ? 'active' : ''}`} onClick={() => store.setActiveModule('reports')}>
                  <FileText size={18} />
                  <span>Reports</span>
                </div>

                <div className={`phone-nav-item ${store.activeModule === 'settings' ? 'active' : ''}`} onClick={() => store.setActiveModule('settings')}>
                  <Settings size={18} />
                  <span>Settings</span>
                </div>

              </div>
            )}

            {/* Smartphone screen Bottom Home Indicator */}
            <div className="smartphone-home-indicator"></div>

            {/* --- PHONE MODAL SCREEN SHEET FOR QUICK ADD --- */}
            {isQuickAddOpen && (
              <div className="modal-overlay" onClick={() => setIsQuickAddOpen(false)}>
                <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700 }}>Quick Bookkeeper Action</h3>
                    <button className="btn btn-secondary btn-icon" style={{ width: 24, height: 24 }} onClick={() => setIsQuickAddOpen(false)}>
                      <X size={14} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {(['expense', 'income', 'udhaar', 'worker', 'customer'] as const).map(type => (
                      <span 
                        key={type}
                        className={`badge cursor-pointer ${quickAddType === type ? 'badge-primary' : 'badge-warning'}`}
                        onClick={() => setQuickAddType(type)}
                      >
                        +{type}
                      </span>
                    ))}
                  </div>

                  {/* Form toggle depending on quick type */}
                  {quickAddType === 'expense' && (
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const fd = new FormData(e.currentTarget);
                      const amt = parseFloat(fd.get('amount') as string);
                      if (!amt) return;
                      store.addPersonalTransaction({
                        amount: amt,
                        category: 'Quick Food',
                        type: 'expense',
                        notes: fd.get('notes') as string || 'Quick cash expense',
                        paymentMethod: 'Cash',
                        date: new Date().toISOString().split('T')[0],
                        account: store.activeAccount
                      });
                      showToast('Expense recorded');
                      setIsQuickAddOpen(false);
                    }} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <input type="number" name="amount" required className="form-control" placeholder="Amount (₹)" />
                      <input type="text" name="notes" className="form-control" placeholder="Quick expense notes..." />
                      <button type="submit" className="btn btn-primary">Add Expense</button>
                    </form>
                  )}

                  {quickAddType === 'income' && (
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const fd = new FormData(e.currentTarget);
                      const amt = parseFloat(fd.get('amount') as string);
                      if (!amt) return;
                      store.addPersonalTransaction({
                        amount: amt,
                        category: 'Quick Freelance',
                        type: 'income',
                        notes: fd.get('notes') as string || 'Quick income credit',
                        paymentMethod: 'UPI',
                        date: new Date().toISOString().split('T')[0],
                        account: store.activeAccount
                      });
                      showToast('Income recorded');
                      setIsQuickAddOpen(false);
                    }} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <input type="number" name="amount" required className="form-control" placeholder="Amount (₹)" />
                      <input type="text" name="notes" className="form-control" placeholder="Quick income notes..." />
                      <button type="submit" className="btn btn-primary">Add Income</button>
                    </form>
                  )}

                  {quickAddType === 'udhaar' && (
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const fd = new FormData(e.currentTarget);
                      const amt = parseFloat(fd.get('amount') as string);
                      const name = fd.get('name') as string;
                      if (!amt || !name) return;
                      store.addUdhaarEntry({
                        personName: name,
                        amount: amt,
                        type: 'lent',
                        interestRate: 0,
                        interestType: 'none',
                        startDate: new Date().toISOString().split('T')[0],
                        dueDate: new Date(Date.now() + 15*24*60*60*1000).toISOString().split('T')[0], // 15 days from now
                        notes: 'Quick credit loan'
                      });
                      showToast('Udhaar entry registered');
                      setIsQuickAddOpen(false);
                    }} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <input type="text" name="name" required className="form-control" placeholder="Person Name" />
                      <input type="number" name="amount" required className="form-control" placeholder="Amount (₹)" />
                      <button type="submit" className="btn btn-primary">Add Loan</button>
                    </form>
                  )}

                  {quickAddType === 'worker' && (
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const fd = new FormData(e.currentTarget);
                      const name = fd.get('name') as string;
                      const wage = parseFloat(fd.get('wage') as string);
                      if (!name || !wage) return;
                      store.addWorker({
                        name,
                        mobile: '98765 00000',
                        dailyWage: wage,
                        site: 'General Office',
                        joiningDate: new Date().toISOString().split('T')[0]
                      });
                      showToast('Worker registered');
                      setIsQuickAddOpen(false);
                    }} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <input type="text" name="name" required className="form-control" placeholder="Labour Name" />
                      <input type="number" name="wage" required className="form-control" placeholder="Daily Wage (₹/day)" />
                      <button type="submit" className="btn btn-primary">Register Worker</button>
                    </form>
                  )}

                  {quickAddType === 'customer' && (
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const fd = new FormData(e.currentTarget);
                      const name = fd.get('name') as string;
                      if (!name) return;
                      store.addCustomer({
                        name,
                        mobile: '99000 99000',
                        address: 'Market Square'
                      });
                      showToast('Ledger customer added');
                      setIsQuickAddOpen(false);
                    }} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <input type="text" name="name" required className="form-control" placeholder="Customer Name" />
                      <button type="submit" className="btn btn-primary">Create Ledger Account</button>
                    </form>
                  )}

                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RIGHT COLUMN: Web Companion Dashboard (Desktop Portal View)              */}
      {/* ========================================================================= */}
      <div className="desktop-dashboard">
        
        {/* Desktop Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ padding: 8, borderRadius: 10, backgroundColor: 'var(--primary)', color: '#ffffff' }}>
                <Activity size={24} />
              </span>
              <div>
                <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em' }}>Hisab Kitab Web Dashboard</h1>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Pro Business Portal & Invoice Generator</p>
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div className="glass-card" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8, borderRadius: 'var(--radius-md)' }}>
              <span style={{ width: 8, height: 8, backgroundColor: 'var(--success)', borderRadius: '50%', display: 'inline-block' }}></span>
              <span style={{ fontSize: 12, fontWeight: 600 }}>Firebase Cloud Syncing</span>
            </div>
            <button className="btn btn-primary" onClick={() => {
              window.print();
            }}>
              <Printer size={16} /> Print Reports
            </button>
          </div>
        </div>

        {/* Global Business Key Metrics Grid */}
        <div className="metric-grid">
          
          <div className="metric-card success">
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Consolidated Net Worth</span>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginTop: 6 }}>
              ₹{(stats.balance + stats.pendingLent + stats.totalReceivableLedger - stats.pendingBorrowed).toLocaleString()}
            </h2>
            <span style={{ fontSize: 10, color: 'var(--success)', fontWeight: 600, marginTop: 4, display: 'block' }}>
              ✦ Live aggregate from all modules
            </span>
          </div>

          <div className="metric-card">
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Lent Udhaar Outstandings</span>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginTop: 6, color: 'var(--success)' }}>
              ₹{stats.pendingLent.toLocaleString()}
            </h2>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
              Pending return collections
            </span>
          </div>

          <div className="metric-card danger">
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Borrowed Debt Liability</span>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginTop: 6, color: 'var(--danger)' }}>
              ₹{stats.pendingBorrowed.toLocaleString()}
            </h2>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
              Payments you owe to creditors
            </span>
          </div>

          <div className="metric-card warning">
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Kirana Ledger Receivables</span>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginTop: 6, color: 'var(--warning)' }}>
              ₹{stats.totalReceivableLedger.toLocaleString()}
            </h2>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
              Customer accounts credits book
            </span>
          </div>

        </div>

        {/* Dynamic Analytics & Invoice Generator Double Columns Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
          
          {/* LEFT: Consolidated Journals Search Engine Table */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>Consolidated Journal Logs</h3>
                <p style={{ fontSize: 11 }}>Fuzzy-search combined ledger book across all mobile modules</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input 
                  type="text" 
                  placeholder="Fuzzy filter..." 
                  className="form-control" 
                  style={{ width: 140, padding: '4px 8px', fontSize: 12 }} 
                  value={globalSearch} 
                  onChange={(e) => setGlobalSearch(e.target.value)} 
                />
                <select 
                  className="form-control" 
                  style={{ width: 110, padding: '4px 8px', fontSize: 12 }} 
                  value={globalFilterType}
                  onChange={(e) => setGlobalFilterType(e.target.value as any)}
                >
                  <option value="all">All Sources</option>
                  <option value="income">Incomes</option>
                  <option value="expense">Expenses</option>
                  <option value="udhaar">Udhaar Credit</option>
                  <option value="ledger">Kirana Ledgers</option>
                </select>
              </div>
            </div>

            <div className="custom-table-container" style={{ maxHeight: '350px', overflowY: 'auto', marginTop: 0 }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Module Source</th>
                    <th>Particular Details</th>
                    <th>Remark notes</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {consolidatedTransactions.map(tx => (
                    <tr key={tx.id}>
                      <td style={{ fontWeight: 600 }}>{tx.date}</td>
                      <td>
                        <span className={`badge ${tx.source.includes('Expense') ? 'badge-primary' : tx.source.includes('Ledger') ? 'badge-warning' : 'badge-success'}`}>
                          {tx.source}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{tx.title}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{tx.subtitle}</td>
                      <td style={{ fontWeight: 800, color: tx.type === 'income' ? 'var(--success)' : 'var(--danger)' }}>
                        {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {consolidatedTransactions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center" style={{ padding: 20, color: 'var(--text-muted)' }}>No journal records matches filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT: Professional Business Invoice Creator */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>GST Invoice Generator</h3>
              <p style={{ fontSize: 11 }}>Generate neat digital invoices for retail shopkeepers & contractors</p>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Bill To (Customer Name)</label>
              <input 
                type="text" 
                className="form-control" 
                value={invoiceCustomer} 
                onChange={(e) => setInvoiceCustomer(e.target.value)} 
              />
            </div>

            {/* List of current items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 120, overflowY: 'auto' }}>
              <label className="form-label">Invoice Items</label>
              {invoiceItems.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-darker)', padding: '6px 12px', borderRadius: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>
                    {item.desc} (x{item.qty})
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>₹{(item.qty * item.rate).toLocaleString()}</span>
                    <button className="btn btn-secondary btn-icon" style={{ width: 20, height: 20, border: 'none', color: 'var(--danger)' }} onClick={() => deleteInvoiceItem(idx)}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add item row inline */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.2fr auto', gap: 6 }}>
              <input 
                type="text" 
                placeholder="Item name" 
                className="form-control" 
                value={invoiceNewDesc} 
                onChange={(e) => setInvoiceNewDesc(e.target.value)} 
              />
              <input 
                type="number" 
                placeholder="Qty" 
                className="form-control" 
                value={invoiceNewQty} 
                onChange={(e) => setInvoiceNewQty(parseInt(e.target.value) || 1)} 
              />
              <input 
                type="number" 
                placeholder="Rate" 
                className="form-control" 
                value={invoiceNewRate} 
                onChange={(e) => setInvoiceNewRate(parseInt(e.target.value) || 0)} 
              />
              <button className="btn btn-primary" style={{ padding: '0 12px' }} onClick={addInvoiceItem}>
                <Plus size={16} />
              </button>
            </div>

            {/* GST Toggles & Totals */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={invoiceGstEnabled} 
                  onChange={(e) => setInvoiceGstEnabled(e.target.checked)} 
                /> 
                Apply 18% GST (CGST 9% + SGST 9%)
              </label>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Subtotal: ₹{invoiceTotals.subtotal.toLocaleString()}</div>
                {invoiceGstEnabled && (
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>GST (18%): ₹{invoiceTotals.gst.toLocaleString()}</div>
                )}
                <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--primary)', marginTop: 4 }}>
                  Net Total: ₹{invoiceTotals.total.toLocaleString()}
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Printable high-fidelity Invoice Paper Layout Mock */}
        <div style={{ borderTop: '2px dashed var(--border)', paddingTop: 30, marginTop: 10 }}>
          <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, textAlign: 'center' }}>Invoice Print Preview</h4>
          
          <div className="printable-invoice">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #000000', paddingBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800 }}>HISAB KITAB RETAILS</h2>
                <p style={{ fontSize: 11, marginTop: 4 }}>Shop No 14, Ground Floor, Sector-18 Market, Delhi - 110001</p>
                <p style={{ fontSize: 11 }}>GSTIN: 07AAAAA1111A1Z1 • Mobile: +91 9898989898</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '0.05em' }}>TAX INVOICE</h3>
                <p style={{ fontSize: 11, marginTop: 4 }}>Invoice No: <span style={{ fontWeight: 600 }}>HK/2026/0530</span></p>
                <p style={{ fontSize: 11 }}>Date: <span style={{ fontWeight: 600 }}>May 30, 2026</span></p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '20px 0' }}>
              <div>
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#666' }}>Billed To:</span>
                <div style={{ fontSize: 13, fontWeight: 700, marginTop: 4 }}>{invoiceCustomer}</div>
                <p style={{ fontSize: 11 }}>Regular customer account client</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#666' }}>Payment Details:</span>
                <div style={{ fontSize: 11, fontWeight: 600, marginTop: 4 }}>Scan and Settle via UPI</div>
                <p style={{ fontSize: 11 }}>UPI ID: merchant.hisab@okaxis</p>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000000', margin: '20px 0' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6' }}>
                  <th style={{ border: '1px solid #000000', padding: 8, textAlign: 'center', fontSize: 10 }}>S.No</th>
                  <th style={{ border: '1px solid #000000', padding: 8, textAlign: 'left', fontSize: 10 }}>Particular Description</th>
                  <th style={{ border: '1px solid #000000', padding: 8, textAlign: 'center', fontSize: 10 }}>Qty</th>
                  <th style={{ border: '1px solid #000000', padding: 8, textAlign: 'right', fontSize: 10 }}>Rate (₹)</th>
                  <th style={{ border: '1px solid #000000', padding: 8, textAlign: 'right', fontSize: 10 }}>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {invoiceItems.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ border: '1px solid #000000', padding: 8, textAlign: 'center' }}>{idx + 1}</td>
                    <td style={{ border: '1px solid #000000', padding: 8 }}>{item.desc}</td>
                    <td style={{ border: '1px solid #000000', padding: 8, textAlign: 'center' }}>{item.qty}</td>
                    <td style={{ border: '1px solid #000000', padding: 8, textAlign: 'right' }}>{item.rate.toFixed(2)}</td>
                    <td style={{ border: '1px solid #000000', padding: 8, textAlign: 'right' }}>{(item.qty * item.rate).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20, marginTop: 20 }}>
              <div style={{ border: '1px solid #000000', padding: 12, borderRadius: 4, display: 'flex', flexDirection: 'column', gap: 6, justifyContent: 'center' }}>
                <span style={{ fontSize: 10, fontWeight: 700 }}>Terms & Conditions:</span>
                <p style={{ fontSize: 9 }}>1. Goods once sold will not be taken back.</p>
                <p style={{ fontSize: 9 }}>2. Please settle outstanding credits before due timelines.</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11, textAlign: 'right' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Subtotal:</span>
                  <span style={{ fontWeight: 600 }}>₹{invoiceTotals.subtotal.toFixed(2)}</span>
                </div>
                {invoiceGstEnabled && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>CGST (9%):</span>
                      <span>₹{invoiceTotals.cgst.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>SGST (9%):</span>
                      <span>₹{invoiceTotals.sgst.toFixed(2)}</span>
                    </div>
                  </>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px double #000000', paddingTop: 6, fontSize: 14, fontWeight: 800 }}>
                  <span>Grand Total:</span>
                  <span>₹{invoiceTotals.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 50, borderTop: '1px solid #ccc', paddingTop: 10 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 100, height: 100, border: '1px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px' }}>
                  <QrCode size={80} color="#000000" />
                </div>
                <span style={{ fontSize: 9 }}>Scan UPI to Pay Merchant</span>
              </div>
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 30 }}>
                <span style={{ fontSize: 10, color: '#666' }}>For Hisab Kitab Retails</span>
                <span style={{ fontSize: 11, fontWeight: 700, textDecoration: 'underline' }}>Authorized Signatory</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
