import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

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
  addFavoriteEmail: (email: string) => void;
  removeFavoriteEmail: (emailId: string) => void;
  isEmailFavorite: (email: string) => boolean;
  markEmailAsUsed: (email: string) => void;
  getEmailById: (emailId: string) => FavoriteEmail | undefined;
  toggleFavorite: (emailId: string) => void;
  selectedEmailFromFavorite: string | null;
  setSelectedEmailFromFavorite: (email: string | null) => void;
  clearSelectedEmailFromFavorite: () => void;
}

const FavoriteEmailsContext = createContext<
  FavoriteEmailsContextType | undefined
>(undefined);

export const FavoriteEmailsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [favoriteEmails, setFavoriteEmails] = useState<FavoriteEmail[]>([]);
  const [recentEmails, setRecentEmails] = useState<FavoriteEmail[]>([]);
  const [selectedEmailFromFavorite, setSelectedEmailFromFavorite] = useState<
    string | null
  >(null);

  useEffect(() => {
    updateRecentEmails();
  }, [favoriteEmails]);

  const updateRecentEmails = () => {
    const sortedByRecent = [...favoriteEmails]
      .filter((email) => email.lastUsed)
      .sort(
        (a, b) =>
          new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime()
      )
      .slice(0, 10);
    setRecentEmails(sortedByRecent);
  };

  const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const addFavoriteEmail = (email: string) => {
    const existingEmail = favoriteEmails.find((fav) => fav.email === email);

    if (!existingEmail) {
      const newFavorite: FavoriteEmail = {
        id: generateId(),
        email: email.trim(),
        dateAdded: new Date().toISOString(),
        lastUsed: new Date().toISOString(),
        isFavorite: true,
      };
      const updatedEmails = [...favoriteEmails, newFavorite];
      setFavoriteEmails(updatedEmails);
    } else {
      const updatedEmails = favoriteEmails.map((fav) =>
        fav.email === email
          ? { ...fav, isFavorite: true, lastUsed: new Date().toISOString() }
          : fav
      );
      setFavoriteEmails(updatedEmails);
    }
  };

  const removeFavoriteEmail = (emailId: string) => {
    const updatedEmails = favoriteEmails.filter((fav) => fav.id !== emailId);
    setFavoriteEmails(updatedEmails);
  };

  const toggleFavorite = (emailId: string) => {
    const updatedEmails = favoriteEmails.map((fav) =>
      fav.id === emailId ? { ...fav, isFavorite: !fav.isFavorite } : fav
    );
    setFavoriteEmails(updatedEmails);
  };

  const isEmailFavorite = (email: string) => {
    const foundEmail = favoriteEmails.find((fav) => fav.email === email);
    return foundEmail ? foundEmail.isFavorite : false;
  };

  const markEmailAsUsed = (email: string) => {
    const updatedEmails = favoriteEmails.map((fav) =>
      fav.email === email ? { ...fav, lastUsed: new Date().toISOString() } : fav
    );
    setFavoriteEmails(updatedEmails);
  };

  const getEmailById = (emailId: string) => {
    return favoriteEmails.find((fav) => fav.id === emailId);
  };

  const clearSelectedEmailFromFavorite = () => {
    setSelectedEmailFromFavorite(null);
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
      "useFavoriteEmails must be used within a FavoriteEmailsProvider"
    );
  }
  return context;
};
