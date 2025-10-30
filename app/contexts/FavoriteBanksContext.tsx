import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

export interface FavoriteBank {
  id: string;
  accountNumber: string;
  bankName: string;
  dateAdded: string;
  lastUsed: string;
  isFavorite: boolean;
}

interface FavoriteBanksContextType {
  favoriteBanks: FavoriteBank[];
  recentBanks: FavoriteBank[];
  addFavoriteBank: (accountNumber: string, bankName: string) => void;
  removeFavoriteBank: (bankId: string) => void;
  isBankFavorite: (accountNumber: string) => boolean;
  markBankAsUsed: (accountNumber: string) => void;
  getBankById: (bankId: string) => FavoriteBank | undefined;
  toggleFavorite: (bankId: string) => void;
  selectedBankFromFavorite: { accountNumber: string; bankName: string } | null;
  setSelectedBankFromFavorite: (
    bank: { accountNumber: string; bankName: string } | null
  ) => void;
  clearSelectedBankFromFavorite: () => void;
}

const FavoriteBanksContext = createContext<
  FavoriteBanksContextType | undefined
>(undefined);

const NIGERIAN_BANKS = [
  { id: 1, name: "Access Bank", code: "044" },
  { id: 2, name: "Citibank", code: "023" },
  { id: 3, name: "Diamond Bank", code: "063" },
  { id: 4, name: "Ecobank Nigeria", code: "050" },
  { id: 5, name: "Fidelity Bank", code: "070" },
  { id: 6, name: "First Bank of Nigeria", code: "011" },
  { id: 7, name: "First City Monument Bank", code: "214" },
  { id: 8, name: "Guaranty Trust Bank", code: "058" },
  { id: 9, name: "Heritage Bank", code: "030" },
  { id: 10, name: "Keystone Bank", code: "082" },
  { id: 11, name: "Polaris Bank", code: "076" },
  { id: 12, name: "Providus Bank", code: "101" },
  { id: 13, name: "Stanbic IBTC Bank", code: "221" },
  { id: 14, name: "Standard Chartered Bank", code: "068" },
  { id: 15, name: "Sterling Bank", code: "232" },
  { id: 16, name: "Suntrust Bank", code: "100" },
  { id: 17, name: "Union Bank of Nigeria", code: "032" },
  { id: 18, name: "United Bank for Africa", code: "033" },
  { id: 19, name: "Unity Bank", code: "215" },
  { id: 20, name: "Wema Bank", code: "035" },
  { id: 21, name: "Zenith Bank", code: "057" },
];

export const FavoriteBanksProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [favoriteBanks, setFavoriteBanks] = useState<FavoriteBank[]>([]);
  const [recentBanks, setRecentBanks] = useState<FavoriteBank[]>([]);
  const [selectedBankFromFavorite, setSelectedBankFromFavorite] = useState<{
    accountNumber: string;
    bankName: string;
  } | null>(null);

  useEffect(() => {
    updateRecentBanks();
  }, [favoriteBanks]);

  const updateRecentBanks = () => {
    const sortedByRecent = [...favoriteBanks]
      .filter((bank) => bank.lastUsed)
      .sort(
        (a, b) =>
          new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime()
      )
      .slice(0, 10);
    setRecentBanks(sortedByRecent);
  };

  const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const addFavoriteBank = (
    accountNumber: string,
    bankName: string = "Selected Bank"
  ) => {
    const existingBank = favoriteBanks.find(
      (fav) => fav.accountNumber === accountNumber
    );

    if (!existingBank) {
      const newFavorite: FavoriteBank = {
        id: generateId(),
        accountNumber: accountNumber.trim(),
        bankName,
        dateAdded: new Date().toISOString(),
        lastUsed: new Date().toISOString(),
        isFavorite: true,
      };
      const updatedBanks = [...favoriteBanks, newFavorite];
      setFavoriteBanks(updatedBanks);
    } else {
      const updatedBanks = favoriteBanks.map((fav) =>
        fav.accountNumber === accountNumber
          ? { ...fav, isFavorite: true, lastUsed: new Date().toISOString() }
          : fav
      );
      setFavoriteBanks(updatedBanks);
    }
  };

  const removeFavoriteBank = (bankId: string) => {
    const updatedBanks = favoriteBanks.filter((fav) => fav.id !== bankId);
    setFavoriteBanks(updatedBanks);
  };

  const toggleFavorite = (bankId: string) => {
    const updatedBanks = favoriteBanks.map((fav) =>
      fav.id === bankId ? { ...fav, isFavorite: !fav.isFavorite } : fav
    );
    setFavoriteBanks(updatedBanks);
  };

  const isBankFavorite = (accountNumber: string) => {
    const foundBank = favoriteBanks.find(
      (fav) => fav.accountNumber === accountNumber
    );
    return foundBank ? foundBank.isFavorite : false;
  };

  const markBankAsUsed = (accountNumber: string) => {
    const updatedBanks = favoriteBanks.map((fav) =>
      fav.accountNumber === accountNumber
        ? { ...fav, lastUsed: new Date().toISOString() }
        : fav
    );
    setFavoriteBanks(updatedBanks);
  };

  const getBankById = (bankId: string) => {
    return favoriteBanks.find((fav) => fav.id === bankId);
  };

  const clearSelectedBankFromFavorite = () => {
    setSelectedBankFromFavorite(null);
  };

  const favoriteOnlyBanks = favoriteBanks.filter((bank) => bank.isFavorite);

  const value: FavoriteBanksContextType = {
    favoriteBanks: favoriteOnlyBanks,
    recentBanks,
    addFavoriteBank,
    removeFavoriteBank,
    isBankFavorite,
    markBankAsUsed,
    getBankById,
    toggleFavorite,
    selectedBankFromFavorite,
    setSelectedBankFromFavorite,
    clearSelectedBankFromFavorite,
  };

  return (
    <FavoriteBanksContext.Provider value={value}>
      {children}
    </FavoriteBanksContext.Provider>
  );
};

export const useFavoriteBanks = () => {
  const context = useContext(FavoriteBanksContext);
  if (context === undefined) {
    throw new Error(
      "useFavoriteBanks must be used within a FavoriteBanksProvider"
    );
  }
  return context;
};
