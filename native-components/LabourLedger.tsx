import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput 
} from 'react-native';
import { ArrowLeft, Check, X, Clock, HelpCircle } from 'lucide-react-native';

interface LabourLedgerProps {
  workerName: string;
  dailyWage: number;
  mobile: string;
  onBack: () => void;
  onLogPayment: (amount: number, type: 'salary' | 'advance', notes: string) => void;
}

export default function LabourLedger({
  workerName = "Rajesh Kumar",
  dailyWage = 600,
  mobile = "9876543210",
  onBack,
  onLogPayment
}: LabourLedgerProps) {
  const [paymentAmt, setPaymentAmt] = useState('');
  const [paymentType, setPaymentType] = useState<'salary' | 'advance'>('salary');
  const [notes, setNotes] = useState('');
  
  // Mock monthly attendance days
  const [attendance, setAttendance] = useState<{ [day: number]: 'present' | 'absent' | 'halfday' }>({
    1: 'present', 2: 'present', 3: 'halfday', 4: 'present', 5: 'absent',
    6: 'present', 7: 'present', 8: 'present', 9: 'halfday', 10: 'present'
  });

  const presentDays = Object.values(attendance).filter(status => status === 'present').length;
  const halfDays = Object.values(attendance).filter(status => status === 'halfday').length;
  const totalEarned = (presentDays * dailyWage) + (halfDays * (dailyWage / 2));
  
  const mockAdvancePaid = 1200;
  const netPending = totalEarned - mockAdvancePaid;

  const handleSavePayment = () => {
    if (!paymentAmt) return;
    onLogPayment(parseFloat(paymentAmt), paymentType, notes);
    setPaymentAmt('');
    setNotes('');
  };

  return (
    <View className="flex-1 bg-slate-900 text-slate-100 p-4">
      {/* Header */}
      <View className="flex-row items-center gap-3 mt-4 mb-6">
        <TouchableOpacity onPress={onBack} className="p-2 bg-slate-800 rounded-full">
          <ArrowLeft size={16} color="#ffffff" />
        </TouchableOpacity>
        <Text className="text-white font-bold text-lg">{workerName}</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        
        {/* Salary Ledger Summary Board */}
        <View className="bg-slate-800/80 border border-slate-700/60 rounded-3xl p-5 mb-6">
          <Text className="text-slate-400 font-bold text-xs uppercase tracking-wider mb-4">
            Wages Payroll Summary
          </Text>
          <View className="flex-row justify-between mb-4">
            <View>
              <Text className="text-slate-400 text-[10px] uppercase">Earned Wages</Text>
              <Text className="text-white font-bold text-lg">₹{totalEarned.toLocaleString()}</Text>
            </View>
            <View>
              <Text className="text-slate-400 text-[10px] uppercase">Advances Paid</Text>
              <Text className="text-red-400 font-bold text-lg">₹{mockAdvancePaid.toLocaleString()}</Text>
            </View>
          </View>
          <View className="pt-4 border-t border-slate-700/50 flex-row justify-between items-center">
            <Text className="text-slate-200 font-bold text-xs uppercase">Net Outstanding Salary</Text>
            <Text className="text-emerald-400 font-extrabold text-lg">₹{netPending.toLocaleString()}</Text>
          </View>
        </View>

        {/* Daily Attendance Grid Sheet Mock */}
        <View className="bg-slate-800/50 border border-slate-700/40 rounded-3xl p-5 mb-6">
          <Text className="text-slate-300 font-bold text-xs uppercase tracking-wider mb-4">
            Monthly Attendance Grid
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {Array.from({ length: 15 }).map((_, i) => {
              const day = i + 1;
              const status = attendance[day];
              
              let bg = "bg-slate-900 border-slate-700";
              let text = "text-slate-400";
              if (status === 'present') { bg = "bg-emerald-500/20 border-emerald-500/40"; text = "text-emerald-400"; }
              if (status === 'absent') { bg = "bg-red-500/20 border-red-500/40"; text = "text-red-400"; }
              if (status === 'halfday') { bg = "bg-amber-500/20 border-amber-500/40"; text = "text-amber-400"; }

              return (
                <TouchableOpacity 
                  key={day} 
                  className={`w-9 h-9 items-center justify-center rounded-lg border ${bg}`}
                  onPress={() => {
                    const nextStatus = status === 'present' ? 'halfday' : status === 'halfday' ? 'absent' : 'present';
                    setAttendance(prev => ({ ...prev, [day]: nextStatus }));
                  }}
                >
                  <Text className={`font-bold text-[11px] ${text}`}>{day}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text className="text-slate-500 text-[10px] mt-3">
            * Tap daily calendar cell to toggle status: Green (Present), Yellow (Halfday), Red (Absent)
          </Text>
        </View>

        {/* Record salary / advance payment form */}
        <View className="bg-slate-800/50 border border-slate-700/40 rounded-3xl p-5 mb-6 gap-y-4">
          <Text className="text-slate-300 font-bold text-xs uppercase tracking-wider">
            Register Wage / Advance Payment
          </Text>

          <View className="flex-row gap-x-2">
            <TextInput 
              placeholder="Amount (₹)" 
              placeholderTextColor="#64748b"
              keyboardType="numeric"
              className="flex-1 bg-slate-900 text-slate-100 border border-slate-700 rounded-xl px-4 py-2.5 text-sm"
              value={paymentAmt}
              onChangeText={setPaymentAmt}
            />
            
            {/* Payment Type Selection toggle */}
            <View className="flex-row border border-slate-700 rounded-xl overflow-hidden bg-slate-900">
              <TouchableOpacity 
                className={`px-3 justify-center items-center ${paymentType === 'salary' ? 'bg-blue-600' : ''}`}
                onPress={() => setPaymentType('salary')}
              >
                <Text className={`font-bold text-[10px] ${paymentType === 'salary' ? 'text-white' : 'text-slate-400'}`}>Salary</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className={`px-3 justify-center items-center ${paymentType === 'advance' ? 'bg-blue-600' : ''}`}
                onPress={() => setPaymentType('advance')}
              >
                <Text className={`font-bold text-[10px] ${paymentType === 'advance' ? 'text-white' : 'text-slate-400'}`}>Advance</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TextInput 
            placeholder="Payment notes, salary slip remarks..." 
            placeholderTextColor="#64748b"
            className="bg-slate-900 text-slate-100 border border-slate-700 rounded-xl px-4 py-2.5 text-sm"
            value={notes}
            onChangeText={setNotes}
          />

          <TouchableOpacity 
            className="bg-blue-600 rounded-xl py-3 items-center"
            onPress={handleSavePayment}
          >
            <Text className="text-white font-bold text-sm">Register Payment</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}
