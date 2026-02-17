import { apiGet } from "@/app/constants/api";
import PLIcon from "@/assets/images/markets-icons/epl.svg";
import Polymarket from "@/assets/images/markets-icons/polymarket.svg";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  Animated,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

const chartHeight = 180;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const marketData = {
  title: "Who wins the EPL?",
  volume: "88,880,340 Vol.",
  date: "May 27, 2026",
  teams: [
    {
      name: "Arsenal",
      short: "A",
      badgeColor: "#F59E0B",
      lineColor: "#F59E0B",
    },
    {
      name: "Man City",
      short: "MC",
      badgeColor: "#4A9DFF",
      lineColor: "#4A9DFF",
    },
  ],
  chart: {
    arsenal: [
      52, 54, 53, 55, 56, 57, 59, 61, 60, 62, 63, 64, 62, 63, 64, 65, 64, 66,
      64, 65,
    ],
    manCity: [
      24, 23, 22, 21, 20, 19, 18, 19, 18, 17, 18, 19, 18, 18, 17, 18, 18, 17,
      18, 18,
    ],
  },
};

const chartXAxisLabels = ["Dec 11", "Mar 24", "Jul 16", "Sep 7", "Nov 3"];

const formatPrice = (value: number) => `$${value.toFixed(2)}`;

const monthLabels = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const formatDateLabel = (value: string | number) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return `${monthLabels[date.getMonth()]} ${date.getDate()}`;
};

const formatTickLabel = (
  value: string | number | undefined,
  fallback: string,
) => {
  if (value === undefined || value === null) return fallback;
  if (typeof value === "number" || typeof value === "string") {
    const dateLabel = formatDateLabel(value);
    return dateLabel ?? String(value);
  }
  return fallback;
};

const normalizePriceValue = (raw: unknown) => {
  const value = Number(raw);
  if (!Number.isFinite(value)) return null;
  const normalized = value <= 1 ? value * 100 : value;
  return clamp(normalized, 0, 100);
};

const alignSeries = (
  left: number[],
  leftLabels: Array<string | number | undefined>,
  right: number[],
  rightLabels: Array<string | number | undefined>,
) => {
  if (!left.length || !right.length) {
    return { left, right, leftLabels, rightLabels };
  }
  const minLength = Math.min(left.length, right.length);
  return {
    left: left.slice(-minLength),
    right: right.slice(-minLength),
    leftLabels: leftLabels.slice(-minLength),
    rightLabels: rightLabels.slice(-minLength),
  };
};

