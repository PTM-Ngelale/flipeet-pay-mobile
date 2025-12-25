import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useSelector } from "react-redux";
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

  // Fetch favorites from backend on mount
  useEffect(() => {
    if (token) {
      fetchFavorites();
    }
  }, [token]);

  useEffect(() => {
    updateRecentWallets();
  }, [favoriteWallets]);

  const fetchFavorites = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch(
        "https://api.pay.flipeet.io/api/v1/transaction/favorites?featureType=wallet_address&page=1&limit=100",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Fetched favorite wallets:", data);

        // Map backend data to local format
        const wallets = (data.data?.favorites || data.data || []).map(
          (item: any) => ({
            id: item.id || item._id,
            walletAddress: item.walletAddress || item.address || item.value,
            dateAdded:
              item.createdAt || item.dateAdded || new Date().toISOString(),
            lastUsed:
              item.lastUsed || item.updatedAt || new Date().toISOString(),
            isFavorite: true,
          })
        );

        setFavoriteWallets(wallets);
      } else {
        console.error("Failed to fetch favorite wallets");
      }
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
          new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime()
      )
      .slice(0, 10);
    setRecentWallets(sortedByRecent);
  };

  const addFavoriteWallet = async (walletAddress: string) => {
    if (!token) return;

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
            featureType: "wallet_address",
            walletAddress: walletAddress.trim(),
          }),
        }
      );

      if (response.ok) {
        await fetchFavorites(); // Refresh the list
      } else {
        console.error("Failed to add favorite wallet");
      }
    } catch (error) {
      console.error("Error adding favorite wallet:", error);
    }
  };

  const removeFavoriteWallet = async (walletId: string) => {
    if (!token) return;

    try {
      const response = await fetch(
        `https://api.pay.flipeet.io/api/v1/transaction/favorites/${walletId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        await fetchFavorites(); // Refresh the list
      } else {
        console.error("Failed to remove favorite wallet");
      }
    } catch (error) {
      console.error("Error removing favorite wallet:", error);
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
      (fav) => fav.walletAddress === walletAddress
    );
    return foundWallet ? foundWallet.isFavorite : false;
  };

  const markWalletAsUsed = (walletAddress: string) => {
    const updatedWallets = favoriteWallets.map((fav) =>
      fav.walletAddress === walletAddress
        ? { ...fav, lastUsed: new Date().toISOString() }
        : fav
    );
    setFavoriteWallets(updatedWallets);
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
    (wallet) => wallet.isFavorite
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
      "useFavoriteWallets must be used within a FavoriteWalletsProvider"
    );
  }
  return context;
};
