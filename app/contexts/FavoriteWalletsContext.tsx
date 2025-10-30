import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

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
  addFavoriteWallet: (walletAddress: string) => void;
  removeFavoriteWallet: (walletId: string) => void;
  isWalletFavorite: (walletAddress: string) => boolean;
  markWalletAsUsed: (walletAddress: string) => void;
  getWalletById: (walletId: string) => FavoriteWallet | undefined;
  toggleFavorite: (walletId: string) => void;
  selectedWalletFromFavorite: string | null;
  setSelectedWalletFromFavorite: (walletAddress: string | null) => void;
  clearSelectedWalletFromFavorite: () => void;
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

  useEffect(() => {
    updateRecentWallets();
  }, [favoriteWallets]);

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

  const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const addFavoriteWallet = (walletAddress: string) => {
    const existingWallet = favoriteWallets.find(
      (fav) => fav.walletAddress === walletAddress
    );

    if (!existingWallet) {
      const newFavorite: FavoriteWallet = {
        id: generateId(),
        walletAddress: walletAddress.trim(),
        dateAdded: new Date().toISOString(),
        lastUsed: new Date().toISOString(),
        isFavorite: true,
      };
      const updatedWallets = [...favoriteWallets, newFavorite];
      setFavoriteWallets(updatedWallets);
    } else {
      const updatedWallets = favoriteWallets.map((fav) =>
        fav.walletAddress === walletAddress
          ? { ...fav, isFavorite: true, lastUsed: new Date().toISOString() }
          : fav
      );
      setFavoriteWallets(updatedWallets);
    }
  };

  const removeFavoriteWallet = (walletId: string) => {
    const updatedWallets = favoriteWallets.filter((fav) => fav.id !== walletId);
    setFavoriteWallets(updatedWallets);
  };

  const toggleFavorite = (walletId: string) => {
    const updatedWallets = favoriteWallets.map((fav) =>
      fav.id === walletId ? { ...fav, isFavorite: !fav.isFavorite } : fav
    );
    setFavoriteWallets(updatedWallets);
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
