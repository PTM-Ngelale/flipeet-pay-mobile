// contexts/TokenContext.tsx
import USDC from "@/assets/images/tokens/usdc.svg";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store";

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

export function TokenProvider({ children }: { children: ReactNode }) {
  const balances = useSelector((state: RootState) => state.auth.balances);

  const normalizeNetworkId = (networkName: string) => {
    const normalized = (networkName || "").toLowerCase().replace(/\s+/g, "-");
    if (
      normalized === "bnb-chain" ||
      normalized === "bnb" ||
      normalized === "bsc"
    ) {
      return "bnb-smart-chain";
    }
    return normalized;
  };

  const formatNetworkName = (networkName: string) => {
    const normalized = normalizeNetworkId(networkName);
    if (normalized === "solana") return "Solana";
    if (normalized === "base") return "Base";
    if (normalized === "bnb-smart-chain") return "BNB Smart Chain";
    if (!networkName) return defaultToken.network;
    return networkName;
  };

  const tokenIconMap: Record<
    string,
    { name: string; icon: React.ComponentType<any> }
  > = {
    usdc: { name: "USD Coin", icon: USDC },
  };

  const defaultToken: Token = {
    symbol: "USDC",
    name: "USD Coin",
    network: "Solana",
    balance: "0",
    icon: USDC,
  };

  const [selectedToken, setSelectedToken] = useState<Token>(defaultToken);

  useEffect(() => {
    if (balances && Array.isArray(balances) && balances.length > 0) {
      const preferred = balances.find((b: any) => {
        const symbol = (b.token || b.asset || "").toLowerCase();
        const network = normalizeNetworkId(b.network || "");
        return symbol === "usdc" && network === "solana";
      });
      const selected = preferred || balances[0];
      const selectedSymbol = (
        selected?.token ||
        selected?.asset ||
        ""
      ).toLowerCase();
      const tokenMeta = tokenIconMap[selectedSymbol];
      const displaySymbol = String(
        selected?.token || selected?.asset || defaultToken.symbol,
      ).toUpperCase();
      setSelectedToken({
        symbol: displaySymbol,
        name: tokenMeta?.name || selected?.token || defaultToken.name,
        network: formatNetworkName(selected?.network || defaultToken.network),
        balance: String(selected?.balance || "0"),
        icon: tokenMeta?.icon || defaultToken.icon,
      });
    }
  }, [balances]);

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
