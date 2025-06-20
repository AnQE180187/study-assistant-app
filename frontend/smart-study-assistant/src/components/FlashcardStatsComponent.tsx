import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import colors from "../constants/colors";
import { getFlashcardStats } from "../services/flashcardService";

const { width } = Dimensions.get("window");

interface FlashcardStats {
  totalCards: number;
  totalDecks: number;
  categoriesCount: Record<string, number>;
  recentActivity: number;
}

const FlashcardStatsComponent: React.FC = () => {
  const [stats, setStats] = useState<FlashcardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const flashcardStats = await getFlashcardStats();
      setStats(flashcardStats);
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string, index: number) => {
    const colors = [
      "#4F8EF7",
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#96CEB4",
      "#FFEAA7",
      "#DDA0DD",
      "#98D8C8",
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Đang tải thống kê...</Text>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Không thể tải thống kê</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Overview Cards */}
      <View style={styles.overviewContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalCards}</Text>
          <Text style={styles.statLabel}>Tổng số thẻ</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalDecks}</Text>
          <Text style={styles.statLabel}>Bộ thẻ</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.recentActivity}</Text>
          <Text style={styles.statLabel}>Tuần này</Text>
        </View>
      </View>

      {/* Categories Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Phân loại theo chủ đề</Text>
        <View style={styles.categoriesContainer}>
          {Object.entries(stats.categoriesCount).map(
            ([category, count], index) => (
              <View key={category} style={styles.categoryItem}>
                <View style={styles.categoryHeader}>
                  <View
                    style={[
                      styles.categoryColor,
                      { backgroundColor: getCategoryColor(category, index) },
                    ]}
                  />
                  <Text style={styles.categoryName}>{category}</Text>
                  <Text style={styles.categoryCount}>{count} thẻ</Text>
                </View>

                {/* Progress bar */}
                <View style={styles.progressContainer}>
                  <View
                    style={[
                      styles.progressBar,
                      {
                        width: `${(count / stats.totalCards) * 100}%`,
                        backgroundColor: getCategoryColor(category, index),
                      },
                    ]}
                  />
                </View>
              </View>
            )
          )}
        </View>
      </View>

      {/* Learning Progress */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tiến độ học tập</Text>
        <View style={styles.progressSection}>
          <View style={styles.progressItem}>
            <Text style={styles.progressLabel}>Đã hoàn thành</Text>
            <View style={styles.progressCircle}>
              <Text style={styles.progressPercentage}>75%</Text>
            </View>
          </View>

          <View style={styles.progressItem}>
            <Text style={styles.progressLabel}>Đang học</Text>
            <View
              style={[styles.progressCircle, styles.progressCircleSecondary]}
            >
              <Text style={styles.progressPercentage}>20%</Text>
            </View>
          </View>

          <View style={styles.progressItem}>
            <Text style={styles.progressLabel}>Khó khăn</Text>
            <View style={[styles.progressCircle, styles.progressCircleError]}>
              <Text style={styles.progressPercentage}>5%</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Study Streak */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Chuỗi học tập</Text>
        <View style={styles.streakContainer}>
          <View style={styles.streakCard}>
            <Text style={styles.streakNumber}>7</Text>
            <Text style={styles.streakLabel}>Ngày liên tiếp</Text>
          </View>
          <View style={styles.streakCard}>
            <Text style={styles.streakNumber}>42</Text>
            <Text style={styles.streakLabel}>Thẻ đã ôn</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thao tác nhanh</Text>
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>📊 Báo cáo chi tiết</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>📤 Xuất dữ liệu</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>🎯 Đặt mục tiêu</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: colors.error,
  },
  overviewContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  statCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    width: (width - 60) / 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 16,
  },
  categoriesContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  categoryItem: {
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  categoryName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  categoryCount: {
    fontSize: 12,
    color: "#666",
  },
  progressContainer: {
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 2,
  },
  progressSection: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressItem: {
    alignItems: "center",
    flex: 1,
  },
  progressLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 12,
    textAlign: "center",
  },
  progressCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  progressCircleSecondary: {
    backgroundColor: colors.secondary,
  },
  progressCircleError: {
    backgroundColor: colors.error,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
  },
  streakContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  streakCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    width: (width - 60) / 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  streakNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 4,
  },
  streakLabel: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    textAlign: "center",
  },
});

export default FlashcardStatsComponent;
