// contexts/TokenContext.tsx
import React, { createContext, ReactNode, useContext, useState } from "react";

interface Token {
  symbol: string;
  name: string;
  network: string;
  balance: string;
  icon: React.ComponentType<any>;
}

interface TokenContextType {
  selectedToken: Token;
  setSelectedToken: (token: Token) => void;
}

const TokenContext = createContext<TokenContextType | undefined>(undefined);

const defaultToken: Token = {
  symbol: "USDC",
  name: "USD Coin",
  network: "Solana",
  balance: "0.00678",
  icon: () => null, // This will be replaced with actual icon
};

export function TokenProvider({ children }: { children: ReactNode }) {
  const [selectedToken, setSelectedToken] = useState<Token>(defaultToken);

  return (
    <TokenContext.Provider value={{ selectedToken, setSelectedToken }}>
      {children}
    </TokenContext.Provider>
  );
}

export function useToken() {
  const context = useContext(TokenContext);
  if (context === undefined) {
    throw new Error("useToken must be used within a TokenProvider");
  }
  return context;
}
