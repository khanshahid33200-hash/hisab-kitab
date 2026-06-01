package com.example.hisabkitab.ui.main

import androidx.compose.animation.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation3.runtime.NavKey
import java.util.UUID

// Navigation Destination Enum
enum class MobileScreen {
  SPLASH, ONBOARDING, AUTH, BIOMETRIC, DASHBOARD, EXPENSES, ROOMMATES, LABOUR, BAHIKHATA, UDHAAR, REPORTS, SETTINGS, LENDEN
}

// Data Models
data class PersonalTx(
  val id: String = UUID.randomUUID().toString(),
  val amount: Double,
  val type: String, // "income" | "expense"
  val category: String,
  val notes: String,
  val date: String,
  val paymentMethod: String,
  val account: String // "personal" | "family" | "business"
)

data class RoommateGrp(
  val id: String = UUID.randomUUID().toString(),
  val name: String,
  val members: List<String>
)

data class SharedBill(
  val id: String = UUID.randomUUID().toString(),
  val groupId: String,
  val amount: Double,
  val description: String,
  val paidBy: String,
  val date: String,
  val splits: Map<String, Double>
)

data class SiteWorker(
  val id: String = UUID.randomUUID().toString(),
  val name: String,
  val mobile: String,
  val dailyWage: Double,
  val site: String,
  val joiningDate: String
)

data class AttendanceRec(
  val workerId: String,
  val date: String,
  val status: String, // "present" | "absent" | "halfday"
  val overtimeHours: Int = 0
)

data class LabourPmt(
  val id: String = UUID.randomUUID().toString(),
  val workerId: String,
  val amount: Double,
  val type: String, // "salary" | "advance"
  val date: String,
  val notes: String
)

data class LedgerCust(
  val id: String = UUID.randomUUID().toString(),
  val name: String,
  val mobile: String,
  val address: String
)

data class LedgerTx(
  val id: String = UUID.randomUUID().toString(),
  val customerId: String,
  val amount: Double,
  val type: String, // "credit" (receivable) | "debit" (payable)
  val date: String,
  val notes: String
)

data class UdhaarLending(
  val id: String = UUID.randomUUID().toString(),
  val type: String, // "lent" | "borrowed"
  val personName: String,
  val amount: Double,
  val interestRate: Double,
  val interestType: String, // "none" | "simple" | "compound"
  val startDate: String,
  val dueDate: String,
  val notes: String,
  var status: String = "pending",
  val payments: MutableList<Pair<Double, String>> = mutableListOf()
)

