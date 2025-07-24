import React, { useEffect, useState, useContext, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../contexts/ThemeContext";
import NoteCard from "../../components/NoteCard";
import DeckCard from "../../components/DeckCard";
import { Ionicons } from "@expo/vector-icons";
import { getNotes, Note } from "../../services/notesService";
import { getDecks, Deck, getPublicDecks } from "../../services/deckService";
import { getStudyPlans, StudyPlan } from "../../services/studyPlanService";
import { AuthContext } from "../../contexts/AuthContext";
import { useFocusEffect } from "@react-navigation/native";

const { width } = Dimensions.get("window");

const HomeScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const { currentTheme } = useTheme();
  const { user } = useContext<any>(AuthContext);
  const [notes, setNotes] = useState<Note[]>([]);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [publicDecks, setPublicDecks] = useState<Deck[]>([]);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
      // Start animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }, [])
  );

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      // Lấy notes mới nhất
      const fetchedNotes = await getNotes({
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      setNotes(fetchedNotes.slice(0, 3));
      // Lấy decks public
      const fetchedPublicDecks = await getPublicDecks();
      setPublicDecks(fetchedPublicDecks.slice(0, 3));
      // Lấy study plan tiếp theo (chưa hoàn thành, ngày hôm nay trở đi)
      const today = new Date().toISOString().slice(0, 10);
      const plans = await getStudyPlans(today);
      const nextPlan =
        plans.find((p: StudyPlan) => !p.completed) || plans[0] || null;
      setPlan(nextPlan);
    } catch (err: any) {
      setError(t("home.errorLoading"));
      Alert.alert(t("common.error"), err.message || t("home.errorLoading"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Header with gradient */}
      <LinearGradient
        colors={
          currentTheme.theme === "dark"
            ? ["#1E293B", "#334155", "#475569"]
            : ["#667eea", "#764ba2"]
        }
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View
          style={[
            styles.headerContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.greeting}>
            {t("home.greeting")}, {user?.name || "User"}! 👋
          </Text>
          <Text style={styles.subtitle}>{t("home.subtitle")}</Text>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        style={[
          styles.scrollView,
          { backgroundColor: currentTheme.colors.background },
        ]}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        
        {loading ? (
          <View style={{ alignItems: "center", marginTop: 40 }}>
            <ActivityIndicator
              size="large"
              color={currentTheme.colors.primary}
            />
            <Text
              style={[
                styles.loadingText,
                { color: currentTheme.colors.textSecondary },
              ]}
            >
              {t("home.loading")}
            </Text>
          </View>
        ) : error ? (
          <View style={{ alignItems: "center", marginTop: 40 }}>
            <Text
              style={[styles.errorText, { color: currentTheme.colors.error }]}
            >
              {error}
            </Text>
            <TouchableOpacity
              onPress={fetchData}
              style={[
                styles.retryButton,
                { backgroundColor: currentTheme.colors.primary },
              ]}
            >
              <Text
                style={[
                  styles.retryText,
                  { color: currentTheme.colors.onPrimary },
                ]}
              >
                {t("home.retry")}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Kế hoạch học tiếp theo */}
            <View style={styles.section}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: currentTheme.colors.text },
                ]}
              >
                {t("home.nextStudyPlan")}
              </Text>
              {plan ? (
                <View
                  style={[
                    styles.planCard,
                    { backgroundColor: currentTheme.colors.card },
                  ]}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={28}
                    color={currentTheme.colors.primary}
                    style={{ marginRight: 12 }}
                  />
                  <View>
                    <Text
                      style={[
                        styles.planTitle,
                        { color: currentTheme.colors.text },
                      ]}
                    >
                      {plan.title} - {plan.startTime} - {plan.endTime}
                    </Text>
                    <Text
                      style={[
                        styles.planDesc,
                        { color: currentTheme.colors.textSecondary },
                      ]}
                    >
                      {plan.note || ""}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.startBtn,
                      { backgroundColor: currentTheme.colors.primary },
                    ]}
                    onPress={() => navigation.navigate("Planner")}
                  >
                    <Text
                      style={[
                        styles.startText,
                        { color: currentTheme.colors.onPrimary },
                      ]}
                    >
                      {t("home.start")}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Text
                  style={[
                    styles.noPlanText,
                    { color: currentTheme.colors.textSecondary },
                  ]}
                >
                  {t("home.noStudyPlan")}
                </Text>
              )}
            </View>
            {/* Notes gần đây */}
            <View style={styles.section}>
              <View style={styles.sectionRow}>
                <Text
                  style={[
                    styles.sectionTitle,
                    { color: currentTheme.colors.text },
                  ]}
                >
                  {t("home.recentNotes")}
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate("Notes")}>
                  <Text
                    style={[
                      styles.link,
                      { color: currentTheme.colors.primary },
                    ]}
                  >
                    {t("home.viewAll")}
                  </Text>
                </TouchableOpacity>
              </View>
              {notes.length === 0 ? (
                <Text
                  style={[
                    styles.noDataText,
                    { color: currentTheme.colors.textSecondary },
                  ]}
                >
                  {t("home.noNotes")}
                </Text>
              ) : (
                notes.map((n, i) => (
                  <NoteCard
                    key={n.id}
                    title={n.title}
                    description={n.description}
                    content={n.content}
                    tags={n.tags}
                    category={n.category}
                    priority={n.priority}
                    color={n.color}
                    isPinned={n.isPinned}
                    isPublic={n.isPublic}
                    createdAt={n.createdAt}
                    onPress={() =>
                      navigation.navigate("NoteEditor", { noteId: n.id })
                    }
                  />
                ))
              )}
            </View>
            {/* Deck nổi bật */}
            <View style={styles.section}>
              <View style={styles.sectionRow}>
                <Text
                  style={[
                    styles.sectionTitle,
                    { color: currentTheme.colors.text },
                  ]}
                >
                  {t("home.featuredDecks")}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("Flashcards", { tab: "public" })
                  }
                >
                  <Text
                    style={[
                      styles.link,
                      { color: currentTheme.colors.primary },
                    ]}
                  >
                    {t("home.viewAll")}
                  </Text>
                </TouchableOpacity>
              </View>
              {publicDecks.length === 0 ? (
                <Text
                  style={[
                    styles.noDataText,
                    { color: currentTheme.colors.textSecondary },
                  ]}
                >
                  {t("home.noDecks")}
                </Text>
              ) : (
                <Animated.View
                  style={{
                    opacity: fadeAnim,
                    transform: [{ translateX: slideAnim }],
                  }}
                >
                  <FlatList
                    data={publicDecks}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item, index }) => (
                      <Animated.View
                        style={[
                          { width: 220, marginRight: 12 },
                          {
                            opacity: fadeAnim,
                            transform: [
                              {
                                translateY: slideAnim.interpolate({
                                  inputRange: [0, 30],
                                  outputRange: [0, 30 + index * 10],
                                }),
                              },
                            ],
                          },
                        ]}
                      >
                        <DeckCard
                          name={item.title}
                          count={item._count?.flashcards || 0}
                          isPublic={item.isPublic}
                          onStudy={() =>
                            navigation.navigate("FlashcardPractice", {
                              deckId: item.id,
                              title: item.title,
                              isPublic: true,
                            })
                          }
                          description={item.description}
                          tags={item.tags}
                          hideManageBtn={true}
                        />
                      </Animated.View>
                    )}
                  />
                </Animated.View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: "center",
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  oldHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  hello: {
    fontSize: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  link: {
    fontWeight: "bold",
  },
  planCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    elevation: 2,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  planDesc: {
    fontSize: 14,
  },
  startBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: "auto",
  },
  startText: {
    fontWeight: "bold",
  },
  loadingText: {
    marginTop: 12,
  },
  errorText: {
    fontSize: 16,
  },
  retryButton: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
  },
  retryText: {
    fontWeight: "bold",
  },
  noPlanText: {
    marginTop: 8,
  },
  noDataText: {
    marginTop: 8,
  },
});

export default HomeScreen;
