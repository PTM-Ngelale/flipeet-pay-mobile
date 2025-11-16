import USDCIcon from "@/assets/images/usdc-icon.svg";
import USDTIcon from "@/assets/images/usdt-icon.svg";

export interface Asset {
  id: string;
  name: string;
  balance: number;
  usdValue: number;
  gain: number;
  icon: any;
}

export const ASSETS: Asset[] = [
  {
    id: "usdc",
    name: "USDC",
    balance: 0.5564,
    usdValue: 0.55,
    gain: 142500,
    icon: USDCIcon,
  },
  {
    id: "usdt",
    name: "USDT",
    balance: 0.5564,
    usdValue: 0.55,
    gain: -5000,
    icon: USDTIcon,
  },
];
