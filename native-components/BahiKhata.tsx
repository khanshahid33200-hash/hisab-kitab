import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput 
} from 'react-native';
import { ArrowLeft, ArrowUpRight, ArrowDownLeft } from 'lucide-react-native';

interface BahiKhataProps {
  customerName: string;
  shopName: string;
  mobile: string;
  onBack: () => void;
  onAddTransaction: (amount: number, type: 'credit' | 'debit', notes: string) => void;
}

export default function BahiKhata({
  customerName = "Verma Ji Kirana",
  shopName = "Verma Sweets & Bakery",
  mobile = "9988776655",
  onBack,
  onAddTransaction
}: BahiKhataProps) {
  const [amount, setAmount] = useState('');
  const [entryType, setEntryType] = useState<'credit' | 'debit'>('credit'); // credit = lent (receivable), debit = taken (payable)
  const [notes, setNotes] = useState('');

  // Mock Ledger Entries Journal list
  const mockLedgers = [
    { id: '1', date: 'May 28', amount: 3500, type: 'credit', notes: 'Monthly groceries stock supply' },
    { id: '2', date: 'May 25', amount: 2000, type: 'debit', notes: 'Partial UPI cash deposit received' },
    { id: '3', date: 'May 20', amount: 1500, type: 'credit', notes: 'Lent custom catering utensils' }
  ];

  const handleSaveEntry = () => {
    if (!amount) return;
    onAddTransaction(parseFloat(amount), entryType, notes);
    setAmount('');
    setNotes('');
  };

  return (
    <View className="flex-1 bg-slate-900 text-slate-100 p-4">
      {/* Header */}
      <View className="flex-row items-center gap-3 mt-4 mb-6">
        <TouchableOpacity onPress={onBack} className="p-2 bg-slate-800 rounded-full">
          <ArrowLeft size={16} color="#ffffff" />
        </TouchableOpacity>
        <View>
          <Text className="text-white font-bold text-lg">{customerName}</Text>
          <Text className="text-slate-400 text-[10px]">{shopName}</Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        
        {/* Ledger Balance Indicator board */}
        <View className="bg-emerald-500/10 border border-emerald-500/30 rounded-3xl p-5 mb-6 text-center items-center">
          <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">
            Ledger Credit Status
          </Text>
          <Text className="text-emerald-400 font-extrabold text-2xl mt-1.5">
            You will get ₹3,000
          </Text>
        </View>

        {/* Add Entry Card */}
        <View className="bg-slate-800/50 border border-slate-700/40 rounded-3xl p-5 mb-6 gap-y-4">
          <Text className="text-slate-300 font-bold text-xs uppercase tracking-wider">
            Add Ledger Journal Entry
          </Text>

          <View className="flex-row gap-x-2">
            <TextInput 
              placeholder="Amount (₹)" 
              placeholderTextColor="#64748b"
              keyboardType="numeric"
              className="flex-1 bg-slate-900 text-slate-100 border border-slate-700 rounded-xl px-4 py-2.5 text-sm"
              value={amount}
              onChangeText={setAmount}
            />
            
            <View className="flex-row border border-slate-700 rounded-xl overflow-hidden bg-slate-900">
              <TouchableOpacity 
                className={`px-3 justify-center items-center ${entryType === 'credit' ? 'bg-emerald-600' : ''}`}
                onPress={() => setEntryType('credit')}
              >
                <Text className={`font-bold text-[9px] ${entryType === 'credit' ? 'text-white' : 'text-slate-400'}`}>You Gave</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className={`px-3 justify-center items-center ${entryType === 'debit' ? 'bg-rose-600' : ''}`}
                onPress={() => setEntryType('debit')}
              >
                <Text className={`font-bold text-[9px] ${entryType === 'debit' ? 'text-white' : 'text-slate-400'}`}>You Took</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TextInput 
            placeholder="Items, description notes..." 
            placeholderTextColor="#64748b"
            className="bg-slate-900 text-slate-100 border border-slate-700 rounded-xl px-4 py-2.5 text-sm"
            value={notes}
            onChangeText={setNotes}
          />

          <TouchableOpacity 
            className="bg-blue-600 rounded-xl py-3 items-center"
            onPress={handleSaveEntry}
          >
            <Text className="text-white font-bold text-sm">Save Entry</Text>
          </TouchableOpacity>
        </View>

        {/* Ledger list history */}
        <View className="mb-6">
          <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">
            Journal Ledger Log
          </Text>
          <View className="gap-y-3">
            {mockLedgers.map(tx => (
              <View key={tx.id} className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-4 flex-row justify-between items-center">
                <View className="flex-row items-center gap-3">
                  <View className={`p-2 rounded-full ${tx.type === 'credit' ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>
                    {tx.type === 'credit' ? (
                      <ArrowUpRight size={14} color="#10b981" />
                    ) : (
                      <ArrowDownLeft size={14} color="#f43f5e" />
                    )}
                  </View>
                  <View>
                    <Text className="text-slate-100 font-semibold text-xs">{tx.notes}</Text>
                    <Text className="text-slate-400 text-[10px]">{tx.date}</Text>
                  </View>
                </View>
                <Text className={`font-bold text-xs ${tx.type === 'credit' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>
    </View>
  );
}
