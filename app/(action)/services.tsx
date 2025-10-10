import { Text } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function ServicesScreen() {
  return (
    <SafeAreaProvider>
      <SafeAreaView>
        <Text>Services</Text>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
