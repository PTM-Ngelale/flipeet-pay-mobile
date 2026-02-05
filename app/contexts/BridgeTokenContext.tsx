// contexts/TokenContext.tsx
import USDC from "@/assets/images/tokens/usdc.svg";
import USDT from "@/assets/images/tokens/usdt.svg";
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
  icon: React.ComponentType<any> | null;
}

interface TokenContextType {
  fromToken: Token;
  toToken: Token;
  setFromToken: (token: Token) => void;
  setToToken: (token: Token) => void;
}

const TokenContext = createContext<TokenContextType | undefined>(undefined);

export function BridgeTokenProvider({ children }: { children: ReactNode }) {
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
    if (!networkName) return "Solana";
    return networkName;
  };

  const tokenIconMap: Record<
    string,
    { symbol: string; name: string; icon: React.ComponentType<any> }
  > = {
    usdc: { symbol: "USDC", name: "USD Coin", icon: USDC },
    usdt: { symbol: "USDT", name: "Tether", icon: USDT },
  };

  const defaultFromToken: Token = {
    symbol: "USDC",
    name: "USD Coin",
    network: "Solana",
    icon: USDC,
  };

  const defaultToToken: Token = {
    symbol: "USDC",
    name: "USD Coin",
    network: "Solana",
    icon: USDC,
  };

  const [fromToken, setFromToken] = useState<Token>(defaultFromToken);
  const [toToken, setToToken] = useState<Token>(defaultToToken);

  useEffect(() => {
    if (balances && Array.isArray(balances) && balances.length > 0) {
      const preferred = balances.find((b: any) => {
        const symbol = (b.token || b.asset || "").toLowerCase();
        const network = normalizeNetworkId(b.network || "");
        return symbol === "usdc" && network === "solana";
      });

      const unique = balances.reduce((acc: any[], b: any) => {
        const symbol = (b.token || b.asset || "").toLowerCase();
        if (
          !acc.find((x) => (x.token || x.asset || "").toLowerCase() === symbol)
        ) {
          acc.push(b);
        }
        return acc;
      }, []);

      const first = preferred || unique[0];
      const second = unique.find((b) => b !== first) || first;

      const firstSymbol = (first?.token || first?.asset || "").toLowerCase();
      const secondSymbol = (second?.token || second?.asset || "").toLowerCase();
      const firstMeta = tokenIconMap[firstSymbol];
      const secondMeta = tokenIconMap[secondSymbol];

      setFromToken({
        symbol: String(
          first?.token || first?.asset || defaultFromToken.symbol,
        ).toUpperCase(),
        name: firstMeta?.name || first?.token || defaultFromToken.name,
        network: formatNetworkName(first?.network || defaultFromToken.network),
        icon: firstMeta?.icon || defaultFromToken.icon,
      });

      setToToken({
        symbol: String(
          second?.token || second?.asset || defaultToToken.symbol,
        ).toUpperCase(),
        name: secondMeta?.name || second?.token || defaultToToken.name,
        network: formatNetworkName(second?.network || defaultToToken.network),
        icon: secondMeta?.icon || defaultToToken.icon,
      });
    }
  }, [balances]);

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
