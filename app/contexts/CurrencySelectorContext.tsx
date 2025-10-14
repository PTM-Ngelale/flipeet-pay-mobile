// contexts/CurrencyContext.tsx
import React, { createContext, ReactNode, useContext, useState } from "react";

interface CurrencyContextType {
  savedCurrency: string; // Change from selectedCurrency to savedCurrency
  setSavedCurrency: (currency: string) => void; // Also update the setter name
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined
);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [savedCurrency, setSavedCurrency] = useState("NGN"); // Update state variable

  return (
    <CurrencyContext.Provider value={{ savedCurrency, setSavedCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
