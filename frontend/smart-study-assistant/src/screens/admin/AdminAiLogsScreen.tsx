import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Alert,
  Modal,
  ScrollView,
} from "react-native";
import {
  Card,
  Title,
  Paragraph,
  useTheme,
  ActivityIndicator,
  Searchbar,
  IconButton,
  Button,
  Portal,
  Dialog,
  Chip,
  Divider,
} from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { getAiLogs, deleteAiLog, AiLog } from "../../services/adminService";

const AdminAiLogsScreen: React.FC = () => {
  const theme = useTheme();
  const [logs, setLogs] = useState<AiLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AiLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLog, setSelectedLog] = useState<AiLog | null>(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchLogs = async (pageNum = 1, search?: string) => {
    try {
      const data = await getAiLogs(pageNum, 20, search);
      if (pageNum === 1) {
        setLogs(data.logs);
        setFilteredLogs(data.logs);
      } else {
        setLogs((prev) => [...prev, ...data.logs]);
        setFilteredLogs((prev) => [...prev, ...data.logs]);
      }
      setHasMore(data.logs.length === 20);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to fetch AI logs");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await fetchLogs(1, searchQuery);
    setRefreshing(false);
  };

  const loadMore = async () => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      await fetchLogs(nextPage, searchQuery);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredLogs(logs);
    } else {
      const filtered = logs.filter(
        (log) =>
          log.prompt.toLowerCase().includes(query.toLowerCase()) ||
          log.response.toLowerCase().includes(query.toLowerCase()) ||
          (log.user?.name || "").toLowerCase().includes(query.toLowerCase()) ||
          (log.user?.email || "").toLowerCase().includes(query.toLowerCase())
      );
      setFilteredLogs(filtered);
    }
  };

  const handleDeleteLog = (log: AiLog) => {
    Alert.alert(
      "Delete AI Log",
      "Are you sure you want to delete this AI interaction log?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAiLog(log.id);
              await onRefresh();
              Alert.alert("Success", "AI log deleted successfully");
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to delete AI log");
            }
          },
        },
      ]
    );
  };

  const handleViewDetails = (log: AiLog) => {
    setSelectedLog(log);
    setDialogVisible(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  if (loading && page === 1) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const renderLogItem = ({ item: log }: { item: AiLog }) => (
    <Card style={styles.logCard}>
      <Card.Content>
        <View style={styles.logHeader}>
          <View style={styles.userInfo}>
            <Title style={styles.userName}>
              {log.user?.name || "Unknown User"}
            </Title>
            <Paragraph style={styles.userEmail}>
              {log.user?.email || "No email"}
            </Paragraph>
          </View>
          <View style={styles.logActions}>
            <Chip mode="outlined" icon="memory" style={styles.aiChip}>
              AI Log
            </Chip>
            <IconButton
              icon="eye"
              onPress={() => handleViewDetails(log)}
              size={20}
            />
            <IconButton
              icon="delete"
              onPress={() => handleDeleteLog(log)}
              size={20}
            />
          </View>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.logContent}>
          <View style={styles.promptSection}>
            <Paragraph style={styles.sectionLabel}>Prompt:</Paragraph>
            <Paragraph style={styles.promptText}>
              {truncateText(log.prompt, 150)}
            </Paragraph>
          </View>

          <View style={styles.responseSection}>
            <Paragraph style={styles.sectionLabel}>Response:</Paragraph>
            <Paragraph style={styles.responseText}>
              {truncateText(log.response, 150)}
            </Paragraph>
          </View>
        </View>

        <View style={styles.logMeta}>
          <View style={styles.metaRow}>
            <MaterialIcons
              name="schedule"
              size={16}
              color={theme.colors.onSurface}
            />
            <Paragraph style={styles.metaText}>
              {formatDate(log.createdAt)}
            </Paragraph>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons
        name="memory"
        size={64}
        color={theme.colors.onSurface}
        style={styles.emptyIcon}
      />
      <Title style={styles.emptyTitle}>No AI Logs Found</Title>
      <Paragraph style={styles.emptyDescription}>
        {searchQuery
          ? "No AI interaction logs match your search criteria."
          : "No AI interactions have been logged yet."}
      </Paragraph>
    </View>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Searchbar
        placeholder="Search AI logs by prompt, response, or user"
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchbar}
      />

      <View style={styles.statsContainer}>
        <Chip icon="memory" mode="outlined">
          {filteredLogs.length} AI Interactions
        </Chip>
      </View>

      <FlatList
        data={filteredLogs}
        renderItem={renderLogItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={EmptyState}
        ListFooterComponent={
          loading && page > 1 ? (
            <ActivityIndicator
              size="small"
              color={theme.colors.primary}
              style={styles.loadingFooter}
            />
          ) : null
        }
      />

      {/* Detail Dialog */}
      <Portal>
        <Dialog
          visible={dialogVisible}
          onDismiss={() => setDialogVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title>AI Interaction Details</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView contentContainerStyle={styles.dialogContent}>
              {selectedLog && (
                <>
                  <View style={styles.dialogSection}>
                    <Title style={styles.dialogSectionTitle}>User</Title>
                    <Paragraph>
                      {selectedLog.user?.name || "Unknown User"} (
                      {selectedLog.user?.email || "No email"})
                    </Paragraph>
                    <Paragraph style={styles.dialogDate}>
                      {formatDate(selectedLog.createdAt)}
                    </Paragraph>
                  </View>

                  <Divider style={styles.dialogDivider} />

                  <View style={styles.dialogSection}>
                    <Title style={styles.dialogSectionTitle}>Prompt</Title>
                    <Paragraph style={styles.dialogText}>
                      {selectedLog.prompt}
                    </Paragraph>
                  </View>

                  <Divider style={styles.dialogDivider} />

                  <View style={styles.dialogSection}>
                    <Title style={styles.dialogSectionTitle}>Response</Title>
                    <Paragraph style={styles.dialogText}>
                      {selectedLog.response}
                    </Paragraph>
                  </View>
                </>
              )}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Close</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  searchbar: {
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  listContainer: {
    paddingBottom: 16,
  },
  logCard: {
    marginBottom: 12,
    elevation: 2,
  },
  logHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    opacity: 0.7,
  },
  logActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  aiChip: {
    marginRight: 8,
  },
  divider: {
    marginVertical: 12,
  },
  logContent: {
    marginBottom: 12,
  },
  promptSection: {
    marginBottom: 12,
  },
  responseSection: {
    marginBottom: 8,
  },
  sectionLabel: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  promptText: {
    fontSize: 14,
    fontStyle: "italic",
  },
  responseText: {
    fontSize: 14,
  },
  logMeta: {
    gap: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metaText: {
    fontSize: 12,
    opacity: 0.8,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 64,
  },
  emptyIcon: {
    opacity: 0.3,
    marginBottom: 16,
  },
  emptyTitle: {
    textAlign: "center",
    marginBottom: 8,
  },
  emptyDescription: {
    textAlign: "center",
    opacity: 0.7,
    paddingHorizontal: 32,
  },
  loadingFooter: {
    paddingVertical: 16,
  },
  dialog: {
    maxHeight: "80%",
  },
  dialogContent: {
    paddingHorizontal: 24,
  },
  dialogSection: {
    marginBottom: 16,
  },
  dialogSectionTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  dialogText: {
    fontSize: 14,
    lineHeight: 20,
  },
  dialogDate: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  dialogDivider: {
    marginVertical: 16,
  },
});

export default AdminAiLogsScreen;
