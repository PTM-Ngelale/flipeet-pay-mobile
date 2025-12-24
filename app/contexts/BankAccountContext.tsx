// app/contexts/BankAccountContext.tsx
import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import {
  fetchSavedBankAccounts,
  saveBankAccount,
  deleteBankAccount,
  setSelectedAccount as setSelectedAccountAction,
  BankAccount,
} from '../store/bankAccountSlice';

interface BankAccountContextType {
  savedAccounts: BankAccount[];
  selectedAccount: BankAccount | null;
  loading: boolean;
  error: string | null;
  addBankAccount: (account: Omit<BankAccount, 'id' | 'createdAt'>) => Promise<void>;
  removeBankAccount: (accountId: string) => Promise<void>;
  setSelectedAccount: (account: BankAccount | null) => void;
  refreshBankAccounts: () => Promise<void>;
}

const BankAccountContext = createContext<BankAccountContextType | undefined>(undefined);

export const BankAccountProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { savedAccounts, selectedAccount, loading, error } = useSelector(
    (state: RootState) => state.bankAccount
  );
  const { token } = useSelector((state: RootState) => state.auth);

  // Load saved bank accounts on mount
  useEffect(() => {
    if (token) {
      dispatch(fetchSavedBankAccounts());
    }
  }, [token, dispatch]);

  const addBankAccount = async (account: Omit<BankAccount, 'id' | 'createdAt'>) => {
    await dispatch(saveBankAccount(account)).unwrap();
  };

  const removeBankAccount = async (accountId: string) => {
    await dispatch(deleteBankAccount(accountId)).unwrap();
  };

  const setSelectedAccount = (account: BankAccount | null) => {
    dispatch(setSelectedAccountAction(account));
  };

  const refreshBankAccounts = async () => {
    await dispatch(fetchSavedBankAccounts()).unwrap();
  };

  return (
    <BankAccountContext.Provider
      value={{
        savedAccounts,
        selectedAccount,
        loading,
        error,
        addBankAccount,
        removeBankAccount,
        setSelectedAccount,
        refreshBankAccounts,
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

export type { BankAccount };