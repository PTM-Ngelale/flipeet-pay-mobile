import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useMemo, useRef, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type IntroScreen = {
  title: string;
  subtitle: string;
};

const SCREENS: IntroScreen[] = [
  {
    title: "Buy, Sell & Bridge Stablecoins",
    subtitle:
      "Convert USDT & USDC into your local currency instantly — with the best rates.",
  },
  {
    title: "Pay for Services & Settle Bills with Crypto",
    subtitle:
      "Power your lifestyle with stablecoins — from airtime and data to utilities, subscriptions, and everyday essentials.",
  },
  {
    title: "Fast & Secure Payments",
    subtitle:
      "Accept stablecoin payments from anywhere in the world — with zero stress and 24/7 fraud monitoring protecting every transaction.",
  },
];

const GRADIENT_COLORS = ["#007BFF", "#28A745", "#004A99"];

export default function IntroScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView | null>(null);
  const [pageIndex, setPageIndex] = useState(0);

  const isLast = pageIndex === SCREENS.length - 1;

  const dots = useMemo(() => {
    return SCREENS.map((_, index) => ({
      id: `dot-${index}`,
      active: index === pageIndex,
    }));
  }, [pageIndex]);

  const handleNext = () => {
    if (!scrollRef.current) return;
    const nextIndex = Math.min(pageIndex + 1, SCREENS.length - 1);
    scrollRef.current.scrollTo({ x: nextIndex * SCREEN_WIDTH, animated: true });
    setPageIndex(nextIndex);
  };

  const handleGetStarted = async () => {
    try {
      await AsyncStorage.setItem("flipeet_onboarding_seen_v1", "true");
    } catch (error) {
      console.warn("Failed to store onboarding flag:", error);
    }
    router.replace("/(auth)/login");
  };

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x || 0;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    if (index !== pageIndex) {
      setPageIndex(index);
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.background}>
        <Svg height="100%" width="100%">
          <Defs>
            <LinearGradient id="intro-gradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={GRADIENT_COLORS[0]} />
              <Stop offset="50%" stopColor={GRADIENT_COLORS[1]} />
              <Stop offset="100%" stopColor={GRADIENT_COLORS[2]} />
            </LinearGradient>
          </Defs>
          <Rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="url(#intro-gradient)"
          />
        </Svg>
      </View>
      <View pointerEvents="none" style={styles.overlay} />

      <SafeAreaView style={styles.container}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {SCREENS.map((screen) => (
            <View key={screen.title} style={styles.screen}>
              <View style={styles.content}>
                <Text style={styles.title}>{screen.title}</Text>
                <Text style={styles.subtitle}>{screen.subtitle}</Text>
                <View style={styles.dotsContainer}>
                  {dots.map((dot) => (
                    <View
                      key={dot.id}
                      style={[
                        styles.dot,
                        dot.active ? styles.dotActive : styles.dotInactive,
                      ]}
                    />
                  ))}
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.buttonColumn}>
            {!isLast ? (
              <TouchableOpacity
                style={[styles.ctaButton, styles.ctaButtonPrimary]}
                onPress={handleNext}
              >
                <Text style={styles.ctaTextPrimary}>Next</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.buttonSpacer} />
            )}
            <TouchableOpacity
              style={[
                styles.ctaButton,
                isLast ? styles.ctaButtonPrimary : styles.ctaButtonSecondary,
              ]}
              onPress={handleGetStarted}
            >
              <Text
                style={isLast ? styles.ctaTextPrimary : styles.ctaTextSecondary}
              >
                Get Started
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "transparent",
    zIndex: 1,
  },
  screen: {
    width: SCREEN_WIDTH,
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#121212",
    opacity: 0.55,
  },
  content: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 16,
    paddingBottom: 60,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 34,
    textAlign: "center",
  },
  subtitle: {
    color: "#EAF3FF",
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 56,
    gap: 16,
  },
  buttonColumn: {
    flexDirection: "column",
    gap: 12,
  },
  buttonSpacer: {
    height: 48,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginTop: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  dotActive: {
    backgroundColor: "#34D058",
  },
  dotInactive: {
    backgroundColor: "#388665",
  },
  ctaButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    width: "100%",
  },
  ctaButtonPrimary: {
    backgroundColor: "#0A66D3",
  },
  ctaButtonSecondary: {
    backgroundColor: "#121212",
    borderWidth: 1,
    borderColor: "#4A9DFF",
  },
  ctaTextPrimary: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  ctaTextSecondary: {
    color: "#4A9DFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
