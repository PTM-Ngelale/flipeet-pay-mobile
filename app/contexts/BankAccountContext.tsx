// app/contexts/BankAccountContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  bankCode?: string;
}

interface BankAccountContextType {
  savedAccounts: BankAccount[];
  selectedAccount: BankAccount | null;
  addBankAccount: (account: Omit<BankAccount, 'id'>) => void;
  removeBankAccount: (accountId: string) => void;
  setSelectedAccount: (account: BankAccount | null) => void;
}

const BankAccountContext = createContext<BankAccountContextType | undefined>(undefined);

export const BankAccountProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [savedAccounts, setSavedAccounts] = useState<BankAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);

  const addBankAccount = (account: Omit<BankAccount, 'id'>) => {
    const newAccount: BankAccount = {
      ...account,
      id: Date.now().toString(), // Simple ID generation
    };
    setSavedAccounts(prev => [...prev, newAccount]);
    setSelectedAccount(newAccount);
  };

  const removeBankAccount = (accountId: string) => {
    setSavedAccounts(prev => prev.filter(account => account.id !== accountId));
    if (selectedAccount?.id === accountId) {
      setSelectedAccount(savedAccounts.length > 1 ? savedAccounts.find(acc => acc.id !== accountId) || null : null);
    }
  };

  return (
    <BankAccountContext.Provider
      value={{
        savedAccounts,
        selectedAccount,
        addBankAccount,
        removeBankAccount,
        setSelectedAccount,
      }}
    >
      {children}
    </BankAccountContext.Provider>
  );
};

export const useBankAccount = () => {
  const context = useContext(BankAccountContext);
  if (context === undefined) {
    throw new Error('useBankAccount must be used within a BankAccountProvider');
  }
  return context;
};