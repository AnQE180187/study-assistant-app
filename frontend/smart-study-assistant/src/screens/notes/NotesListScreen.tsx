import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  AppState,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../contexts/ThemeContext";
import NoteCard from "../../components/NoteCard";
import { Ionicons } from "@expo/vector-icons";
import ModalCard from "../../components/ModalCard";
import PrioritySelector from "../../components/PrioritySelector";
import TagsInput from "../../components/TagsInput";
import {
  Note,
  getNotes,
  createNote,
  updateNote,
  deleteNote,
} from "../../services/notesService";
import { getStudyPlans, StudyPlan } from "../../services/studyPlanService";
import { useFocusEffect } from "@react-navigation/native";

const NotesListScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const { currentTheme } = useTheme();
  const [search, setSearch] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modal, setModal] = useState<{
    type: "add" | "edit" | "delete" | null;
    index?: number;
  }>({ type: null });
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [temp, setTemp] = useState<{
    title: string;
    content: string;
    planId: string;
    priority: "low" | "medium" | "high" | "urgent";
    tags: string[];
  }>({
    title: "",
    content: "",
    planId: "", // luôn là string, '' là tự do
    priority: "medium",
    tags: [],
  });
  const [selectedPlanId, setSelectedPlanId] = useState(""); // '' là tất cả
  const [showAllPlans, setShowAllPlans] = useState(false);

  // Real-time update refs
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(Date.now());
  const isActiveRef = useRef(true);
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now());

  // Real-time updates with focus effect
  useFocusEffect(
    useCallback(() => {
      isActiveRef.current = true;
      fetchNotes();
      fetchPlans();
      startRealTimeUpdates();

      return () => {
        isActiveRef.current = false;
        stopRealTimeUpdates();
      };
    }, [search, selectedPlanId])
  );

  // App state change handler for background/foreground
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === "active" && isActiveRef.current) {
        // App came to foreground, refresh immediately
        fetchNotes();
        startRealTimeUpdates();
      } else if (nextAppState === "background" || nextAppState === "inactive") {
        // App went to background, stop updates
        stopRealTimeUpdates();
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );
    return () => subscription?.remove();
  }, []);

  // Search debounce effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isActiveRef.current) {
        fetchNotes();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [search, selectedPlanId]);

  // Real-time update functions
  const startRealTimeUpdates = () => {
    stopRealTimeUpdates(); // Clear any existing interval

    // Auto-refresh every 30 seconds when screen is active
    refreshIntervalRef.current = setInterval(() => {
      if (isActiveRef.current && !modal.type) {
        fetchNotesQuietly();
      }
    }, 30000);
  };

  const stopRealTimeUpdates = () => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  };

  const fetchNotes = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (selectedPlanId) params.planId = selectedPlanId;

      const fetchedNotes = await getNotes(params);

      // Check if notes actually changed to avoid unnecessary re-renders
      const notesChanged =
        JSON.stringify(notes) !== JSON.stringify(fetchedNotes);
      if (notesChanged) {
        setNotes(fetchedNotes);
        lastUpdateRef.current = Date.now();
        setLastRefresh(Date.now());
      }
    } catch (error: any) {
      if (showLoading) {
        Alert.alert(t("notes.error"), error.message || t("notes.loadError"));
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Quiet fetch for background updates (no loading indicator)
  const fetchNotesQuietly = () => fetchNotes(false);

  const fetchPlans = async () => {
    try {
      const fetchedPlans = await getStudyPlans();
      setPlans(fetchedPlans);
    } catch {}
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchNotes(), fetchPlans()]);
    setRefreshing(false);

    // Restart real-time updates after manual refresh
    startRealTimeUpdates();
  };

  // Modal handlers
  const openAdd = () => {
    setTemp({
      title: "",
      content: "",
      planId: "",
      priority: "medium",
      tags: [],
    });
    setModal({ type: "add" });
  };

  const openEdit = (i: number) => {
    const note = notes[i];
    setTemp({
      title: note.title,
      content: note.content,
      planId: note.planId || "",
      priority: note.priority || "medium",
      tags: note.tags || [],
    });
    setModal({ type: "edit", index: i });
  };

  const openDelete = (i: number) => setModal({ type: "delete", index: i });
  const closeModal = () => setModal({ type: null });

  // CRUD operations with optimistic updates
  const handleAdd = async () => {
    if (!temp.title?.trim()) {
      Alert.alert(t("notes.error"), t("notes.titleRequired"));
      return;
    }

    // Create optimistic note
    const optimisticNote: Note = {
      id: `temp-${Date.now()}`,
      title: temp.title.trim(),
      content: temp.content?.trim() || "",
      planId: temp.planId || null,
      priority: temp.priority,
      tags: temp.tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: "current-user", // Will be replaced by server
    };

    // Optimistic update
    setNotes([optimisticNote, ...notes]);
    closeModal();

    try {
      const payload = {
        title: temp.title.trim(),
        content: temp.content?.trim() || "",
        priority: temp.priority,
        tags: temp.tags,
      };
      if (temp.planId) payload["planId"] = temp.planId;

      const newNote = await createNote(payload);

      // Replace optimistic note with real note
      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.id === optimisticNote.id ? newNote : note
        )
      );

      Alert.alert(t("notes.success"), t("notes.addSuccess"));

      // Refresh to ensure consistency
      setTimeout(() => fetchNotesQuietly(), 1000);
    } catch (error: any) {
      Alert.alert(t("notes.error"), error.message || t("notes.addError"));
    }
  };

  const handleEdit = async () => {
    if (!temp.title?.trim()) {
      Alert.alert(t("notes.error"), t("notes.titleRequired"));
      return;
    }
    if (modal.index !== undefined && notes[modal.index]) {
      const originalNote = notes[modal.index];

      // Optimistic update
      const optimisticNote: Note = {
        ...originalNote,
        title: temp.title.trim(),
        content: temp.content?.trim() || "",
        planId: temp.planId || null,
        priority: temp.priority,
        tags: temp.tags,
        updatedAt: new Date().toISOString(),
      };

      const newNotes = [...notes];
      newNotes[modal.index] = optimisticNote;
      setNotes(newNotes);
      closeModal();

      try {
        const payload = {
          title: temp.title.trim(),
          content: temp.content?.trim() || "",
          priority: temp.priority,
          tags: temp.tags,
        };
        if (temp.planId) payload["planId"] = temp.planId;

        const updated = await updateNote(originalNote.id, payload);

        // Replace optimistic update with real data
        const noteIndex = notes.findIndex((n) => n.id === updated.id);
        if (noteIndex !== -1) {
          const finalNotes = [...notes];
          finalNotes[noteIndex] = updated;
          setNotes(finalNotes);
        }

        Alert.alert(t("notes.success"), t("notes.editSuccess"));

        // Refresh to ensure consistency
        setTimeout(() => fetchNotesQuietly(), 1000);
      } catch (error: any) {
        // Revert optimistic update on error
        setNotes((prevNotes) =>
          prevNotes.map((note) =>
            note.id === originalNote.id ? originalNote : note
          )
        );
        Alert.alert(t("notes.error"), error.message || t("notes.editError"));
      }
    }
  };

  const handleDelete = async () => {
    if (modal.index !== undefined && modal.index >= 0 && notes[modal.index!]) {
      const noteToDelete = notes[modal.index!];

      // Optimistic update - remove note immediately
      const filteredNotes = notes.filter((n) => n.id !== noteToDelete.id);
      setNotes(filteredNotes);
      closeModal();

      try {
        await deleteNote(noteToDelete.id);
        Alert.alert(t("notes.success"), t("notes.deleteSuccess"));

        // Refresh to ensure consistency
        setTimeout(() => fetchNotesQuietly(), 1000);
      } catch (error: any) {
        // Revert optimistic update on error
        setNotes((prevNotes) => {
          const revertedNotes = [...prevNotes];
          revertedNotes.splice(modal.index!, 0, noteToDelete);
          return revertedNotes;
        });
        Alert.alert(t("notes.error"), error.message || t("notes.deleteError"));
      }
    }
  };

  const handleNotePress = (note: Note) => {
    navigation.navigate("NoteEditor", { noteId: note.id });
  };

  if (loading && notes.length === 0) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={currentTheme.colors.primary} />
        <Text
          style={{ marginTop: 16, color: currentTheme.colors.textSecondary }}
        >
          {t("notes.loading")}
        </Text>
      </View>
    );
  }

  const filteredNotes =
    selectedPlanId === ""
      ? notes
      : selectedPlanId === "__free__"
      ? notes.filter((n) => !n.planId)
      : notes.filter((n) => n.planId === selectedPlanId);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: currentTheme.colors.background },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: currentTheme.colors.text }]}>
          {t("notes.yourNotes")}
        </Text>

        {/* Real-time indicator */}
        <View style={styles.realTimeIndicator}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isActiveRef.current ? "#4CAF50" : "#FFC107" },
            ]}
          />
          <Text
            style={[
              styles.statusText,
              { color: currentTheme.colors.textSecondary },
            ]}
          >
            {isActiveRef.current ? "Live" : "Offline"}
          </Text>
          <Text
            style={[
              styles.lastUpdateText,
              { color: currentTheme.colors.textSecondary },
            ]}
          >
            {new Date(lastRefresh).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      </View>

      {/* Search */}
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: currentTheme.colors.card,
            color: currentTheme.colors.text,
            borderColor: currentTheme.colors.border,
          },
        ]}
        placeholder={t("notes.searchPlaceholder")}
        placeholderTextColor={currentTheme.colors.textSecondary}
        value={search}
        onChangeText={setSearch}
      />

      {/* Filters */}
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          marginBottom: 16,
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          style={{
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 16,
            backgroundColor:
              selectedPlanId === ""
                ? currentTheme.colors.primary
                : currentTheme.colors.primary + "20",
            marginRight: 8,
            marginBottom: 8,
          }}
          onPress={() => setSelectedPlanId("")}
        >
          <Text
            style={{
              color:
                selectedPlanId === "" ? "#fff" : currentTheme.colors.primary,
              fontWeight: "bold",
            }}
          >
            {t("notes.all")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 16,
            backgroundColor:
              selectedPlanId === "__free__"
                ? currentTheme.colors.primary
                : currentTheme.colors.primary + "20",
            marginRight: 8,
            marginBottom: 8,
          }}
          onPress={() => setSelectedPlanId("__free__")}
        >
          <Text
            style={{
              color:
                selectedPlanId === "__free__"
                  ? "#fff"
                  : currentTheme.colors.primary,
              fontWeight: "bold",
            }}
          >
            {t("notes.ui.freeNotes")}
          </Text>
        </TouchableOpacity>
        {(showAllPlans ? plans : plans.slice(0, 4)).map((plan) => (
          <TouchableOpacity
            key={plan.id}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 16,
              backgroundColor:
                selectedPlanId === plan.id
                  ? currentTheme.colors.primary
                  : currentTheme.colors.primary + "20",
              marginRight: 8,
              marginBottom: 8,
            }}
            onPress={() => setSelectedPlanId(plan.id)}
          >
            <Text
              style={{
                color:
                  selectedPlanId === plan.id
                    ? "#fff"
                    : currentTheme.colors.primary,
              }}
            >
              {plan.title}
            </Text>
          </TouchableOpacity>
        ))}
        {plans.length > 4 && (
          <TouchableOpacity
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 16,
              backgroundColor: currentTheme.colors.primary + "20",
              marginRight: 8,
              marginBottom: 8,
            }}
            onPress={() => setShowAllPlans(!showAllPlans)}
          >
            <Text
              style={{ color: currentTheme.colors.primary, fontWeight: "bold" }}
            >
              {showAllPlans ? "Less" : "More"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Notes List */}
      {filteredNotes.length === 0 ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Ionicons
            name="document-text-outline"
            size={64}
            color={currentTheme.colors.textSecondary}
          />
          <Text
            style={{
              marginTop: 16,
              color: currentTheme.colors.textSecondary,
              fontSize: 16,
            }}
          >
            {loading ? t("notes.loading") : t("notes.noNotes")}
          </Text>
          {!loading && (
            <TouchableOpacity
              style={[
                styles.createFirstBtn,
                { backgroundColor: currentTheme.colors.primary },
              ]}
              onPress={openAdd}
            >
              <Text style={styles.createFirstText}>
                {t("notes.createFirstNote")}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredNotes}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <NoteCard
              title={item.title}
              content={item.content}
              priority={item.priority}
              tags={item.tags}
              studyPlanTitle={item.plan?.title}
              createdAt={item.createdAt}
              onPress={() => handleNotePress(item)}
              onEdit={() => openEdit(index)}
              onDelete={() => openDelete(index)}
            />
          )}
          contentContainerStyle={{ paddingBottom: 80 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: currentTheme.colors.primary }]}
        onPress={openAdd}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Modals */}
      <ModalCard
        visible={modal.type === "add"}
        type="add"
        title={t("notes.addNote")}
        fields={[
          {
            label: t("notes.ui.title"),
            value: temp.title,
            onChange: (v) => setTemp((t) => ({ ...t, title: v })),
          },
          {
            label: t("notes.ui.studyPlan"),
            value: temp.planId,
            onChange: (v) => setTemp((t) => ({ ...t, planId: v })),
            type: "dropdown",
            options: [
              { label: t("notes.ui.freeNotes"), value: "" },
              ...plans.map((p) => ({ label: p.title, value: p.id })),
            ],
          },
          {
            label: t("notes.ui.content"),
            value: temp.content,
            onChange: (v) => setTemp((t) => ({ ...t, content: v })),
            multiline: true,
          },
          {
            type: "custom",
            component: (
              <PrioritySelector
                selectedPriority={temp.priority}
                onPriorityChange={(priority) =>
                  setTemp((t) => ({ ...t, priority }))
                }
              />
            ),
          },
          {
            type: "custom",
            component: (
              <TagsInput
                tags={temp.tags}
                onTagsChange={(tags) => setTemp((t) => ({ ...t, tags }))}
              />
            ),
          },
        ]}
        onSubmit={handleAdd}
        onCancel={closeModal}
      />

      <ModalCard
        visible={modal.type === "edit"}
        type="edit"
        title={t("notes.editNote")}
        fields={[
          {
            label: t("notes.ui.title"),
            value: temp.title,
            onChange: (v) => setTemp((t) => ({ ...t, title: v })),
          },
          {
            label: t("notes.ui.studyPlan"),
            value: temp.planId,
            onChange: (v) => setTemp((t) => ({ ...t, planId: v })),
            type: "dropdown",
            options: [
              { label: t("notes.ui.freeNotes"), value: "" },
              ...plans.map((p) => ({ label: p.title, value: p.id })),
            ],
          },
          {
            label: t("notes.ui.content"),
            value: temp.content,
            onChange: (v) => setTemp((t) => ({ ...t, content: v })),
            multiline: true,
          },
          {
            type: "custom",
            component: (
              <PrioritySelector
                selectedPriority={temp.priority}
                onPriorityChange={(priority) =>
                  setTemp((t) => ({ ...t, priority }))
                }
              />
            ),
          },
          {
            type: "custom",
            component: (
              <TagsInput
                tags={temp.tags}
                onTagsChange={(tags) => setTemp((t) => ({ ...t, tags }))}
              />
            ),
          },
        ]}
        onSubmit={handleEdit}
        onCancel={closeModal}
      />

      <ModalCard
        visible={modal.type === "delete"}
        type="delete"
        title={t("notes.deleteNote")}
        onSubmit={handleDelete}
        onCancel={closeModal}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginBottom: 12,
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filterSection: {
    marginBottom: 12,
  },
  filterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  addCategoryBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addCategoryText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
  },
  filterList: {
    paddingRight: 16,
  },
  filterBtn: {
    backgroundColor: "#e0f7fa",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  filterBtnActive: {
    backgroundColor: "#007bff",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500",
  },
  filterTextActive: {
    color: "#fff",
  },
  pinnedFilter: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e0f7fa",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },
  pinnedFilterActive: {
    backgroundColor: "#007bff",
  },
  pinnedFilterText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
  },
  pinnedFilterTextActive: {
    color: "#fff",
  },
  createFirstBtn: {
    backgroundColor: "#007bff",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 16,
  },
  createFirstText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 32,
    borderRadius: 999,
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  realTimeIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  lastUpdateText: {
    fontSize: 10,
    opacity: 0.7,
  },
});

export default NotesListScreen;
