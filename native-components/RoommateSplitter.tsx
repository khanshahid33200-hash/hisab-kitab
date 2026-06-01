import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  FlatList 
} from 'react-native';
import { Users, QrCode, ArrowLeft, CheckCircle2 } from 'lucide-react-native';

interface GroupMember {
  name: string;
  oweBalance: number;
}

interface RoommateSplitterProps {
  groupName: string;
  members: string[];
  onBack: () => void;
  onAddExpense: (description: string, amount: number, paidBy: string) => void;
}

export default function RoommateSplitter({
  groupName = "Flat 402 Roommates",
  members = ["Aman", "Rahul", "You", "Vikram"],
  onBack,
  onAddExpense
}: RoommateSplitterProps) {
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState(members[0]);
  const [isSettling, setIsSettling] = useState(false);

  // Mocked balances
  const mockBalances: GroupMember[] = [
    { name: "Aman", oweBalance: 2000 },
    { name: "Rahul", oweBalance: -800 }, // owes 800
    { name: "You", oweBalance: 1200 },
    { name: "Vikram", oweBalance: -2400 } // owes 2400
  ];

  const handleSaveExpense = () => {
    if (!desc || !amount) return;
    onAddExpense(desc, parseFloat(amount), paidBy);
    setDesc('');
    setAmount('');
  };

  return (
    <View className="flex-1 bg-slate-900 text-slate-100 p-4">
      {/* Header bar */}
      <View className="flex-row items-center gap-3 mt-4 mb-6">
        <TouchableOpacity onPress={onBack} className="p-2 bg-slate-800 rounded-full">
          <ArrowLeft size={16} color="#ffffff" />
        </TouchableOpacity>
        <Text className="text-white font-bold text-lg">{groupName}</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        
        {/* Balances Board */}
        <View className="bg-slate-800/80 border border-slate-700/60 rounded-3xl p-5 mb-6">
          <Text className="text-slate-400 font-bold text-xs uppercase tracking-wider mb-4">
            Outstanding Debts Ledger
          </Text>
          <View className="gap-y-3">
            {mockBalances.map((item, idx) => (
              <View key={idx} className="flex-row justify-between items-center">
                <Text className="text-slate-200 font-medium text-sm">{item.name}</Text>
                <Text className={`font-bold text-sm ${item.oweBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {item.oweBalance >= 0 ? `gets back ₹${item.oweBalance}` : `owes ₹${Math.abs(item.oweBalance)}`}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Add Common expense bill form */}
        <View className="bg-slate-800/50 border border-slate-700/40 rounded-3xl p-5 mb-6 gap-y-4">
          <Text className="text-slate-300 font-bold text-xs uppercase tracking-wider">
            Record Shared Expense
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
            {/* Paid By member picker simulation */}
            <View className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-2 py-1 justify-center">
              <Text className="text-slate-300 text-xs pl-2">Paid By:</Text>
              <TextInput 
                className="text-slate-100 font-semibold text-xs pl-2"
                defaultValue={paidBy}
                onChangeText={setPaidBy}
              />
            </View>
          </View>

          <TextInput 
            placeholder="Bill description (e.g. WiFi Bill)" 
            placeholderTextColor="#64748b"
            className="bg-slate-900 text-slate-100 border border-slate-700 rounded-xl px-4 py-2.5 text-sm"
            value={desc}
            onChangeText={setDesc}
          />

          <TouchableOpacity 
            className="bg-blue-600 rounded-xl py-3 items-center"
            onPress={handleSaveExpense}
          >
            <Text className="text-white font-bold text-sm">Add Bill Split</Text>
          </TouchableOpacity>
        </View>

        {/* UPI QR quick settlement toggle */}
        <TouchableOpacity 
          className="bg-emerald-600/10 border border-emerald-500/20 rounded-3xl p-5 items-center gap-3 mb-6"
          onPress={() => setIsSettling(!isSettling)}
        >
          <View className="p-3 bg-emerald-500/10 rounded-full">
            <QrCode size={24} color="#10b981" />
          </View>
          <Text className="text-emerald-400 font-bold text-xs uppercase tracking-wider">
            {isSettling ? "Hide UPI Payment QR" : "Generate UPI Settlement QR"}
          </Text>
          {isSettling && (
            <View className="items-center mt-2 p-4 bg-white rounded-2xl">
              <Text className="text-slate-900 font-extrabold text-[10px] mb-2 tracking-widest">
                UPI: merchant.hisab@okaxis
              </Text>
              {/* Mock QR Placeholder */}
              <View className="w-32 h-32 bg-slate-100 items-center justify-center border border-slate-200">
                <Text className="text-slate-500 text-xs font-bold">QR Image Code</Text>
              </View>
            </View>
          )}
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}
