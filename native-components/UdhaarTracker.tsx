import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput 
} from 'react-native';
import { ArrowLeft, DollarSign, Calendar, MessageSquare } from 'lucide-react-native';

interface UdhaarTrackerProps {
  personName: string;
  principalAmount: number;
  interestRate: number; // monthly interest rate in %
  dueDate: string;
  onBack: () => void;
  onSendReminder: () => void;
}

export default function UdhaarTracker({
  personName = "Ramesh Sharma",
  principalAmount = 15000,
  interestRate = 2, // monthly rate
  dueDate = "2026-08-01",
  onBack,
  onSendReminder
}: UdhaarTrackerProps) {
  const [installment, setInstallment] = useState('');
  
  // Quick mock interest elapsed
  const totalOwes = principalAmount * (1 + (interestRate / 100) * 2); // Simple interest for 2 months mockup

  const handlePayInstallment = () => {
    if (!installment) return;
    setInstallment('');
  };

  return (
    <View className="flex-1 bg-slate-900 text-slate-100 p-4">
      {/* Header */}
      <View className="flex-row items-center gap-3 mt-4 mb-6">
        <TouchableOpacity onPress={onBack} className="p-2 bg-slate-800 rounded-full">
          <ArrowLeft size={16} color="#ffffff" />
        </TouchableOpacity>
        <Text className="text-white font-bold text-lg">{personName} Credit Book</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        
        {/* Core Principal and Interest aggregation card */}
        <View className="bg-slate-800/80 border border-slate-700/60 rounded-3xl p-5 mb-6">
          <Text className="text-slate-400 font-bold text-xs uppercase tracking-wider mb-3">
            Loan Credit Account
          </Text>
          <Text className="text-white font-extrabold text-2xl">
            Principal: ₹{principalAmount.toLocaleString()}
          </Text>

          <View className="mt-4 pt-4 border-t border-slate-700/50 gap-y-2">
            <View className="flex-row justify-between">
              <Text className="text-slate-400 text-xs">Monthly Interest:</Text>
              <Text className="text-slate-200 font-bold text-xs">{interestRate}% / month</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-slate-400 text-xs">Due Timeline:</Text>
              <Text className="text-slate-200 font-bold text-xs">{dueDate}</Text>
            </View>
            <View className="flex-row justify-between pt-2 border-t border-slate-800">
              <Text className="text-slate-200 font-bold text-xs">Net Repayable (with Interest):</Text>
              <Text className="text-emerald-400 font-extrabold text-sm">₹{totalOwes.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* Send reminder alert trigger */}
        <TouchableOpacity 
          className="bg-emerald-600/10 border border-emerald-500/20 rounded-2xl py-3 px-5 flex-row justify-center items-center gap-2 mb-6"
          onPress={onSendReminder}
        >
          <MessageSquare size={16} color="#10b981" />
          <Text className="text-emerald-400 font-bold text-xs uppercase tracking-wider">
            Send WhatsApp Balance Reminder
          </Text>
        </TouchableOpacity>

        {/* Log partial installment pay form */}
        <View className="bg-slate-800/50 border border-slate-700/40 rounded-3xl p-5 mb-6 gap-y-4">
          <Text className="text-slate-300 font-bold text-xs uppercase tracking-wider">
            Log installment Payment
          </Text>

          <View className="flex-row gap-x-2">
            <TextInput 
              placeholder="Amount (₹)" 
              placeholderTextColor="#64748b"
              keyboardType="numeric"
              className="flex-1 bg-slate-900 text-slate-100 border border-slate-700 rounded-xl px-4 py-2.5 text-sm"
              value={installment}
              onChangeText={setInstallment}
            />
            <TouchableOpacity 
              className="bg-emerald-600 rounded-xl px-6 justify-center items-center"
              onPress={handlePayInstallment}
            >
              <Text className="text-white font-bold text-sm">Pay</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}
