export interface Activity {
  id: string;
  type: "swap" | "received" | "sent";
  title: string;
  description: string;
  amount: string;
  secondaryAmount?: string;
  icon: any;
  date: string;
  amountColor: string;
}

export const ACTIVITIES: Activity[] = [
  {
    id: "1",
    type: "swap",
    title: "Swap successful",
    description: "USDC to NGN",
    amount: "-100 USDC",
    secondaryAmount: "+ N142,500",
    icon: require("@/assets/images/bnb-chain.png"),
    date: "June 9, 2025",
    amountColor: "#757B85",
  },
  {
    id: "2",
    type: "received",
    title: "Received",
    description: "From 7afm...5dMM",
    amount: "+360 USDC",
    icon: require("@/assets/images/bnb-chain.png"),
    date: "June 9, 2025",
    amountColor: "#34D058",
  },
];
