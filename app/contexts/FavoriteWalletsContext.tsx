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
import { apiRequest, normalizeAuthToken } from "../constants/api";
import { RootState } from "../store";

export interface FavoriteWallet {
  id: string;
  walletAddress: string;
  dateAdded: string;
  lastUsed: string;
  isFavorite: boolean;
}

interface FavoriteWalletsContextType {
  favoriteWallets: FavoriteWallet[];
  recentWallets: FavoriteWallet[];
  addFavoriteWallet: (walletAddress: string) => Promise<void>;
  removeFavoriteWallet: (walletId: string) => Promise<void>;
  isWalletFavorite: (walletAddress: string) => boolean;
  markWalletAsUsed: (walletAddress: string) => void;
  getWalletById: (walletId: string) => FavoriteWallet | undefined;
  toggleFavorite: (walletId: string) => Promise<void>;
  selectedWalletFromFavorite: string | null;
  setSelectedWalletFromFavorite: (walletAddress: string | null) => void;
  clearSelectedWalletFromFavorite: () => void;
  loading: boolean;
  refreshFavorites: () => Promise<void>;
}

const FavoriteWalletsContext = createContext<
  FavoriteWalletsContextType | undefined
>(undefined);

export const FavoriteWalletsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [favoriteWallets, setFavoriteWallets] = useState<FavoriteWallet[]>([]);
  const [recentWallets, setRecentWallets] = useState<FavoriteWallet[]>([]);
  const [selectedWalletFromFavorite, setSelectedWalletFromFavorite] = useState<
    string | null
  >(null);
  const [loading, setLoading] = useState(false);
  const token = useSelector((state: RootState) => state.auth.token);
  const normalizedToken = normalizeAuthToken(token);
  const STORAGE_KEY = "flipeet_favorite_wallets_v1";
  const WALLET_FEATURE_TYPES = ["wallet_address", "wallet"];

  const showToast = (message: string) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert(message);
    }
  };

  // Load cached favorites from storage then fetch from backend
  useEffect(() => {
    const loadFromStorage = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setFavoriteWallets(JSON.parse(raw));
      } catch (err) {
        console.error("Failed to load favorite wallets from storage:", err);
      }
    };

    loadFromStorage();
  }, []);

  useEffect(() => {
    if (normalizedToken) {
      fetchFavorites();
    }
  }, [normalizedToken]);

  useEffect(() => {
    updateRecentWallets();
  }, [favoriteWallets]);

  const fetchFavorites = async () => {
    if (!normalizedToken) return;

    try {
      setLoading(true);
      let lastError: any = null;

      for (const featureType of WALLET_FEATURE_TYPES) {
        try {
          const data = await apiRequest(
            `/transaction/favorites?featureType=${encodeURIComponent(
              featureType,
            )}&page=1&limit=100`,
            { method: "GET", token: normalizedToken },
          );
          console.log("Fetched favorite wallets:", data);

          const wallets = (data?.data?.favorites || data?.data || []).map(
            (item: any) => ({
              id: item.id || item._id,
              walletAddress: item.walletAddress || item.address || item.value,
              dateAdded:
                item.createdAt || item.dateAdded || new Date().toISOString(),
              lastUsed:
                item.lastUsed || item.updatedAt || new Date().toISOString(),
              isFavorite: true,
            }),
          );

          setFavoriteWallets(wallets);
          try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(wallets));
          } catch (err) {
            console.error("Failed to save favorite wallets to storage:", err);
          }
          return;
        } catch (err) {
          lastError = err;
        }
      }

      console.error("Failed to fetch favorite wallets:", lastError);
    } catch (error) {
      console.error("Error fetching favorite wallets:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateRecentWallets = () => {
    const sortedByRecent = [...favoriteWallets]
      .filter((wallet) => wallet.lastUsed)
      .sort(
        (a, b) =>
          new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime(),
      )
      .slice(0, 10);
    setRecentWallets(sortedByRecent);
  };

  const addFavoriteWallet = async (walletAddress: string) => {
    if (!normalizedToken) return;
    // Optimistic update
    const localId = `local-wallet-${Date.now()}`;
    const newWallet: FavoriteWallet = {
      id: localId,
      walletAddress: walletAddress.trim(),
      dateAdded: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
      isFavorite: true,
    };

    const previous = favoriteWallets;
    const updated = [newWallet, ...previous];
    setFavoriteWallets(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error("Failed to save favorite wallets to storage:", err);
    }

    try {
      let lastError: any = null;
      for (const featureType of WALLET_FEATURE_TYPES) {
        try {
          await apiRequest(`/transaction/favorites`, {
            method: "POST",
            token: normalizedToken,
            body: {
              featureType,
              walletAddress: walletAddress.trim(),
            },
          });
          await fetchFavorites();
          return;
        } catch (err) {
          lastError = err;
        }
      }

      console.error("Failed to add favorite wallet:", lastError);
      showToast("Failed to add favorite");
      setFavoriteWallets(previous);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(previous));
    } catch (error) {
      console.error("Error adding favorite wallet:", error);
      showToast("Failed to add favorite");
      setFavoriteWallets(previous);
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(previous));
      } catch (err) {
        console.error("Failed to save favorite wallets to storage:", err);
      }
    }
  };

  const removeFavoriteWallet = async (walletId: string) => {
    if (!normalizedToken) return;
    // Optimistic remove
    const previous = favoriteWallets;
    const updated = previous.filter((w) => w.id !== walletId);
    setFavoriteWallets(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error("Failed to save favorite wallets to storage:", err);
    }

    try {
      const response = await fetch(
        `https://api.pay.flipeet.io/api/v1/transaction/favorites/${walletId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${normalizedToken}`,
          },
        },
      );

      if (response.ok) {
        await fetchFavorites(); // Refresh the list
      } else {
        console.error("Failed to remove favorite wallet");
        showToast("Failed to remove favorite");
        setFavoriteWallets(previous);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(previous));
      }
    } catch (error) {
      console.error("Error removing favorite wallet:", error);
      showToast("Failed to remove favorite");
      setFavoriteWallets(previous);
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(previous));
      } catch (err) {
        console.error("Failed to save favorite wallets to storage:", err);
      }
    }
  };

  const toggleFavorite = async (walletId: string) => {
    const wallet = favoriteWallets.find((w) => w.id === walletId);
    if (!wallet) return;

    if (wallet.isFavorite) {
      await removeFavoriteWallet(walletId);
    } else {
      await addFavoriteWallet(wallet.walletAddress);
    }
  };

  const isWalletFavorite = (walletAddress: string) => {
    const foundWallet = favoriteWallets.find(
      (fav) => fav.walletAddress === walletAddress,
    );
    return foundWallet ? foundWallet.isFavorite : false;
  };

  const markWalletAsUsed = (walletAddress: string) => {
    const updatedWallets = favoriteWallets.map((fav) =>
      fav.walletAddress === walletAddress
        ? { ...fav, lastUsed: new Date().toISOString() }
        : fav,
    );
    setFavoriteWallets(updatedWallets);
    try {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedWallets));
    } catch (err) {
      console.error("Failed to save favorite wallets to storage:", err);
    }
  };

  const getWalletById = (walletId: string) => {
    return favoriteWallets.find((fav) => fav.id === walletId);
  };

  const clearSelectedWalletFromFavorite = () => {
    setSelectedWalletFromFavorite(null);
  };

  const refreshFavorites = async () => {
    await fetchFavorites();
  };

  const favoriteOnlyWallets = favoriteWallets.filter(
    (wallet) => wallet.isFavorite,
  );

  const value: FavoriteWalletsContextType = {
    favoriteWallets: favoriteOnlyWallets,
    recentWallets,
    addFavoriteWallet,
    removeFavoriteWallet,
    isWalletFavorite,
    markWalletAsUsed,
    getWalletById,
    toggleFavorite,
    selectedWalletFromFavorite,
    setSelectedWalletFromFavorite,
    clearSelectedWalletFromFavorite,
    loading,
    refreshFavorites,
  };

  return (
    <FavoriteWalletsContext.Provider value={value}>
      {children}
    </FavoriteWalletsContext.Provider>
  );
};

export const useFavoriteWallets = () => {
  const context = useContext(FavoriteWalletsContext);
  if (context === undefined) {
    throw new Error(
      "useFavoriteWallets must be used within a FavoriteWalletsProvider",
    );
  }
  return context;
};
