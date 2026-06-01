# Hisab Kitab - Reusable React Native & Expo Components

This directory contains production-ready, clean, and highly customizable React Native equivalent components for **Hisab Kitab**. These components are styled using **Tailwind CSS (NativeWind)**, optimized for smooth performance on both **Android & iOS**, and structured for standard modular navigation.

---

## Technical Stack Setup

To use these components in your mobile app, ensure your Expo/React Native project has the following dependencies:

```bash
# Core Navigation, State & Forms
npm install @react-navigation/native @react-navigation/bottom-tabs zustand react-hook-form

# Styling
npm install nativewind tailwindcss

# Icons & Animations
npm install lucide-react-native lottie-react-native

# Firebase Core & Firestore
npm install @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore
```

---

## Folder Structure

Copy these components into your React Native project directory structure:

- `/components`
  - [Dashboard.tsx](file:///c:/Users/msi/.gemini/antigravity/scratch/hisab%20kitab/native-components/Dashboard.tsx) - Unified Home Dashboard Screen.
  - [RoommateSplitter.tsx](file:///c:/Users/msi/.gemini/antigravity/scratch/hisab%20kitab/native-components/RoommateSplitter.tsx) - Shared sheets and expense splits.
  - [LabourLedger.tsx](file:///c:/Users/msi/.gemini/antigravity/scratch/hisab%20kitab/native-components/LabourLedger.tsx) - Worker attendance sheet & salary payroll logic.
  - [BahiKhata.tsx](file:///c:/Users/msi/.gemini/antigravity/scratch/hisab%20kitab/native-components/BahiKhata.tsx) - Shopkeeper digital credit ledger.
  - [UdhaarTracker.tsx](file:///c:/Users/msi/.gemini/antigravity/scratch/hisab%20kitab/native-components/UdhaarTracker.tsx) - Personal loans & interest engine.

---

## State Synchronicity
All components assume a global state store similar to `src/store.ts` defined in the Web project, but adapted with mobile-native Firebase bindings. Refer to the code comments inside each screen component for integration hints.
