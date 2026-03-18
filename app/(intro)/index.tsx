import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
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
  const [autoplay, setAutoplay] = useState(true);

  const isLast = pageIndex === SCREENS.length - 1;

  const dots = useMemo(() => {
    return SCREENS.map((_, index) => ({
      id: `dot-${index}`,
      active: index === pageIndex,
    }));
  }, [pageIndex]);

  const handleSignUp = async () => {
    setAutoplay(false);
    try {
      await AsyncStorage.setItem("flipeet_onboarding_seen_v1", "true");
    } catch (error) {}
    router.push("/sign-up");
  };

  const handleLogin = async () => {
    setAutoplay(false);
    try {
      await AsyncStorage.setItem("flipeet_onboarding_seen_v1", "true");
    } catch (error) {}
    router.push("/login");
  };

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x || 0;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    if (index !== pageIndex) {
      setPageIndex(index);
    }
  };

  // Auto-advance carousel until user interaction
  useEffect(() => {
    if (!autoplay) return;
    const id = setInterval(() => {
      setPageIndex((prev) => {
        const next = (prev + 1) % SCREENS.length;
        if (scrollRef.current) {
          scrollRef.current.scrollTo({
            x: next * SCREEN_WIDTH,
            animated: true,
          });
        }
        return next;
      });
    }, 4000);

    return () => clearInterval(id);
  }, [autoplay]);

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
          scrollEnabled={false}
        >
          {SCREENS.map((screen, idx) => (
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
            <TouchableOpacity
              style={[styles.ctaButton, styles.ctaButtonPrimary]}
              onPress={handleSignUp}
            >
              <Text style={styles.ctaTextPrimary}>Get Started</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.ctaButton, styles.ctaButtonSecondary]}
              onPress={handleLogin}
            >
              <Text style={styles.ctaTextSecondary}>Login</Text>
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
    opacity: 0.75,
  },
  content: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 16,
    paddingBottom: 60,
  },
  title: {
    color: "#E2E6F0",
    fontSize: 32,
    fontWeight: "700",
    lineHeight: 34,
    textAlign: "center",
  },
  subtitle: {
    color: "#E2E6F0",
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
    gap: 2,
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
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#0A66D3",
  },
  ctaTextPrimary: {
    color: "#F2F4F8",
    fontSize: 16,
    fontWeight: "700",
  },
  ctaTextSecondary: {
    color: "#0A66D3",
    fontSize: 16,
    fontWeight: "700",
  },
});