@Composable
fun MainScreen(
  onItemClick: (NavKey) -> Unit,
  modifier: Modifier = Modifier
) {
  var isDarkTheme by remember { mutableStateOf(false) }
  
  // Custom HSL Tailored Palettes mapping
  val colorScheme = if (isDarkTheme) {
    darkColorScheme(
      primary = Color(0xFF60A5FA),
      background = Color(0xFF0F172A),
      surface = Color(0xFF1E293B),
      onPrimary = Color(0xFF0F172A),
      onBackground = Color(0xFFF8FAFC),
      onSurface = Color(0xFFF8FAFC),
      secondary = Color(0xFF10B981),
      error = Color(0xFFEF4444)
    )
  } else {
    lightColorScheme(
      primary = Color(0xFF2563EB),
      background = Color(0xFFF1F5F9),
      surface = Color(0xFFFFFFFF),
      onPrimary = Color(0xFFFFFFFF),
      onBackground = Color(0xFF0F172A),
      onSurface = Color(0xFF0F172A),
      secondary = Color(0xFF10B981),
      error = Color(0xFFEF4444)
    )
  }

  MaterialTheme(
    colorScheme = colorScheme
  ) {
    HisabKitabAppContent(
      isDarkTheme = isDarkTheme,
      onToggleTheme = { isDarkTheme = !isDarkTheme }
    )
  }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HisabKitabAppContent(
  isDarkTheme: Boolean,
  onToggleTheme: () -> Unit
) {
  var currentScreen by remember { mutableStateOf(MobileScreen.SPLASH) }
  var activeAccount by remember { mutableStateOf("personal") }
  var hideBalances by remember { mutableStateOf(false) }
  
  // --- Global Application Stateful Data Registries ---
  val personalTransactions = remember { mutableStateListOf<PersonalTx>(
    PersonalTx(amount = 45000.0, type = "income", category = "Salary", notes = "Monthly salary", date = "2026-05-01", paymentMethod = "Bank", account = "personal"),
    PersonalTx(amount = 12000.0, type = "expense", category = "Rent", notes = "House Rent", date = "2026-05-02", paymentMethod = "UPI", account = "personal"),
    PersonalTx(amount = 1500.0, type = "expense", category = "Food", notes = "Weekly groceries", date = "2026-05-15", paymentMethod = "Cash", account = "personal"),
    PersonalTx(amount = 6500.0, type = "income", category = "Freelance", notes = "Invoice design", date = "2026-05-28", paymentMethod = "UPI", account = "business")
  )}
  
  val roommateGroups = remember { mutableStateListOf<RoommateGrp>(
    RoommateGrp(id = "rg1", name = "Flat 402 Roommates", members = listOf("Aman", "Rahul", "You", "Vikram"))
  )}
  
  val sharedExpenses = remember { mutableStateListOf<SharedBill>(
    SharedBill(groupId = "rg1", amount = 8000.0, description = "Electricity Bill", paidBy = "Aman", date = "2026-05-10", splits = mapOf("Aman" to 2000.0, "Rahul" to 2000.0, "You" to 2000.0, "Vikram" to 2000.0))
  )}
  
  val siteWorkers = remember { mutableStateListOf<SiteWorker>(
    SiteWorker(id = "w1", name = "Rajesh Kumar", mobile = "9876543210", dailyWage = 600.0, site = "Phase 2 Construction", joiningDate = "2026-04-10")
  )}
  
  val attendanceRecords = remember { mutableStateListOf<AttendanceRec>(
    AttendanceRec(workerId = "w1", date = "2026-05-25", status = "present"),
    AttendanceRec(workerId = "w1", date = "2026-05-26", status = "present"),
    AttendanceRec(workerId = "w1", date = "2026-05-27", status = "halfday")
  )}
  
  val labourPayments = remember { mutableStateListOf<LabourPmt>(
    LabourPmt(workerId = "w1", amount = 1500.0, type = "advance", date = "2026-05-20", notes = "Emergency advance")
  )}
  
  val customers = remember { mutableStateListOf<LedgerCust>(
    LedgerCust(id = "c1", name = "Verma Ji Kirana", mobile = "9988776655", address = "Sector 15 Market")
  )}
  
  val ledgerTransactions = remember { mutableStateListOf<LedgerTx>(
    LedgerTx(customerId = "c1", amount = 3500.0, type = "credit", date = "2026-05-05", notes = "Grocery supply"),
    LedgerTx(customerId = "c1", amount = 2000.0, type = "debit", date = "2026-05-15", notes = "UPI cash payment")
  )}
  
  val udhaarEntries = remember { mutableStateListOf<UdhaarLending>(
    UdhaarLending(id = "u1", type = "lent", personName = "Ramesh Sharma", amount = 15000.0, interestRate = 2.0, interestType = "simple", startDate = "2026-04-01", dueDate = "2026-08-01", notes = "School fee support")
  )}

  // Core Math computations
  val stats = remember(personalTransactions, activeAccount, udhaarEntries, ledgerTransactions) {
    val txs = personalTransactions.filter { it.account == activeAccount }
    val income = txs.filter { it.type == "income" }.sumOf { it.amount }
    val expense = txs.filter { it.type == "expense" }.sumOf { it.amount }
    val balance = income - expense
    
    val pendingLent = udhaarEntries.filter { it.type == "lent" && it.status == "pending" }.sumOf { it.amount }
    val pendingBorrowed = udhaarEntries.filter { it.type == "borrowed" && it.status == "pending" }.sumOf { it.amount }
    
    val totalReceivableLedger = ledgerTransactions.sumOf { if (it.type == "credit") it.amount else -it.amount }

    object {
      val incomeVal = income
      val expenseVal = expense
      val balanceVal = balance
      val lentVal = pendingLent
      val borrowedVal = pendingBorrowed
      val ledgerVal = totalReceivableLedger
    }
  }

  Scaffold(
    topBar = {
      if (currentScreen != MobileScreen.SPLASH && currentScreen != MobileScreen.ONBOARDING && currentScreen != MobileScreen.AUTH && currentScreen != MobileScreen.BIOMETRIC) {
        TopAppBar(
          title = {
            Text(
              text = "Hisab Kitab",
              fontWeight = FontWeight.ExtraBold,
              fontSize = 18.sp
            )
          },
          actions = {
            IconButton(onClick = onToggleTheme) {
              Icon(
                imageVector = if (isDarkTheme) Icons.Default.LightMode else Icons.Default.DarkMode,
                contentDescription = "Toggle Theme"
              )
            }
            IconButton(onClick = { currentScreen = MobileScreen.SETTINGS }) {
              Icon(imageVector = Icons.Default.Settings, contentDescription = "Settings")
            }
          },
          colors = TopAppBarDefaults.topAppBarColors(
            containerColor = MaterialTheme.colorScheme.surface,
            titleContentColor = MaterialTheme.colorScheme.onSurface
          )
        )
      }
    },
    bottomBar = {
      if (currentScreen != MobileScreen.SPLASH && currentScreen != MobileScreen.ONBOARDING && currentScreen != MobileScreen.AUTH && currentScreen != MobileScreen.BIOMETRIC) {
        NavigationBar(
          containerColor = MaterialTheme.colorScheme.surface
        ) {
          NavigationBarItem(
            selected = currentScreen == MobileScreen.DASHBOARD,
            onClick = { currentScreen = MobileScreen.DASHBOARD },
            icon = { Icon(Icons.Default.Home, contentDescription = "Home") },
            label = { Text("Home", fontSize = 10.sp) }
          )
          NavigationBarItem(
            selected = currentScreen == MobileScreen.LENDEN,
            onClick = { currentScreen = MobileScreen.LENDEN },
            icon = { Icon(Icons.Default.List, contentDescription = "Len Den") },
            label = { Text("Len Den", fontSize = 10.sp) }
          )
          NavigationBarItem(
            selected = currentScreen == MobileScreen.REPORTS,
            onClick = { currentScreen = MobileScreen.REPORTS },
            icon = { Icon(Icons.Default.Assessment, contentDescription = "Reports") },
            label = { Text("Reports", fontSize = 10.sp) }
          )
          NavigationBarItem(
            selected = currentScreen == MobileScreen.SETTINGS,
            onClick = { currentScreen = MobileScreen.SETTINGS },
            icon = { Icon(Icons.Default.Person, contentDescription = "Settings") },
            label = { Text("Settings", fontSize = 10.sp) }
          )
        }
      }
    }
  ) { paddingValues ->
    
    Box(
      modifier = Modifier
        .fillMaxSize()
        .background(MaterialTheme.colorScheme.background)
        .padding(paddingValues)
    ) {
      
      when (currentScreen) {
        
        // --- SPLASH SCREEN ROUTE ---
        MobileScreen.SPLASH -> {
          Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
          ) {
            Column(
              horizontalAlignment = Alignment.CenterHorizontally,
              verticalArrangement = Arrangement.Center,
              modifier = Modifier.padding(24.dp)
            ) {
              Box(
                modifier = Modifier
                  .size(90.dp)
                  .clip(RoundedCornerShape(24.dp))
                  .background(MaterialTheme.colorScheme.primary)
                  .padding(16.dp),
                contentAlignment = Alignment.Center
              ) {
                Icon(
                  imageVector = Icons.Default.Book,
                  contentDescription = "Logo",
                  tint = Color.White,
                  modifier = Modifier.size(48.dp)
                )
              }
              Spacer(modifier = Modifier.height(24.dp))
              Text(
                text = "HISAB KITAB",
                fontSize = 28.sp,
                fontWeight = FontWeight.Black,
                letterSpacing = 1.sp,
                color = MaterialTheme.colorScheme.onBackground
              )
              Text(
                text = "Your Smart Digital Ledger Book",
                fontSize = 12.sp,
                color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f),
                modifier = Modifier.padding(top = 4.dp)
              )
              
              Spacer(modifier = Modifier.height(60.dp))
              Button(
                onClick = { currentScreen = MobileScreen.ONBOARDING },
                shape = RoundedCornerShape(14.dp)
              ) {
                Text("Get Started ⚡")
              }
            }
          }
        }

        // --- ONBOARDING ROUTE ---
        MobileScreen.ONBOARDING -> {
          Column(
            modifier = Modifier
              .fillMaxSize()
              .padding(24.dp),
            verticalArrangement = Arrangement.SpaceBetween,
            horizontalAlignment = Alignment.CenterHorizontally
          ) {
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.SpaceBetween,
              verticalAlignment = Alignment.CenterVertically
            ) {
              Text(
                text = "Hisab Kitab",
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.primary,
                fontSize = 16.sp
              )
              TextButton(onClick = { currentScreen = MobileScreen.AUTH }) {
                Text("Skip", color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f))
              }
            }

            Column(
              horizontalAlignment = Alignment.CenterHorizontally,
              modifier = Modifier.padding(horizontal = 16.dp)
            ) {
              Box(
                modifier = Modifier
                  .size(100.dp)
                  .clip(CircleShape)
                  .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.1f)),
                contentAlignment = Alignment.Center
              ) {
                Icon(
                  imageVector = Icons.Default.Analytics,
                  contentDescription = "Intro",
                  tint = MaterialTheme.colorScheme.primary,
                  modifier = Modifier.size(48.dp)
                )
              }
              Spacer(modifier = Modifier.height(30.dp))
              Text(
                text = "Ditch Paper Books",
                fontSize = 22.sp,
                fontWeight = FontWeight.ExtraBold,
                textAlign = TextAlign.Center,
                color = MaterialTheme.colorScheme.onBackground
              )
              Spacer(modifier = Modifier.height(10.dp))
              Text(
                text = "Simultaneously manage personal expenses, roommate split bills, labour wages attendance, and retail customer credit ledgers securely.",
                fontSize = 13.sp,
                textAlign = TextAlign.Center,
                color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f)
              )
            }

            Column(
              horizontalAlignment = Alignment.CenterHorizontally,
              modifier = Modifier.fillMaxWidth()
            ) {
              Row(
                horizontalArrangement = Arrangement.Center,
                modifier = Modifier.padding(bottom = 20.dp)
              ) {
                Box(modifier = Modifier.size(16.dp, 6.dp).clip(RoundedCornerShape(3.dp)).background(MaterialTheme.colorScheme.primary))
                Spacer(modifier = Modifier.width(6.dp))
                Box(modifier = Modifier.size(6.dp).clip(CircleShape).background(MaterialTheme.colorScheme.onBackground.copy(alpha = 0.2f)))
                Spacer(modifier = Modifier.width(6.dp))
                Box(modifier = Modifier.size(6.dp).clip(CircleShape).background(MaterialTheme.colorScheme.onBackground.copy(alpha = 0.2f)))
              }
              
              Button(
                onClick = { currentScreen = MobileScreen.AUTH },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp)
              ) {
                Text("Continue")
              }
            }
          }
        }

        // --- AUTH SCREEN ROUTE ---
        MobileScreen.AUTH -> {
          Column(
            modifier = Modifier
              .fillMaxSize()
              .padding(24.dp),
            verticalArrangement = Arrangement.SpaceBetween
          ) {
            Column {
              Text(
                text = "Secure Register",
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onBackground
              )
              Text(
                text = "Verify your cellular mobile number to back up data.",
                fontSize = 12.sp,
                color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f),
                modifier = Modifier.padding(top = 4.dp)
              )

              Spacer(modifier = Modifier.height(30.dp))
              
              Text(
                text = "MOBILE PHONE NUMBER",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.5f),
                modifier = Modifier.padding(bottom = 6.dp)
              )
              Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
              ) {
                OutlinedTextField(
                  value = "+91",
                  onValueChange = {},
                  enabled = false,
                  modifier = Modifier.width(70.dp),
                  shape = RoundedCornerShape(12.dp)
                )
                OutlinedTextField(
                  value = "9898989898",
                  onValueChange = {},
                  modifier = Modifier.fillMaxWidth(),
                  placeholder = { Text("Enter 10-digit number") },
                  shape = RoundedCornerShape(12.dp),
                  keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone)
                )
              }
            }

            Column(
              verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
              Button(
                onClick = { currentScreen = MobileScreen.BIOMETRIC },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp)
              ) {
                Text("Verify Mobile & Get OTP")
              }
              
              Text(
                text = "— OR —",
                fontSize = 11.sp,
                color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.4f),
                modifier = Modifier.fillMaxWidth(),
                textAlign = TextAlign.Center
              )

              OutlinedButton(
                onClick = { currentScreen = MobileScreen.BIOMETRIC },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp)
              ) {
                Text("Sign In with Google Account")
              }
            }
          }
        }

        // --- BIOMETRIC ROUTE ---
        MobileScreen.BIOMETRIC -> {
          Box(
            modifier = Modifier
              .fillMaxSize()
              .padding(24.dp),
            contentAlignment = Alignment.Center
          ) {
            Column(
              horizontalAlignment = Alignment.CenterHorizontally,
              verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
              Icon(
                imageVector = Icons.Default.Lock,
                contentDescription = "Lock",
                tint = MaterialTheme.colorScheme.primary,
                modifier = Modifier.size(54.dp)
              )
              Text(
                text = "Biometric Verification",
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold
              )
              Text(
                text = "Tap to simulate PIN bypass or fingerprint authentication lock.",
                fontSize = 12.sp,
                textAlign = TextAlign.Center,
                color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f)
              )
              
              Spacer(modifier = Modifier.height(20.dp))
              
              Button(
                onClick = { currentScreen = MobileScreen.DASHBOARD },
                shape = RoundedCornerShape(14.dp)
              ) {
                Text("Simulate App Unlock")
              }
            }
          }
        }

        // --- MOBILE UNIFIED DASHBOARD ROUTE ---
        MobileScreen.DASHBOARD -> {
          LazyColumn(
            modifier = Modifier
              .fillMaxSize()
              .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
          ) {
            // Profile & Account Type Selection Row
            item {
              Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
              ) {
                Row(
                  verticalAlignment = Alignment.CenterVertically,
                  horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                  Box(
                    modifier = Modifier
                      .size(38.dp)
                      .clip(CircleShape)
                      .background(MaterialTheme.colorScheme.primary),
                    contentAlignment = Alignment.Center
                  ) {
                    Text("GA", color = Color.White, fontWeight = FontWeight.Bold)
                  }
                  Column {
                    Text("Gaurav Aggarwal", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                    Text("Pro Account Plan", fontSize = 10.sp, color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f))
                  }
                }
                
                // Account selector dropdown mockup
                Row(
                  modifier = Modifier
                    .clip(RoundedCornerShape(8.dp))
                    .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.1f))
                    .clickable { 
                      activeAccount = if (activeAccount == "personal") "business" else "personal"
                    }
                    .padding(horizontal = 8.dp, vertical = 4.dp),
                  verticalAlignment = Alignment.CenterVertically
                ) {
                  Text(
                    text = activeAccount.uppercase(),
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary
                  )
                  Icon(Icons.Default.ArrowDropDown, contentDescription = "Select", tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(16.dp))
                }
              }
            }

            // Balance Display Card
            item {
              Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primary)
              ) {
                Column(
                  modifier = Modifier.padding(20.dp)
                ) {
                  Text(
                    text = "Total Cash Balance",
                    color = Color.White.copy(alpha = 0.7f),
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold
                  )
                  Text(
                    text = if (hideBalances) "••••••" else "₹${stats.balanceVal.toLocaleString()}",
                    color = Color.White,
                    fontSize = 28.sp,
                    fontWeight = FontWeight.Black,
                    modifier = Modifier.padding(top = 4.dp)
                  )

                  Row(
                    modifier = Modifier
                      .fillMaxWidth()
                      .padding(top = 20.dp)
                      .border(1.dp, Color.White.copy(alpha = 0.15f), RoundedCornerShape(12.dp))
                      .padding(12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween
                  ) {
                    Column {
                      Text("Monthly Income", fontSize = 9.sp, color = Color.White.copy(alpha = 0.7f))
                      Text("₹${stats.incomeVal.toLocaleString()}", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Color(0xFF4ADE80))
                    }
                    Column {
                      Text("Expenses Paid", fontSize = 9.sp, color = Color.White.copy(alpha = 0.7f))
                      Text("₹${stats.expenseVal.toLocaleString()}", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Color(0xFFF87171))
                    }
                  }
                }
              }
            }

            // Secondary receivables stats display
            item {
              Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
              ) {
                Card(
                  modifier = Modifier.weight(1f),
                  shape = RoundedCornerShape(16.dp)
                ) {
                  Column(Modifier.padding(12.dp)) {
                    Text("Lent Udhaar", fontSize = 9.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
                    Text("₹${stats.lentVal.toLocaleString()}", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.secondary)
                  }
                }
                Card(
                  modifier = Modifier.weight(1f),
                  shape = RoundedCornerShape(16.dp)
                ) {
                  Column(Modifier.padding(12.dp)) {
                    Text("Bahi Khata Ledger", fontSize = 9.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
                    Text("₹${stats.ledgerVal.toLocaleString()}", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                  }
                }
              }
            }

            // Core modules quick grid launcher
            item {
              Column {
                Text(
                  text = "CORE MODULES",
                  fontSize = 11.sp,
                  fontWeight = FontWeight.Bold,
                  color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.5f),
                  modifier = Modifier.padding(bottom = 10.dp)
                )
                
                Row(
                  modifier = Modifier.fillMaxWidth(),
                  horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                  ModuleGridItem("Expenses", Icons.Default.Wallet, Color(0xFF2563EB), modifier = Modifier.weight(1f)) { currentScreen = MobileScreen.EXPENSES }
                  ModuleGridItem("Roommates", Icons.Default.Group, Color(0xFF10B981), modifier = Modifier.weight(1f)) { currentScreen = MobileScreen.ROOMMATES }
                  ModuleGridItem("Labour", Icons.Default.Work, Color(0xFFE11D48), modifier = Modifier.weight(1f)) { currentScreen = MobileScreen.LABOUR }
                }
                Spacer(modifier = Modifier.height(8.dp))
                Row(
                  modifier = Modifier.fillMaxWidth(),
                  horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                  ModuleGridItem("Bahi Khata", Icons.Default.Book, Color(0xFF7C3AED), modifier = Modifier.weight(1f)) { currentScreen = MobileScreen.BAHIKHATA }
                  ModuleGridItem("Udhaar Book", Icons.Default.Payments, Color(0xFFF59E0B), modifier = Modifier.weight(1f)) { currentScreen = MobileScreen.UDHAAR }
                  ModuleGridItem("Reports Book", Icons.Default.Assessment, Color(0xFF22C55E), modifier = Modifier.weight(1f)) { currentScreen = MobileScreen.REPORTS }
                }
              }
            }

            // Recent activity lists
            item {
              Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
              ) {
                Text(
                  text = "RECENT TRANSACTIONS",
                  fontSize = 11.sp,
                  fontWeight = FontWeight.Bold,
                  color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.5f)
                )
                Text(
                  text = "See All",
                  fontSize = 11.sp,
                  fontWeight = FontWeight.Bold,
                  color = MaterialTheme.colorScheme.primary,
                  modifier = Modifier.clickable { currentScreen = MobileScreen.LENDEN }
                )
              }
            }

            items(personalTransactions.take(3)) { tx ->
              Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp)
              ) {
                Row(
                  modifier = Modifier.padding(12.dp),
                  horizontalArrangement = Arrangement.SpaceBetween,
                  verticalAlignment = Alignment.CenterVertically
                ) {
                  Row(
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                    verticalAlignment = Alignment.CenterVertically
                  ) {
                    Box(
                      modifier = Modifier
                        .size(32.dp)
                        .clip(CircleShape)
                        .background(if (tx.type == "income") Color(0xFF4ADE80).copy(alpha = 0.15f) else Color(0xFFF87171).copy(alpha = 0.15f)),
                      contentAlignment = Alignment.Center
                    ) {
                      Icon(
                        imageVector = if (tx.type == "income") Icons.Default.ArrowDownward else Icons.Default.ArrowUpward,
                        contentDescription = null,
                        tint = if (tx.type == "income") Color(0xFF22C55E) else Color(0xFFEF4444),
                        modifier = Modifier.size(16.dp)
                      )
                    }
                    Column {
                      Text(tx.notes.ifEmpty { tx.category }, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                      Text("${tx.category} • ${tx.date}", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
                    }
                  }
                  Text(
                    text = "${if (tx.type == "income") "+" else "-"}₹${tx.amount.toInt()}",
                    fontWeight = FontWeight.ExtraBold,
                    fontSize = 14.sp,
                    color = if (tx.type == "income") Color(0xFF22C55E) else Color(0xFFEF4444)
                  )
                }
              }
            }
          }
        }

        // --- EXPENSES MODULE SCREEN ---
        MobileScreen.EXPENSES -> {
          var amountInput by remember { mutableStateOf("") }
          var notesInput by remember { mutableStateOf("") }
          var categoryInput by remember { mutableStateOf("Food") }
          var typeInput by remember { mutableStateOf("expense") }

          Column(
            modifier = Modifier
              .fillMaxSize()
              .padding(16.dp)
          ) {
            Row(
              verticalAlignment = Alignment.CenterVertically,
              modifier = Modifier.padding(bottom = 16.dp)
            ) {
              IconButton(onClick = { currentScreen = MobileScreen.DASHBOARD }) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Back")
              }
              Text("Personal Expenses Book", fontWeight = FontWeight.Bold, fontSize = 18.sp)
            }

            Card(
              modifier = Modifier.fillMaxWidth(),
              shape = RoundedCornerShape(16.dp)
            ) {
              Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                
                // Income vs Expense Tab selector mockup
                Row(
                  modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(8.dp))
                    .background(MaterialTheme.colorScheme.background)
                    .padding(2.dp)
                ) {
                  Box(
                    modifier = Modifier
                      .weight(1f)
                      .clip(RoundedCornerShape(6.dp))
                      .background(if (typeInput == "expense") MaterialTheme.colorScheme.primary else Color.Transparent)
                      .clickable { typeInput = "expense" }
                      .padding(vertical = 8.dp),
                    contentAlignment = Alignment.Center
                  ) {
                    Text("EXPENSE", color = if (typeInput == "expense") Color.White else MaterialTheme.colorScheme.onBackground, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                  }
                  Box(
                    modifier = Modifier
                      .weight(1f)
                      .clip(RoundedCornerShape(6.dp))
                      .background(if (typeInput == "income") MaterialTheme.colorScheme.primary else Color.Transparent)
                      .clickable { typeInput = "income" }
                      .padding(vertical = 8.dp),
                    contentAlignment = Alignment.Center
                  ) {
                    Text("INCOME", color = if (typeInput == "income") Color.White else MaterialTheme.colorScheme.onBackground, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                  }
                }

                OutlinedTextField(
                  value = amountInput,
                  onValueChange = { amountInput = it },
                  label = { Text("Amount (₹)") },
                  modifier = Modifier.fillMaxWidth(),
                  keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                  shape = RoundedCornerShape(12.dp)
                )

                OutlinedTextField(
                  value = notesInput,
                  onValueChange = { notesInput = it },
                  label = { Text("Payment notes remarks") },
                  modifier = Modifier.fillMaxWidth(),
                  shape = RoundedCornerShape(12.dp)
                )

                Button(
                  onClick = {
                    val amt = amountInput.toDoubleOrNull()
                    if (amt != null) {
                      personalTransactions.add(0, PersonalTx(
                        amount = amt,
                        type = typeInput,
                        category = categoryInput,
                        notes = notesInput,
                        date = "2026-05-30",
                        paymentMethod = "UPI",
                        account = activeAccount
                      ))
                      amountInput = ""
                      notesInput = ""
                    }
                  },
                  modifier = Modifier.fillMaxWidth(),
                  shape = RoundedCornerShape(12.dp)
                ) {
                  Text("Record Transaction")
                }
              }
            }

            Spacer(modifier = Modifier.height(16.dp))
            Text("Logged Transactions", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.5f))
            Spacer(modifier = Modifier.height(8.dp))

            LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
              items(personalTransactions) { tx ->
                Card(modifier = Modifier.fillMaxWidth()) {
                  Row(Modifier.padding(12.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                    Column {
                      Text(tx.notes.ifEmpty { tx.category }, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                      Text("${tx.category} • ${tx.date}", fontSize = 9.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
                    }
                    Text(
                      text = "${if (tx.type == "income") "+" else "-"}₹${tx.amount.toInt()}",
                      fontWeight = FontWeight.Bold,
                      color = if (tx.type == "income") Color(0xFF22C55E) else Color(0xFFEF4444),
                      fontSize = 13.sp
                    )
                  }
                }
              }
            }
          }
        }

        // --- ROOMMATE SPLITTER SCREEN MODULE ---
        MobileScreen.ROOMMATES -> {
          var selectedGroup by remember { mutableStateOf<RoommateGrp?>(null) }
          var billAmtInput by remember { mutableStateOf("") }
          var billDescInput by remember { mutableStateOf("") }

          Column(
            modifier = Modifier
              .fillMaxSize()
              .padding(16.dp)
          ) {
            Row(
              verticalAlignment = Alignment.CenterVertically,
              modifier = Modifier.padding(bottom = 16.dp)
            ) {
              IconButton(onClick = { 
                if (selectedGroup != null) selectedGroup = null else currentScreen = MobileScreen.DASHBOARD 
              }) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Back")
              }
              Text(
                text = selectedGroup?.name ?: "Roommate Shared Sheets",
                fontWeight = FontWeight.Bold,
                fontSize = 18.sp
              )
            }

            if (selectedGroup == null) {
              LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                items(roommateGroups) { grp ->
                  Card(
                    modifier = Modifier
                      .fillMaxWidth()
                      .clickable { selectedGroup = grp },
                    shape = RoundedCornerShape(16.dp)
                  ) {
                    Row(Modifier.padding(16.dp), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                      Column {
                        Text(grp.name, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                        Text(grp.members.joinToString(", "), fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
                      }
                      Icon(Icons.Default.ChevronRight, contentDescription = "Open")
                    }
                  }
                }
              }
            } else {
              val currentGrp = selectedGroup!!
              val grpBills = sharedExpenses.filter { it.groupId == currentGrp.id }
              
              // Simple split ledger balances calculations
              val balances = remember(grpBills, currentGrp) {
                val balMap = currentGrp.members.associateWith { 0.0 }.toMutableMap()
                grpBills.forEach { bill ->
                  balMap[bill.paidBy] = balMap[bill.paidBy]!! + bill.amount
                  bill.splits.forEach { (mem, owe) ->
                    balMap[mem] = balMap[mem]!! - owe
                  }
                }
                balMap
              }

              LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                item {
                  Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp)
                  ) {
                    Column(Modifier.padding(16.dp)) {
                      Text("Outstanding Balances Ledger", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f))
                      Spacer(modifier = Modifier.height(10.dp))
                      balances.forEach { (mem, bal) ->
                        Row(Modifier.fillMaxWidth().padding(vertical = 4.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                          Text(mem, fontSize = 13.sp, fontWeight = FontWeight.Medium)
                          Text(
                            text = if (bal >= 0) "gets ₹${bal.toInt()}" else "owes ₹${Math.abs(bal).toInt()}",
                            fontWeight = FontWeight.Bold,
                            color = if (bal >= 0) Color(0xFF22C55E) else Color(0xFFEF4444),
                            fontSize = 13.sp
                          )
                        }
                      }
                    }
                  }
                }

                item {
                  Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp)
                  ) {
                    Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                      Text("Record Split Bill", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f))
                      
                      OutlinedTextField(
                        value = billAmtInput,
                        onValueChange = { billAmtInput = it },
                        label = { Text("Amount (₹)") },
                        modifier = Modifier.fillMaxWidth(),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                      )

                      OutlinedTextField(
                        value = billDescInput,
                        onValueChange = { billDescInput = it },
                        label = { Text("Description (e.g. Electricity)") },
                        modifier = Modifier.fillMaxWidth()
                      )

                      Button(
                        onClick = {
                          val amt = billAmtInput.toDoubleOrNull()
                          if (amt != null && billDescInput.isNotEmpty()) {
                            val split = amt / currentGrp.members.size
                            val splitMap = currentGrp.members.associateWith { split }
                            sharedExpenses.add(SharedBill(
                              groupId = currentGrp.id,
                              amount = amt,
                              description = billDescInput,
                              paidBy = "You",
                              date = "2026-05-30",
                              splits = splitMap
                            ))
                            billAmtInput = ""
                            billDescInput = ""
                          }
                        },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp)
                      ) {
                        Text("Add Equal Split Bill")
                      }
                    }
                  }
                }

                item {
                  Text("Expenses Log", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.5f))
                }

                items(grpBills) { bill ->
                  Card(modifier = Modifier.fillMaxWidth()) {
                    Row(Modifier.padding(12.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                      Column {
                        Text(bill.description, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        Text("Paid by ${bill.paidBy} • ${bill.date}", fontSize = 9.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
                      }
                      Text("₹${bill.amount.toInt()}", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                    }
                  }
                }
              }
            }
          }
        }

        // --- LABOUR LEDGER BOOK MODULE SCREEN ---
        MobileScreen.LABOUR -> {
          var selectedWorker by remember { mutableStateOf<SiteWorker?>(null) }
          var attendanceDateInput by remember { mutableStateOf("2026-05-28") }
          var wageAmtInput by remember { mutableStateOf("") }
          var wageNotesInput by remember { mutableStateOf("") }

          Column(
            modifier = Modifier
              .fillMaxSize()
              .padding(16.dp)
          ) {
            Row(
              verticalAlignment = Alignment.CenterVertically,
              modifier = Modifier.padding(bottom = 16.dp)
            ) {
              IconButton(onClick = { 
                if (selectedWorker != null) selectedWorker = null else currentScreen = MobileScreen.DASHBOARD 
              }) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Back")
              }
              Text(
                text = selectedWorker?.name ?: "Contract Wages & Labour",
                fontWeight = FontWeight.Bold,
                fontSize = 18.sp
              )
            }

            if (selectedWorker == null) {
              LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                items(siteWorkers) { worker ->
                  Card(
                    modifier = Modifier
                      .fillMaxWidth()
                      .clickable { selectedWorker = worker },
                    shape = RoundedCornerShape(16.dp)
                  ) {
                    Row(Modifier.padding(16.dp), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                      Column {
                        Text(worker.name, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                        Text("₹${worker.dailyWage.toInt()}/day • ${worker.site}", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
                      }
                      Icon(Icons.Default.ChevronRight, contentDescription = "Details")
                    }
                  }
                }
              }
            } else {
              val currentWorker = selectedWorker!!
              val atts = attendanceRecords.filter { it.workerId == currentWorker.id }
              
              // Attendance computations
              val presentDays = atts.count { it.status == "present" }
              val halfDays = atts.count { it.status == "halfday" }
              val totalEarned = (presentDays * currentWorker.dailyWage) + (halfDays * (currentWorker.dailyWage / 2))
              
              val pmts = labourPayments.filter { it.workerId == currentWorker.id }
              val advances = pmts.filter { it.type == "advance" }.sumOf { it.amount }
              val netWage = totalEarned - advances

              LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                item {
                  Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.1f))
                  ) {
                    Column(Modifier.padding(16.dp)) {
                      Text("Salary Statement", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = MaterialTheme.colorScheme.primary)
                      Spacer(modifier = Modifier.height(10.dp))
                      Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("Present / Half Days:")
                        Text("$presentDays Present • $halfDays Half", fontWeight = FontWeight.Bold)
                      }
                      Row(Modifier.fillMaxWidth().padding(top = 4.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("Total Earned:")
                        Text("₹${totalEarned.toInt()}", fontWeight = FontWeight.Bold)
                      }
                      Row(Modifier.fillMaxWidth().padding(top = 4.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("Advance Taken:")
                        Text("₹${advances.toInt()}", fontWeight = FontWeight.Bold, color = Color.Red)
                      }
                      Divider(modifier = Modifier.padding(vertical = 8.dp))
                      Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("Net Outstanding WAGES:", fontWeight = FontWeight.ExtraBold)
                        Text("₹${netWage.toInt()}", fontWeight = FontWeight.ExtraBold, color = if (netWage >= 0) Color(0xFF22C55E) else Color.Red)
                      }
                    }
                  }
                }

                item {
                  Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp)
                  ) {
                    Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                      Text("Daily Attendance Grid", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f))
                      Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                      ) {
                        Button(
                          onClick = {
                            attendanceRecords.add(AttendanceRec(currentWorker.id, attendanceDateInput, "present"))
                          },
                          colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF22C55E)),
                          modifier = Modifier.weight(1f)
                        ) { Text("Present ✔️", fontSize = 11.sp) }
                        
                        Button(
                          onClick = {
                            attendanceRecords.add(AttendanceRec(currentWorker.id, attendanceDateInput, "halfday"))
                          },
                          colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF59E0B)),
                          modifier = Modifier.weight(1f)
                        ) { Text("Half ⏳", fontSize = 11.sp) }
                      }
                    }
                  }
                }

                item {
                  Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp)
                  ) {
                    Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                      Text("Log advance / salary payment", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f))
                      
                      OutlinedTextField(
                        value = wageAmtInput,
                        onValueChange = { wageAmtInput = it },
                        label = { Text("Amount (₹)") },
                        modifier = Modifier.fillMaxWidth(),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                      )

                      Button(
                        onClick = {
                          val amt = wageAmtInput.toDoubleOrNull()
                          if (amt != null) {
                            labourPayments.add(LabourPmt(
                              workerId = currentWorker.id,
                              amount = amt,
                              type = "advance",
                              date = "2026-05-30",
                              notes = wageNotesInput.ifEmpty { "Weekly advance" }
                            ))
                            wageAmtInput = ""
                            wageNotesInput = ""
                          }
                        },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp)
                      ) {
                        Text("Register Advance Payment")
                      }
                    }
                  }
                }
              }
            }
          }
        }

        // --- BAHI KHATA MODULE SCREEN ---
        MobileScreen.BAHIKHATA -> {
          var selectedCust by remember { mutableStateOf<LedgerCust?>(null) }
          var ledgerAmtInput by remember { mutableStateOf("") }
          var ledgerNotesInput by remember { mutableStateOf("") }

          Column(
            modifier = Modifier
              .fillMaxSize()
              .padding(16.dp)
          ) {
            Row(
              verticalAlignment = Alignment.CenterVertically,
              modifier = Modifier.padding(bottom = 16.dp)
            ) {
              IconButton(onClick = { 
                if (selectedCust != null) selectedCust = null else currentScreen = MobileScreen.DASHBOARD 
              }) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Back")
              }
              Text(
                text = selectedCust?.name ?: "Bahi Khata Shop Ledger",
                fontWeight = FontWeight.Bold,
                fontSize = 18.sp
              )
            }

            if (selectedCust == null) {
              LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                items(customers) { cust ->
                  Card(
                    modifier = Modifier
                      .fillMaxWidth()
                      .clickable { selectedCust = cust },
                    shape = RoundedCornerShape(16.dp)
                  ) {
                    Row(Modifier.padding(16.dp), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                      Column {
                        Text(cust.name, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                        Text("${cust.mobile} • ${cust.address}", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
                      }
                      Icon(Icons.Default.ChevronRight, contentDescription = "Ledger")
                    }
                  }
                }
              }
            } else {
              val currentCust = selectedCust!!
              val ledgerTxs = ledgerTransactions.filter { it.customerId == currentCust.id }
              
              val customerBal = ledgerTxs.sumOf { if (it.type == "credit") it.amount else -it.amount }

              LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                item {
                  Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(
                      containerColor = if (customerBal >= 0) Color(0xFF22C55E).copy(alpha = 0.1f) else Color(0xFFEF4444).copy(alpha = 0.1f)
                    )
                  ) {
                    Column(Modifier.padding(16.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                      Text("Outstanding Balance receivable", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
                      Text(
                        text = if (customerBal >= 0) "You will get ₹${customerBal.toInt()}" else "You will pay ₹${Math.abs(customerBal).toInt()}",
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 20.sp,
                        color = if (customerBal >= 0) Color(0xFF22C55E) else Color(0xFFEF4444),
                        modifier = Modifier.padding(top = 4.dp)
                      )
                    }
                  }
                }

                item {
                  Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp)
                  ) {
                    Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                      Text("Record New credit/debit bill", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f))
                      
                      OutlinedTextField(
                        value = ledgerAmtInput,
                        onValueChange = { ledgerAmtInput = it },
                        label = { Text("Amount (₹)") },
                        modifier = Modifier.fillMaxWidth(),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                      )

                      OutlinedTextField(
                        value = ledgerNotesInput,
                        onValueChange = { ledgerNotesInput = it },
                        label = { Text("Items, goods supply description...") },
                        modifier = Modifier.fillMaxWidth()
                      )

                      Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                      ) {
                        Button(
                          onClick = {
                            val amt = ledgerAmtInput.toDoubleOrNull()
                            if (amt != null) {
                              ledgerTransactions.add(0, LedgerTx(
                                customerId = currentCust.id,
                                amount = amt,
                                type = "credit",
                                date = "2026-05-30",
                                notes = ledgerNotesInput.ifEmpty { "Goods bought on credit" }
                              ))
                              ledgerAmtInput = ""
                              ledgerNotesInput = ""
                            }
                          },
                          colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF22C55E)),
                          modifier = Modifier.weight(1f),
                          shape = RoundedCornerShape(12.dp)
                        ) { Text("You Gave") }

                        Button(
                          onClick = {
                            val amt = ledgerAmtInput.toDoubleOrNull()
                            if (amt != null) {
                              ledgerTransactions.add(0, LedgerTx(
                                customerId = currentCust.id,
                                amount = amt,
                                type = "debit",
                                date = "2026-05-30",
                                notes = ledgerNotesInput.ifEmpty { "Cash collection paid" }
                              ))
                              ledgerAmtInput = ""
                              ledgerNotesInput = ""
                            }
                          },
                          colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFEF4444)),
                          modifier = Modifier.weight(1f),
                          shape = RoundedCornerShape(12.dp)
                        ) { Text("You Got") }
                      }
                    }
                  }
                }

                item {
                  Text("Ledger History", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.5f))
                }

                items(ledgerTxs) { tx ->
                  Card(modifier = Modifier.fillMaxWidth()) {
                    Row(Modifier.padding(12.dp), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                      Column {
                        Text(tx.notes, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        Text(tx.date, fontSize = 9.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
                      }
                      Text(
                        text = "${if (tx.type == "credit") "+" else "-"}₹${tx.amount.toInt()}",
                        fontWeight = FontWeight.Bold,
                        color = if (tx.type == "credit") Color(0xFF22C55E) else Color(0xFFEF4444),
                        fontSize = 14.sp
                      )
                    }
                  }
                }
              }
            }
          }
        }

        // --- UDHAAR MODULE SCREEN ---
        MobileScreen.UDHAAR -> {
          LazyColumn(
            modifier = Modifier
              .fillMaxSize()
              .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
          ) {
            item {
              Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.padding(bottom = 8.dp)
              ) {
                IconButton(onClick = { currentScreen = MobileScreen.DASHBOARD }) {
                  Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                }
                Text("Udhaar & Personal Loans", fontWeight = FontWeight.Bold, fontSize = 18.sp)
              }
            }

            items(udhaarEntries) { udh ->
              val simpleInterest = udh.amount * (udh.interestRate / 100) * 2 // simulated 2 months
              val repayable = udh.amount + simpleInterest
              Card(modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(16.dp)) {
                Column(Modifier.padding(16.dp)) {
                  Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text(udh.personName, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                    Text(
                      text = "₹${repayable.toInt()}",
                      fontWeight = FontWeight.Black,
                      color = if (udh.type == "lent") Color(0xFF22C55E) else Color(0xFFEF4444),
                      fontSize = 16.sp
                    )
                  }
                  Text("Due Date: ${udh.dueDate}", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
                  Divider(modifier = Modifier.padding(vertical = 8.dp))
                  Text("Principal: ₹${udh.amount.toInt()} • Simple Interest (${udh.interestRate}%): ₹${simpleInterest.toInt()}", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f))
                  
                  Spacer(modifier = Modifier.height(10.dp))
                  OutlinedButton(
                    onClick = {},
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(8.dp)
                  ) {
                    Text("Send Auto WhatsApp Reminder 📲", fontSize = 11.sp)
                  }
                }
              }
            }
          }
        }

        // --- REPORTS SCREEN ---
        MobileScreen.REPORTS -> {
          Column(
            modifier = Modifier
              .fillMaxSize()
              .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
          ) {
            Row(
              verticalAlignment = Alignment.CenterVertically
            ) {
              IconButton(onClick = { currentScreen = MobileScreen.DASHBOARD }) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Back")
              }
              Text("Reports & PDF Statements", fontWeight = FontWeight.Bold, fontSize = 18.sp)
            }

            Card(modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(16.dp)) {
              Column(Modifier.padding(16.dp)) {
                Text("Export Statements", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                Text("Download your credit statement books directly in Excel spreadsheets or PDF ledger registers.", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f), modifier = Modifier.padding(top = 4.dp))
                Spacer(modifier = Modifier.height(16.dp))
                Row(
                  modifier = Modifier.fillMaxWidth(),
                  horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                  Button(onClick = {}, modifier = Modifier.weight(1f), shape = RoundedCornerShape(10.dp)) { Text("PDF Statement", fontSize = 11.sp) }
                  OutlinedButton(onClick = {}, modifier = Modifier.weight(1f), shape = RoundedCornerShape(10.dp)) { Text("Excel File", fontSize = 11.sp) }
                }
              }
            }
          }
        }

        // --- LEN DEN JOURNAL MODULE SCREEN ---
        MobileScreen.LENDEN -> {
          LazyColumn(
            modifier = Modifier
              .fillMaxSize()
              .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
          ) {
            item {
              Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = { currentScreen = MobileScreen.DASHBOARD }) {
                  Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                }
                Text("Consolidated Len Den Book", fontWeight = FontWeight.Bold, fontSize = 18.sp)
              }
            }

            items(personalTransactions) { tx ->
              Card(modifier = Modifier.fillMaxWidth()) {
                Row(Modifier.padding(12.dp), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                  Column {
                    Text(tx.notes, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                    Text("Personal Expense • ${tx.date}", fontSize = 9.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
                  }
                  Text(
                    text = "${if (tx.type == "income") "+" else "-"}₹${tx.amount.toInt()}",
                    fontWeight = FontWeight.Bold,
                    color = if (tx.type == "income") Color(0xFF22C55E) else Color(0xFFEF4444)
                  )
                }
              }
            }
          }
        }

        // --- SETTINGS MODULE ROUTE ---
        MobileScreen.SETTINGS -> {
          Column(
            modifier = Modifier
              .fillMaxSize()
              .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
          ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
              IconButton(onClick = { currentScreen = MobileScreen.DASHBOARD }) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Back")
              }
              Text("Preferences & Profiles", fontWeight = FontWeight.Bold, fontSize = 18.sp)
            }

            Card(modifier = Modifier.fillMaxWidth()) {
              Row(Modifier.padding(16.dp), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Column {
                  Text("App Theme Mode", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                  Text(if (isDarkTheme) "🌙 Dark Mode active" else "☀️ Light Mode active", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
                }
                Switch(checked = isDarkTheme, onCheckedChange = { onToggleTheme() })
              }
            }

            Card(modifier = Modifier.fillMaxWidth()) {
              Row(Modifier.padding(16.dp), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Column {
                  Text("Hide Account Balances", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                  Text("Privacy toggle on home dashboards", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
                }
                Switch(checked = hideBalances, onCheckedChange = { hideBalances = it })
              }
            }

            Button(
              onClick = { currentScreen = MobileScreen.AUTH },
              modifier = Modifier.fillMaxWidth(),
              shape = RoundedCornerShape(12.dp)
            ) {
              Text("Log Out / Switch Account")
            }
          }
        }
      }

    }
  }
}

