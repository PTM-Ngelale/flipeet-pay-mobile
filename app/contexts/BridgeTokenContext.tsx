// contexts/TokenContext.tsx
import React, { createContext, ReactNode, useContext, useState } from "react";

interface Token {
  symbol: string;
  name: string;
  network: string;
  icon: React.ComponentType<any> | null;
}

interface TokenContextType {
  fromToken: Token;
  toToken: Token;
  setFromToken: (token: Token) => void;
  setToToken: (token: Token) => void;
}

const TokenContext = createContext<TokenContextType | undefined>(undefined);

const defaultFromToken: Token = {
  symbol: "USDC",
  name: "USDC",
  network: "Solana",
  icon: null,
};

const defaultToToken: Token = {
  symbol: "USDT",
  name: "USDT",
  network: "Base",
  icon: null,
};

export function BridgeTokenProvider({ children }: { children: ReactNode }) {
  const [fromToken, setFromToken] = useState<Token>(defaultFromToken);
  const [toToken, setToToken] = useState<Token>(defaultToToken);

  return (
    <TokenContext.Provider
      value={{ fromToken, toToken, setFromToken, setToToken }}
    >
      {children}
    </TokenContext.Provider>
  );
}

export function useBridgeToken() {
  const context = useContext(TokenContext);
  if (context === undefined) {
    throw new Error("useToken must be used within a TokenProvider");
  }
  return context;
}