const extractEventTeams = (payload: any) => {
  const data = payload?.data ?? payload;
  const rawTeams =
    data?.teams ??
    data?.outcomes ??
    data?.options ??
    data?.tokens ??
    data?.participants ??
    [];

  if (!Array.isArray(rawTeams)) return [];

  return rawTeams.map((team: any, index: number) => {
    const fallback = marketData.teams[index % marketData.teams.length];
    const name =
      team?.name ??
      team?.title ??
      team?.label ??
      team?.outcome ??
      fallback.name;
    const short =
      team?.short ??
      team?.symbol ??
      name
        .split(/\s+/)
        .map((part: string) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
    const tokenId =
      team?.tokenId ??
      team?.tokenID ??
      team?.token?.id ??
      team?.token?.tokenId ??
      team?.id;

    return {
      ...fallback,
      name,
      short,
      tokenId,
    };
  });
};

const extractEventMeta = (payload: any) => {
  const data = payload?.data ?? payload;
  const title = data?.title ?? data?.name ?? marketData.title;
  const volumeValue =
    data?.volume ?? data?.totalVolume ?? data?.volumeFormatted;
  const volume = volumeValue ? String(volumeValue) : marketData.volume;
  const dateValue =
    data?.date ?? data?.endDate ?? data?.settleDate ?? data?.createdAt;
  const dateLabel =
    typeof dateValue === "string" || typeof dateValue === "number"
      ? (formatDateLabel(dateValue) ?? String(dateValue))
      : marketData.date;

  return {
    title,
    volume,
    date: dateLabel || marketData.date,
  };
};

const extractPriceHistory = (payload: any) => {
  const data = payload?.data ?? payload;
  const items =
    (Array.isArray(data) && data) ||
    data?.history ||
    data?.prices ||
    data?.data ||
    [];

  if (!Array.isArray(items)) return { values: [], labels: [] };

  const values: number[] = [];
  const labels: Array<string | number | undefined> = [];

  items.forEach((item: any) => {
    const rawValue =
      item?.price ?? item?.value ?? item?.rate ?? item?.last ?? item?.y;
    const normalized = normalizePriceValue(rawValue);
    if (normalized === null) return;

    const label =
      item?.timestamp ?? item?.time ?? item?.date ?? item?.createdAt ?? item?.x;

    values.push(normalized);
    labels.push(label);
  });

  return { values, labels };
};

const TeamLogo = ({ label, color }: { label: string; color: string }) => (
  <View style={[styles.teamBadge, { borderColor: color }]}>
    <View style={[styles.teamBadgeInner, { backgroundColor: color }]}>
      <Text style={styles.teamBadgeText}>{label}</Text>
    </View>
  </View>
);

export default function MarketScreen() {
  const [series, setSeries] = useState(marketData.chart);
  const [eventMeta, setEventMeta] = useState({
    title: marketData.title,
    volume: marketData.volume,
    date: marketData.date,
  });
  const [teamsMeta, setTeamsMeta] = useState(marketData.teams);
  const [seriesLabels, setSeriesLabels] = useState({
    arsenal: [] as Array<string | number | undefined>,
    manCity: [] as Array<string | number | undefined>,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const chartOpacity = useRef(new Animated.Value(0)).current;
  const chartTranslate = useRef(new Animated.Value(12)).current;
  const rowsOpacity = useRef(new Animated.Value(0)).current;
  const rowsTranslate = useRef(new Animated.Value(16)).current;

  const showToast = (message: string) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert(message);
    }
  };

  const handleAction = (message: string) => {
    showToast(message);
  };

  const loadPredictionData = useCallback(async (showRefresh = false) => {
    if (showRefresh) {
      setIsRefreshing(true);
    }

    try {
      const eventResponse = await apiGet("/prediction/event/epl-winner");
      const eventInfo = extractEventMeta(eventResponse);
      const eventTeams = extractEventTeams(eventResponse);

      setEventMeta(eventInfo);
      if (eventTeams.length) {
        setTeamsMeta(eventTeams.slice(0, 2));
      }

      const teamsForHistory =
        eventTeams.length > 0 ? eventTeams.slice(0, 2) : marketData.teams;
      const [firstTeam, secondTeam] = teamsForHistory;

      const [firstHistory, secondHistory] = await Promise.all([
        firstTeam?.tokenId
          ? apiGet(
              `/prediction/price-history/epl-winner?tokenId=${encodeURIComponent(
                firstTeam.tokenId,
              )}`,
            )
          : Promise.resolve(null),
        secondTeam?.tokenId
          ? apiGet(
              `/prediction/price-history/epl-winner?tokenId=${encodeURIComponent(
                secondTeam.tokenId,
              )}`,
            )
          : Promise.resolve(null),
      ]);

      const firstParsed = extractPriceHistory(firstHistory);
      const secondParsed = extractPriceHistory(secondHistory);

      const aligned = alignSeries(
        firstParsed.values,
        firstParsed.labels,
        secondParsed.values,
        secondParsed.labels,
      );

      setSeries((prev) => ({
        arsenal: aligned.left.length ? aligned.left : prev.arsenal,
        manCity: aligned.right.length ? aligned.right : prev.manCity,
      }));

      setSeriesLabels({
        arsenal: aligned.leftLabels,
        manCity: aligned.rightLabels,
      });
    } catch (error) {
      console.warn("Prediction graph load failed", error);
    } finally {
      if (showRefresh) {
        setIsRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    loadPredictionData();
  }, [loadPredictionData]);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(chartOpacity, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(rowsOpacity, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.timing(rowsTranslate, {
          toValue: 0,
          duration: 450,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [chartOpacity, rowsOpacity, rowsTranslate]);

  useEffect(() => {
    Animated.timing(chartTranslate, {
      toValue: 0,
      duration: 450,
      useNativeDriver: true,
    }).start();
  }, [chartTranslate]);

  const xTickLabelMap = useMemo(() => {
    const activeLabels =
      seriesLabels.manCity.length > 0
        ? seriesLabels.manCity
        : seriesLabels.arsenal;
    const length = Math.max(
      activeLabels.length,
      series.arsenal.length,
      series.manCity.length,
    );
    if (length <= 1) return {};

    const tickCount = Math.min(chartXAxisLabels.length, length);
    const map: Record<number, string> = {};
    for (let i = 0; i < tickCount; i += 1) {
      const index = Math.round((length - 1) * (i / (tickCount - 1)));
      map[index] = formatTickLabel(activeLabels[index], chartXAxisLabels[i]);
    }
    return map;
  }, [seriesLabels, series.arsenal.length, series.manCity.length]);

  const chartSeries = useMemo(
    () => ({
      arsenal: series.arsenal.map((value, index) => ({ value, index })),
      manCity: series.manCity.map((value, index) => ({ value, index })),
    }),
    [series],
  );

  const teams = useMemo(() => {
    const arsenalChance = Math.round(
      series.arsenal[series.arsenal.length - 1] ?? 64,
    );
    const manCityChance = Math.round(
      series.manCity[series.manCity.length - 1] ?? 18,
    );

    const buildPrices = (chance: number) => {
      const yes = clamp(chance / 100, 0.01, 0.99);
      const no = clamp(1 - yes, 0.01, 0.99);
      return { yesPrice: yes, noPrice: no };
    };

    const [teamA, teamB] = [
      teamsMeta[0] ?? marketData.teams[0],
      teamsMeta[1] ?? marketData.teams[1],
    ];

    return [
      {
        ...teamA,
        chance: arsenalChance,
        ...buildPrices(arsenalChance),
      },
      {
        ...teamB,
        chance: manCityChance,
        ...buildPrices(manCityChance),
      },
    ];
  }, [series, teamsMeta]);

  const lineData = useMemo(
    () =>
      chartSeries.manCity.map(({ value, index }) => ({
        value,
        label: xTickLabelMap[index],
      })),
    [chartSeries.manCity, xTickLabelMap],
  );

  const lineData2 = useMemo(
    () =>
      chartSeries.arsenal.map(({ value, index }) => ({
        value,
        label: xTickLabelMap[index],
      })),
    [chartSeries.arsenal, xTickLabelMap],
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Markets</Text>
        </View>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => loadPredictionData(true)}
              tintColor="#8FA2FF"
              colors={["#8FA2FF"]}
            />
          }
        >
          <View style={styles.content}>
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.leagueBadge}>
                  {/* <Text style={styles.leagueBadgeText}>PL</Text> */}
                  <PLIcon
                  // width={24} height={24}
                  />
                </View>
                <View style={styles.cardHeaderContent}>
                  <View style={styles.cardTitleRow}>
                    <Text style={styles.cardTitle}>{eventMeta.title}</Text>
                    <View style={styles.liveBadge}>
                      <Text style={styles.liveBadgeText}>LIVE</Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.shareButton}
                  onPress={() => handleAction("Share market")}
                  activeOpacity={0.8}
                >
                  <Ionicons name="share-social" size={16} color="#E2E6F0" />
                </TouchableOpacity>
              </View>

              <View style={styles.cardMetaRow}>
                <Text style={styles.metaText}>{eventMeta.volume}</Text>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
                >
                  {/* <View style={styles.metaDot} /> */}
                  <View style={styles.metaRowIcon}>
                    <Ionicons name="time" size={12} color="#9AA3B2" />
                  </View>
                  <Text style={styles.metaText}>{eventMeta.date}</Text>
                </View>
              </View>

              <View style={styles.poweredRow}>
                <Text style={styles.poweredText}>Powered by</Text>
                <Polymarket />
              </View>

              <Animated.View
                style={[
                  styles.chartWrap,
                  {
                    opacity: chartOpacity,
                    transform: [{ translateY: chartTranslate }],
                  },
                ]}
              >
                <LineChart
                  height={chartHeight}
                  data={lineData}
                  data2={lineData2}
                  color1={teams[1].lineColor}
                  color2={teams[0].lineColor}
                  thickness={2}
                  noOfSections={4}
                  maxValue={100}
                  spacing={14}
                  initialSpacing={6}
                  yAxisColor="#232A36"
                  xAxisColor="#232A36"
                  rulesColor="#232A36"
                  dashWidth={2}
                  dashGap={4}
                  yAxisTextStyle={{ color: "#637083", fontSize: 10 }}
                  xAxisLabelTextStyle={{ color: "#637083", fontSize: 10 }}
                  yAxisLabelSuffix="%"
                  yAxisLabelWidth={32}
                  hideDataPoints
                  hideDataPoints2
                  isAnimated
                  animationDuration={900}
                />
                <View style={styles.chartLabels}>
                  <Text style={styles.chartLabelBlue}>
                    {teams[1].name} {teams[1].chance}%
                  </Text>
                  <Text style={styles.chartLabelOrange}>
                    {teams[0].name} {teams[0].chance}%
                  </Text>
                </View>
              </Animated.View>

              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderText}>Team</Text>
                <Text style={styles.tableHeaderText}>Chance</Text>
                <Text style={styles.tableHeaderText}> </Text>
              </View>

              <Animated.View
                style={{
                  opacity: rowsOpacity,
                  transform: [{ translateY: rowsTranslate }],
                }}
              >
                {teams.map((team) => (
                  <View style={styles.tableRow} key={team.name}>
                    <View style={styles.teamCol}>
                      <View style={styles.teamRow}>
                        {/* <TeamLogo label={team.short} color={team.badgeColor} /> */}
                        <Text style={styles.teamText}>{team.name}</Text>
                      </View>
                    </View>
                    <View style={styles.chanceCol}>
                      <Text style={styles.chanceText}>{team.chance}%</Text>
                    </View>
                    <View style={styles.actionsCol}>
                      <TouchableOpacity
                        style={styles.actionPillYes}
                        onPress={() => handleAction(`Buy Yes: ${team.name}`)}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.actionPillText}>
                          Yes {formatPrice(team.yesPrice)}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionPillNo}
                        onPress={() => handleAction(`Buy No: ${team.name}`)}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.actionPillText}>
                          No {formatPrice(team.noPrice)}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </Animated.View>

              <TouchableOpacity
                style={styles.seeMoreButton}
                onPress={() => handleAction("See more markets")}
                activeOpacity={0.85}
              >
                <Text style={styles.seeMoreText}>See More</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.balanceCard}>
              <View>
                <Text style={styles.balanceLabel}>Market Balance</Text>
                <View style={styles.balanceRow}>
                  <Text style={styles.balanceValue}>$0.00</Text>
                  <Ionicons name="chevron-down" size={16} color="#8B96A8" />
                </View>
              </View>
              <TouchableOpacity
                style={styles.addFundsButton}
                onPress={() => handleAction("Add funds")}
                activeOpacity={0.85}
              >
                <Text style={styles.addFundsText}>Add funds</Text>
                <Ionicons name="add" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    color: "#757B85",
    maxWidth: 87,
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    marginTop: 20,
  },
  card: {
    // backgroundColor: "#0F141B",
    // borderRadius: 18,
    // padding: 16,
    gap: 16,
    // borderWidth: 1,
    // borderColor: "#1E2530",
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    justifyContent: "space-between",
  },
  leagueBadge: {
    borderRadius: 18,
    backgroundColor: "#1C2430",
    alignItems: "center",
    justifyContent: "center",
  },
  leagueBadgeText: {
    color: "#E2E6F0",
    fontSize: 12,
    fontWeight: "700",
  },
  cardHeaderContent: {
    flex: 1,
    marginRight: 8,
    minWidth: 0,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  cardTitle: {
    color: "#E2E6F0",
    fontSize: 16,
    fontWeight: "700",
    flexShrink: 1,
  },
  liveBadge: {
    backgroundColor: "#163425",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  liveBadgeText: {
    color: "#30D158",
    fontSize: 10,
    fontWeight: "700",
  },
  cardMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
    gap: 6,
  },
  metaText: {
    color: "#9AA3B2",
    fontSize: 11,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#3A4452",
  },
  metaRowIcon: {
    width: 16,
    alignItems: "center",
  },
  shareButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#1B2330",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  poweredRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  poweredText: {
    color: "#8B96A8",
    fontSize: 11,
  },
  poweredBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: "#121924",
  },
  poweredTextStrong: {
    color: "#D5DBE7",
    fontSize: 11,
    fontWeight: "600",
  },
  chartWrap: {
    // backgroundColor: "#0C1016",
    // borderRadius: 14,
    // paddingVertical: 12,
    // paddingHorizontal: 8,
    // borderWidth: 1,
    // borderColor: "#151C26",
    overflow: "hidden",
  },
  chartLabels: {
    position: "absolute",
    right: 12,
    top: 12,
    gap: 8,
  },
  chartLabelBlue: {
    color: "#4A9DFF",
    fontSize: 10,
    fontWeight: "600",
  },
  chartLabelOrange: {
    color: "#F59E0B",
    fontSize: 10,
    fontWeight: "600",
  },
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  tableHeaderText: {
    color: "#5F6B7A",
    fontSize: 11,
    fontWeight: "600",
    flex: 1,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#161D27",
  },
  teamCol: {
    flex: 1,
  },
  teamRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  teamBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  teamBadgeInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  teamBadgeText: {
    color: "#0B0F14",
    fontSize: 9,
    fontWeight: "700",
  },
  teamLogoImage: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  teamText: {
    color: "#E2E6F0",
    fontSize: 13,
  },
  chanceCol: {
    width: 60,
    alignItems: "flex-start",
  },
  chanceText: {
    color: "#B0BACB",
    fontSize: 12,
  },
  actionsCol: {
    flexDirection: "row",
    gap: 8,
  },
  actionPillYes: {
    backgroundColor: "#1F3E73",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  actionPillNo: {
    backgroundColor: "#1B2330",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#2A3544",
  },
  actionPillText: {
    color: "#E2E6F0",
    fontSize: 11,
    fontWeight: "600",
  },
  seeMoreButton: {
    backgroundColor: "#131922",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  seeMoreText: {
    color: "#8FA2FF",
    fontSize: 12,
    fontWeight: "600",
  },
  balanceCard: {
    backgroundColor: "#0F141B",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#1E2530",
  },
  balanceLabel: {
    color: "#687489",
    fontSize: 11,
    marginBottom: 6,
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  balanceValue: {
    color: "#E2E6F0",
    fontSize: 18,
    fontWeight: "700",
  },
  addFundsButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2B69FF",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  addFundsText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
});