// Module launcher grid box item
@Composable
fun ModuleGridItem(
  name: String,
  icon: androidx.compose.ui.graphics.vector.ImageVector,
  color: Color,
  modifier: Modifier = Modifier,
  onClick: () -> Unit
) {
  Card(
    modifier = modifier
      .height(84.dp)
      .clickable { onClick() },
    shape = RoundedCornerShape(16.dp),
    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
  ) {
    Column(
      modifier = Modifier
        .fillMaxSize()
        .padding(8.dp),
      verticalArrangement = Arrangement.Center,
      horizontalAlignment = Alignment.CenterHorizontally
    ) {
      Box(
        modifier = Modifier
          .size(34.dp)
          .clip(CircleShape)
          .background(color.copy(alpha = 0.12f)),
        contentAlignment = Alignment.Center
      ) {
        Icon(imageVector = icon, contentDescription = null, tint = color, modifier = Modifier.size(18.dp))
      }
      Spacer(modifier = Modifier.height(6.dp))
      Text(
        text = name,
        fontWeight = FontWeight.Bold,
        fontSize = 11.sp,
        maxLines = 1,
        overflow = TextOverflow.Ellipsis
      )
    }
  }
}

// Extension to format currency nicely
fun Double.toLocaleString(): String {
  return String.format("%,.2f", this).removeSuffix(".00")
}
