import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Alert, Platform, ToastAndroid } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../store";

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
  addFavoriteBank: (accountNumber: string, bankName: string) => Promise<void>;
  removeFavoriteBank: (bankId: string) => Promise<void>;
  isBankFavorite: (accountNumber: string) => boolean;
  markBankAsUsed: (accountNumber: string) => void;
  getBankById: (bankId: string) => FavoriteBank | undefined;
  toggleFavorite: (bankId: string) => Promise<void>;
  selectedBankFromFavorite: { accountNumber: string; bankName: string } | null;
  setSelectedBankFromFavorite: (
    bank: { accountNumber: string; bankName: string } | null,
  ) => void;
  clearSelectedBankFromFavorite: () => void;
  loading: boolean;
  refreshFavorites: () => Promise<void>;
}

const FavoriteBanksContext = createContext<
  FavoriteBanksContextType | undefined
>(undefined);

const FAVORITES_ENABLED = false;

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
  const [loading, setLoading] = useState(false);
  const token = useSelector((state: RootState) => state.auth.token);
  const STORAGE_KEY = "flipeet_favorite_banks_v1";

  const showToast = (message: string) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert(message);
    }
  };

  // Load cached favorites from local storage, then fetch from backend when token available
  useEffect(() => {
    if (!FAVORITES_ENABLED) return;
    const loadFromStorage = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as FavoriteBank[];
          setFavoriteBanks(parsed || []);
        }
      } catch (err) {}
    };

    loadFromStorage();
  }, []);

  useEffect(() => {
    if (!FAVORITES_ENABLED) return;
    if (token) {
      fetchFavorites();
    }
  }, [token]);

  useEffect(() => {
    if (!FAVORITES_ENABLED) return;
    updateRecentBanks();
  }, [favoriteBanks]);

  const fetchFavorites = async () => {
    if (!FAVORITES_ENABLED) return;
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch(
        "https://api.pay.flipeet.io/api/v1/transaction/favorites?featureType=bank_account&page=1&limit=100",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        // Map backend data to local format
        const banks = (data.data?.favorites || data.data || []).map(
          (item: any) => ({
            id: item.id || item._id,
            accountNumber: item.accountNumber || item.account || item.value,
            bankName: item.bankName || item.bank || "Bank",
            dateAdded:
              item.createdAt || item.dateAdded || new Date().toISOString(),
            lastUsed:
              item.lastUsed || item.updatedAt || new Date().toISOString(),
            isFavorite: true,
          }),
        );

        setFavoriteBanks(banks);
        try {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(banks));
        } catch (err) {}
      } else {
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const updateRecentBanks = () => {
    const sortedByRecent = [...favoriteBanks]
      .filter((bank) => bank.lastUsed)
      .sort(
        (a, b) =>
          new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime(),
      )
      .slice(0, 10);
    setRecentBanks(sortedByRecent);
  };

  const addFavoriteBank = async (
    accountNumber: string,
    bankName: string = "Selected Bank",
  ) => {
    if (!FAVORITES_ENABLED) return;
    if (!token) return;
    // Optimistic UI update: add locally first, persist, then call backend
    const localId = `local-${Date.now()}`;
    const newBank: FavoriteBank = {
      id: localId,
      accountNumber: accountNumber.trim(),
      bankName,
      dateAdded: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
      isFavorite: true,
    };

    const previous = favoriteBanks;
    const updated = [newBank, ...previous];
    setFavoriteBanks(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {}

    try {
      const response = await fetch(
        "https://api.pay.flipeet.io/api/v1/transaction/favorites",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            featureType: "bank_account",
            accountNumber: accountNumber.trim(),
            bankName,
          }),
        },
      );

      if (response.ok) {
        // Refresh from backend (server is source of truth)
        await fetchFavorites();
      } else {
        showToast("Failed to add favorite");
        // revert optimistic update
        setFavoriteBanks(previous);
        try {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(previous));
        } catch (err) {}
      }
    } catch (error) {
      setFavoriteBanks(previous);
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(previous));
      } catch (err) {}
    }
  };

  const removeFavoriteBank = async (bankId: string) => {
    if (!FAVORITES_ENABLED) return;
    if (!token) return;
    // Optimistic UI update: remove locally first
    const previous = favoriteBanks;
    const updated = previous.filter((b) => b.id !== bankId);
    setFavoriteBanks(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {}

    try {
      const response = await fetch(
        `https://api.pay.flipeet.io/api/v1/transaction/favorites/${bankId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        await fetchFavorites(); // Sync with backend
      } else {
        showToast("Failed to remove favorite");
        // revert optimistic update
        setFavoriteBanks(previous);
        try {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(previous));
        } catch (err) {}
      }
    } catch (error) {
      setFavoriteBanks(previous);
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(previous));
      } catch (err) {}
      showToast("Failed to add favorite");
    }
  };

  const toggleFavorite = async (bankId: string) => {
    const bank = favoriteBanks.find((b) => b.id === bankId);
    if (!bank) return;

    if (bank.isFavorite) {
      await removeFavoriteBank(bankId);
    } else {
      await addFavoriteBank(bank.accountNumber, bank.bankName);
    }
  };

  const isBankFavorite = (accountNumber: string) => {
    const foundBank = favoriteBanks.find(
      (fav) => fav.accountNumber === accountNumber,
    );
    return foundBank ? foundBank.isFavorite : false;
  };

  const markBankAsUsed = (accountNumber: string) => {
    if (!FAVORITES_ENABLED) return;
    const updatedBanks = favoriteBanks.map((fav) =>
      fav.accountNumber === accountNumber
        ? { ...fav, lastUsed: new Date().toISOString() }
        : fav,
    );
    setFavoriteBanks(updatedBanks);
    try {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedBanks));
    } catch (err) {}
  };

  const getBankById = (bankId: string) => {
    return favoriteBanks.find((fav) => fav.id === bankId);
  };

  const clearSelectedBankFromFavorite = () => {
    setSelectedBankFromFavorite(null);
  };

  const refreshFavorites = async () => {
    if (!FAVORITES_ENABLED) return;
    await fetchFavorites();
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
    loading,
    refreshFavorites,
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
      "useFavoriteBanks must be used within a FavoriteBanksProvider",
    );
  }
  return context;
};
