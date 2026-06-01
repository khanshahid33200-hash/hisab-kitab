import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar 
} from 'react-native';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Users, 
  Briefcase, 
  BookOpen, 
  DollarSign, 
  Bell, 
  Sparkles 
} from 'lucide-react-native';

interface DashboardProps {
  userName: string;
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  activeAccount: string;
  onNavigate: (module: string) => void;
  onAddTransaction: () => void;
}

export default function Dashboard({
  userName = "Gaurav Aggarwal",
  totalBalance = 38500,
  monthlyIncome = 51500,
  monthlyExpenses = 13000,
  activeAccount = "personal",
  onNavigate,
  onAddTransaction
}: DashboardProps) {
  return (
    <SafeAreaView className="flex-1 bg-slate-900 text-slate-100">
      <StatusBar barStyle="light-content" />
      
      {/* Scrollable Container */}
      <ScrollView className="flex-1 px-4 py-3" showsVerticalScrollIndicator={false}>
        
        {/* Profile and Header Row */}
        <View className="flex-row justify-between items-center mt-2 mb-6">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-full bg-blue-600 items-center justify-center">
              <Text className="text-white font-semibold text-lg">GA</Text>
            </View>
            <View>
              <Text className="text-slate-400 text-xs font-medium">Welcome back,</Text>
              <Text className="text-slate-100 font-bold text-base">{userName}</Text>
            </View>
          </View>
          <TouchableOpacity className="p-2.5 rounded-full bg-slate-800 border border-slate-700 relative">
            <Bell size={18} color="#94a3b8" />
            <View className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-900" />
          </TouchableOpacity>
        </View>

        {/* Primary Glassmorphism Balance Summary Card */}
        <View className="rounded-3xl p-6 bg-blue-600/90 border border-blue-500/50 shadow-xl shadow-blue-500/20 mb-6 overflow-hidden relative">
          <View className="flex-row justify-between items-center">
            <Text className="text-blue-100 text-xs font-semibold tracking-wider uppercase">
              Total Balance ({activeAccount})
            </Text>
            <Sparkles size={16} color="#fbbf24" />
          </View>
          <Text className="text-white font-extrabold text-3xl mt-2">
            ₹{totalBalance.toLocaleString()}
          </Text>

          {/* Income vs Expenses breakdown */}
          <View className="flex-row justify-between mt-6 pt-5 border-t border-blue-400/20">
            <View className="flex-1">
              <Text className="text-blue-200 text-xs mb-1">Monthly Income</Text>
              <View className="flex-row items-center gap-1.5">
                <View className="p-1 rounded-full bg-emerald-500/20">
                  <ArrowDownLeft size={12} color="#10b981" />
                </View>
                <Text className="text-emerald-400 font-bold text-sm">
                  ₹{monthlyIncome.toLocaleString()}
                </Text>
              </View>
            </View>
            <View className="flex-1 border-l border-blue-400/20 pl-4">
              <Text className="text-blue-200 text-xs mb-1">Expenses</Text>
              <View className="flex-row items-center gap-1.5">
                <View className="p-1 rounded-full bg-rose-500/20">
                  <ArrowUpRight size={12} color="#f43f5e" />
                </View>
                <Text className="text-rose-400 font-bold text-sm">
                  ₹{monthlyExpenses.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Access Modules Navigation Section */}
        <View className="mb-6">
          <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">
            Core Modules
          </Text>
          <View className="flex-row flex-wrap justify-between gap-y-3">
            
            {/* Expense Tracker Item */}
            <TouchableOpacity 
              className="w-[30%] bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3.5 items-center gap-2"
              onPress={() => onNavigate('expenses')}
            >
              <View className="p-2.5 rounded-full bg-blue-500/10">
                <Wallet size={20} color="#3b82f6" />
              </View>
              <Text className="text-slate-100 font-semibold text-[11px]">Expenses</Text>
            </TouchableOpacity>

            {/* Roommates Shared Item */}
            <TouchableOpacity 
              className="w-[30%] bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3.5 items-center gap-2"
              onPress={() => onNavigate('roommate')}
            >
              <View className="p-2.5 rounded-full bg-emerald-500/10">
                <Users size={20} color="#10b981" />
              </View>
              <Text className="text-slate-100 font-semibold text-[11px]">Roommates</Text>
            </TouchableOpacity>

            {/* Labour Bookkeeper Item */}
            <TouchableOpacity 
              className="w-[30%] bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3.5 items-center gap-2"
              onPress={() => onNavigate('labour')}
            >
              <View className="p-2.5 rounded-full bg-rose-500/10">
                <Briefcase size={20} color="#f43f5e" />
              </View>
              <Text className="text-slate-100 font-semibold text-[11px]">Labour</Text>
            </TouchableOpacity>

            {/* Bahi Khata Customer Ledger Item */}
            <TouchableOpacity 
              className="w-[30%] bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3.5 items-center gap-2"
              onPress={() => onNavigate('bahikhata')}
            >
              <View className="p-2.5 rounded-full bg-purple-500/10">
                <BookOpen size={20} color="#a855f7" />
              </View>
              <Text className="text-slate-100 font-semibold text-[11px]">Bahi Khata</Text>
            </TouchableOpacity>

            {/* Udhaar Loans Tracker Item */}
            <TouchableOpacity 
              className="w-[30%] bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3.5 items-center gap-2"
              onPress={() => onNavigate('udhaar')}
            >
              <View className="p-2.5 rounded-full bg-amber-500/10">
                <DollarSign size={20} color="#f59e0b" />
              </View>
              <Text className="text-slate-100 font-semibold text-[11px]">Udhaar</Text>
            </TouchableOpacity>

            {/* General Reports Analytics Item */}
            <TouchableOpacity 
              className="w-[30%] bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3.5 items-center gap-2"
              onPress={() => onNavigate('reports')}
            >
              <View className="p-2.5 rounded-full bg-cyan-500/10">
                <Sparkles size={20} color="#06b6d4" />
              </View>
              <Text className="text-slate-100 font-semibold text-[11px]">Reports</Text>
            </TouchableOpacity>

          </View>
        </View>

        {/* Recent Active Notifications Feed */}
        <View className="mb-6">
          <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">
            Recent Activities
          </Text>
          <View className="bg-slate-800/40 rounded-2xl border border-slate-700/40 p-4 gap-y-3.5">
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center gap-3">
                <View className="p-2 bg-rose-500/20 rounded-full">
                  <ArrowUpRight size={14} color="#f43f5e" />
                </View>
                <View>
                  <Text className="text-slate-100 font-semibold text-xs">Rent Payment</Text>
                  <Text className="text-slate-400 text-[10px]">House Rent • UPI</Text>
                </View>
              </View>
              <Text className="text-rose-400 font-bold text-xs">-₹12,000</Text>
            </View>

            <View className="flex-row justify-between items-center border-t border-slate-800/80 pt-3.5">
              <View className="flex-row items-center gap-3">
                <View className="p-2 bg-emerald-500/20 rounded-full">
                  <ArrowDownLeft size={14} color="#10b981" />
                </View>
                <View>
                  <Text className="text-slate-100 font-semibold text-xs">Salary Credit</Text>
                  <Text className="text-slate-400 text-[10px]">Office Income • Bank</Text>
                </View>
              </View>
              <Text className="text-emerald-400 font-bold text-xs">+₹45,000</Text>
            </View>
          </View>
        </View>

      </ScrollView>

      {/* Floating Add Ledger Transaction Button */}
      <TouchableOpacity 
        className="absolute bottom-5 right-5 w-14 h-14 bg-blue-600 rounded-full items-center justify-center shadow-xl shadow-blue-500/30 border border-blue-400/30"
        onPress={onAddTransaction}
      >
        <Text className="text-white font-extrabold text-2xl">+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
