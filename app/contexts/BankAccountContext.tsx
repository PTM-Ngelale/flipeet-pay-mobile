// app/contexts/BankAccountContext.tsx
import React, { createContext, ReactNode, useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store";
import {
  BankAccount,
  deleteBankAccount,
  fetchSavedBankAccounts,
  saveBankAccount,
  setSelectedAccount as setSelectedAccountAction,
} from "../store/bankAccountSlice";

interface BankAccountContextType {
  savedAccounts: BankAccount[];
  selectedAccount: BankAccount | null;
  loading: boolean;
  error: string | null;
  addBankAccount: (
    account: Omit<BankAccount, "id" | "createdAt">
  ) => Promise<void>;
  removeBankAccount: (accountId: string) => Promise<void>;
  setSelectedAccount: (account: BankAccount | null) => void;
  refreshBankAccounts: () => Promise<void>;
}

const BankAccountContext = createContext<BankAccountContextType | undefined>(
  undefined
);

export const BankAccountProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { savedAccounts, selectedAccount, loading, error } = useSelector(
    (state: RootState) => state.bankAccount
  );
  const { token } = useSelector((state: RootState) => state.auth);

  console.log("[BankAccountContext] savedAccounts:", savedAccounts);
  console.log(
    "[BankAccountContext] savedAccounts.length:",
    savedAccounts.length
  );

  // Load saved bank accounts on mount (only if we don't have local accounts)
  useEffect(() => {
    if (token && savedAccounts.length === 0) {
      dispatch(fetchSavedBankAccounts());
    }
  }, [token, dispatch, savedAccounts.length]);

  // Auto-select the first account if none is selected and accounts exist
  useEffect(() => {
    if (savedAccounts.length > 0 && !selectedAccount) {
      dispatch(setSelectedAccountAction(savedAccounts[0]));
    }
  }, [savedAccounts, selectedAccount, dispatch]);

  const addBankAccount = async (
    account: Omit<BankAccount, "id" | "createdAt">
  ) => {
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
    throw new Error("useBankAccount must be used within a BankAccountProvider");
  }
  return context;
};

export type { BankAccount };
