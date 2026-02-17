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

export interface FavoriteEmail {
  id: string;
  email: string;
  dateAdded: string;
  lastUsed: string;
  isFavorite: boolean;
}

interface FavoriteEmailsContextType {
  favoriteEmails: FavoriteEmail[];
  recentEmails: FavoriteEmail[];
  addFavoriteEmail: (email: string) => Promise<void>;
  removeFavoriteEmail: (emailId: string) => Promise<void>;
  isEmailFavorite: (email: string) => boolean;
  markEmailAsUsed: (email: string) => void;
  getEmailById: (emailId: string) => FavoriteEmail | undefined;
  toggleFavorite: (emailId: string) => Promise<void>;
  selectedEmailFromFavorite: string | null;
  setSelectedEmailFromFavorite: (email: string | null) => void;
  clearSelectedEmailFromFavorite: () => void;
  loading: boolean;
  refreshFavorites: () => Promise<void>;
}

const FavoriteEmailsContext = createContext<
  FavoriteEmailsContextType | undefined
>(undefined);

const FAVORITES_ENABLED = false;

export const FavoriteEmailsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [favoriteEmails, setFavoriteEmails] = useState<FavoriteEmail[]>([]);
  const [recentEmails, setRecentEmails] = useState<FavoriteEmail[]>([]);
  const [selectedEmailFromFavorite, setSelectedEmailFromFavorite] = useState<
    string | null
  >(null);
  const [loading, setLoading] = useState(false);
  const token = useSelector((state: RootState) => state.auth.token);
  const STORAGE_KEY = "flipeet_favorite_emails_v1";

  const showToast = (message: string) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert(message);
    }
  };

  useEffect(() => {
    if (!FAVORITES_ENABLED) return;
    const loadFromStorage = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setFavoriteEmails(JSON.parse(raw));
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
    updateRecentEmails();
  }, [favoriteEmails]);

  const fetchFavorites = async () => {
    if (!FAVORITES_ENABLED) return;
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch(
        "https://api.pay.flipeet.io/api/v1/transaction/favorites?featureType=email&page=1&limit=100",
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
        const emails = (data.data?.favorites || data.data || []).map(
          (item: any) => ({
            id: item.id || item._id,
            email: item.email || item.value,
            dateAdded:
              item.createdAt || item.dateAdded || new Date().toISOString(),
            lastUsed:
              item.lastUsed || item.updatedAt || new Date().toISOString(),
            isFavorite: true,
          }),
        );

        setFavoriteEmails(emails);
        try {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(emails));
        } catch (err) {}
      } else {
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const updateRecentEmails = () => {
    const sortedByRecent = [...favoriteEmails]
      .filter((email) => email.lastUsed)
      .sort(
        (a, b) =>
          new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime(),
      )
      .slice(0, 10);
    setRecentEmails(sortedByRecent);
  };

  const addFavoriteEmail = async (email: string) => {
    if (!FAVORITES_ENABLED) return;
    if (!token) return;

    const localId = `local-email-${Date.now()}`;
    const newEmail: FavoriteEmail = {
      id: localId,
      email: email.trim(),
      dateAdded: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
      isFavorite: true,
    };

    const previous = favoriteEmails;
    const updated = [newEmail, ...previous];
    setFavoriteEmails(updated);
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
            featureType: "email",
            email: email.trim(),
          }),
        },
      );

      if (response.ok) {
        await fetchFavorites();
      } else {
        showToast("Failed to add favorite");
        setFavoriteEmails(previous);
        try {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(previous));
        } catch (err) {}
      }
    } catch (error) {
      showToast("Failed to add favorite");
      setFavoriteEmails(previous);
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(previous));
      } catch (err) {}
    }
  };

  const removeFavoriteEmail = async (emailId: string) => {
    if (!FAVORITES_ENABLED) return;
    if (!token) return;

    const previous = favoriteEmails;
    const updated = previous.filter((e) => e.id !== emailId);
    setFavoriteEmails(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {}

    try {
      const response = await fetch(
        `https://api.pay.flipeet.io/api/v1/transaction/favorites/${emailId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        await fetchFavorites();
      } else {
        showToast("Failed to remove favorite");
        setFavoriteEmails(previous);
        try {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(previous));
        } catch (err) {}
      }
    } catch (error) {
      showToast("Failed to remove favorite");
      setFavoriteEmails(previous);
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(previous));
      } catch (err) {}
    }
  };

  const toggleFavorite = async (emailId: string) => {
    const email = favoriteEmails.find((e) => e.id === emailId);
    if (!email) return;

    if (email.isFavorite) {
      await removeFavoriteEmail(emailId);
    } else {
      await addFavoriteEmail(email.email);
    }
  };

  const isEmailFavorite = (email: string) => {
    const foundEmail = favoriteEmails.find((fav) => fav.email === email);
    return foundEmail ? foundEmail.isFavorite : false;
  };

  const markEmailAsUsed = (email: string) => {
    if (!FAVORITES_ENABLED) return;
    const updatedEmails = favoriteEmails.map((fav) =>
      fav.email === email
        ? { ...fav, lastUsed: new Date().toISOString() }
        : fav,
    );
    setFavoriteEmails(updatedEmails);
    try {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEmails));
    } catch (err) {}
  };

  const getEmailById = (emailId: string) => {
    return favoriteEmails.find((fav) => fav.id === emailId);
  };

  const clearSelectedEmailFromFavorite = () => {
    setSelectedEmailFromFavorite(null);
  };

  const refreshFavorites = async () => {
    if (!FAVORITES_ENABLED) return;
    await fetchFavorites();
  };

  const favoriteOnlyEmails = favoriteEmails.filter((email) => email.isFavorite);

  const value: FavoriteEmailsContextType = {
    favoriteEmails: favoriteOnlyEmails,
    recentEmails,
    addFavoriteEmail,
    removeFavoriteEmail,
    isEmailFavorite,
    markEmailAsUsed,
    getEmailById,
    toggleFavorite,
    selectedEmailFromFavorite,
    setSelectedEmailFromFavorite,
    clearSelectedEmailFromFavorite,
    loading,
    refreshFavorites,
  };

  return (
    <FavoriteEmailsContext.Provider value={value}>
      {children}
    </FavoriteEmailsContext.Provider>
  );
};

export const useFavoriteEmails = () => {
  const context = useContext(FavoriteEmailsContext);
  if (context === undefined) {
    throw new Error(
      "useFavoriteEmails must be used within a FavoriteEmailsProvider",
    );
  }
  return context;
};
