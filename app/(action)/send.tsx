import { Text } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function SendScreen() {
  return (
    <SafeAreaProvider>
      <SafeAreaView>
        <Text>Send</Text>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
