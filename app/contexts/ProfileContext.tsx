import * as ImagePicker from "expo-image-picker";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Alert } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store";
import { updateProfileImage } from "../store/authSlice";

interface ProfileContextType {
  username: string;
  profileImage: string | null;
  setUsername: (username: string) => void;
  setProfileImage: (image: string | null) => void;
  pickImage: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const dispatch = useDispatch<any>();
  const storedAvatar = useSelector((state: RootState) => state.auth.user?.avatar);
  const storedProfileImage = storedAvatar && storedAvatar !== "default" ? storedAvatar : null;

  const [username, setUsername] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(
    storedProfileImage || null,
  );

  useEffect(() => {
    if (storedProfileImage) {
      setProfileImage(storedProfileImage);
    }
  }, [storedProfileImage]);

  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Sorry, we need camera roll permissions to make this work!",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        setProfileImage(uri);
        try {
          await dispatch(updateProfileImage(uri)).unwrap();
        } catch (err: any) {
          Alert.alert("Upload Failed", err || "Could not upload profile image");
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  return (
    <ProfileContext.Provider
      value={{
        username,
        profileImage,
        setUsername,
        setProfileImage,
        pickImage,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
};
