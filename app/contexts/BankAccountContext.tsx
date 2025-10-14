// contexts/BankAccountContext.tsx
import { createContext, ReactNode, useContext, useState } from "react";

interface BankAccount {
  bank: {
    id: number;
    name: string;
    code: string;
  };
  accountNumber: string;
  accountName: string;
}

interface BankAccountContextType {
  savedAccount: BankAccount | null;
  addBankAccount: (account: BankAccount) => void;
  removeBankAccount: () => void;
}

const BankAccountContext = createContext<BankAccountContextType>({
  savedAccount: null,
  addBankAccount: () => {},
  removeBankAccount: () => {},
});

export const BankAccountProvider = ({ children }: { children: ReactNode }) => {
  const [savedAccount, setSavedAccount] = useState<BankAccount | null>(null);

  const addBankAccount = (account: BankAccount) => {
    setSavedAccount(account);
  };

  const removeBankAccount = () => {
    setSavedAccount(null);
  };

  return (
    <BankAccountContext.Provider
      value={{
        savedAccount,
        addBankAccount,
        removeBankAccount,
      }}
    >
      {children}
    </BankAccountContext.Provider>
  );
};

export const useBankAccount = () => {
  const context = useContext(BankAccountContext);
  if (!context) {
    throw new Error("useBankAccount must be used within a BankAccountProvider");
  }
  return context;
};
