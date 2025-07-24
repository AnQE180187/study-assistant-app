import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
  Dimensions,
} from "react-native";
import {
  Card,
  Title,
  Paragraph,
  useTheme,
  ActivityIndicator,
  List,
  Divider,
  IconButton,
  Chip,
  Surface,
} from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
} from "react-native-chart-kit";
import {
  getAdminStats,
  getRecentUsers,
  AdminStats,
  AdminUser,
} from "../../services/adminService";
import { useTranslation } from "react-i18next";

const screenWidth = Dimensions.get("window").width;

const AdminDashboardScreen: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [usersLoading, setUsersLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const data = await getAdminStats();
      console.log("Admin stats received:", data);
      setStats(data);
    } catch (error: any) {
      console.error("Error fetching admin stats:", error);
      Alert.alert("Error", error.message || "Failed to fetch statistics");
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentUsers = async () => {
    setUsersLoading(true);
    try {
      const users = await getRecentUsers(5);
      console.log("Recent users received:", users);
      setRecentUsers(users);
    } catch (error: any) {
      console.error("Error fetching recent users:", error);
      // Don't show alert for users, just log the error
      setRecentUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchStats(), fetchRecentUsers()]);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchStats();
    fetchRecentUsers();

    // Auto refresh every 30 seconds
    const interval = setInterval(() => {
      fetchStats();
      fetchRecentUsers();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Chart configurations
  const chartConfig = {
    backgroundColor: theme.colors.surface,
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
    labelColor: (opacity = 1) => theme.colors.onSurface,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: "#2196F3",
    },
  };

  // Generate user role pie chart data
  const getUserRoleData = () => {
    if (!stats?.users?.byRole) return [];

    const colors = ["#4CAF50", "#FF9800", "#F44336", "#9C27B0"];
    return Object.entries(stats.users.byRole).map(([role, count], index) => ({
      name: role.charAt(0).toUpperCase() + role.slice(1).toLowerCase(),
      population: count as number,
      color: colors[index % colors.length],
      legendFontColor: theme.colors.onSurface,
      legendFontSize: 12,
    }));
  };

  // Generate content distribution data
  const getContentData = () => {
    // Return empty data if stats or content is not available
    if (!stats || !stats.content) {
      return {
        labels: ["Notes", "Decks", "Flashcards", "Plans"],
        datasets: [{ data: [0, 0, 0, 0] }],
      };
    }

    return {
      labels: ["Notes", "Decks", "Flashcards", "Plans"],
      datasets: [
        {
          data: [
            stats.content.notes || 0,
            stats.content.decks || 0,
            stats.content.flashcards || 0,
            stats.content.studyPlans || 0,
          ],
        },
      ],
    };
  };

  // Generate progress data
  const getProgressData = () => {
    // Return safe default data if stats is not available
    if (!stats) {
      return {
        labels: ["New Users", "Admin Ratio", "Activity"],
        data: [0, 0, 0],
      };
    }

    const total = stats.users?.total || 1;
    const newUsers = stats.users?.newLast30Days || 0;
    const adminCount =
      stats.users?.byRole?.admin || stats.users?.byRole?.ADMIN || 0;

    return {
      labels: ["New Users", "Admin Ratio", "Activity"],
      data: [
        Math.min(newUsers / total, 1),
        Math.min(adminCount / total, 1),
        Math.min((stats.content?.notes || 0) / 100, 1), // Activity based on content
      ],
    };
  };

  // Format uptime
  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const StatCard = ({
    title,
    value,
    icon,
    color,
    subtitle,
  }: {
    title: string;
    value: number;
    icon: keyof typeof MaterialIcons.glyphMap;
    color: string;
    subtitle?: string;
  }) => (
    <Card style={[styles.statCard, { backgroundColor: color }]}>
      <Card.Content style={styles.statCardContent}>
        <View style={styles.statInfo}>
          <Title style={[styles.statValue, { color: "#fff" }]}>{value}</Title>
          <Paragraph style={[styles.statTitle, { color: "#fff" }]}>
            {title}
          </Paragraph>
          {subtitle && (
            <Paragraph
              style={[styles.statSubtitle, { color: "rgba(255,255,255,0.8)" }]}
            >
              {subtitle}
            </Paragraph>
          )}
        </View>
        <MaterialIcons name={icon} size={40} color="#fff" />
      </Card.Content>
    </Card>
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getRoleColor = (role: string) => {
    return role === "ADMIN" ? theme.colors.error : theme.colors.primary;
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header with System Info */}
      <Surface style={styles.headerCard}>
        <View style={styles.headerContent}>
          <View>
            <Title style={styles.headerTitle}>Admin Dashboard</Title>
            <Paragraph style={styles.headerSubtitle}>
              System Overview & Analytics
            </Paragraph>
          </View>
          {/* <View style={styles.systemInfo}>
            <Chip icon="server" mode="outlined" style={styles.systemChip}>
              {stats?.system?.environment || "dev"}
            </Chip>
            <Paragraph style={styles.uptimeText}>
              Uptime: {formatUptime(stats?.system?.uptime || 0)}
            </Paragraph>
          </View> */}
        </View>
      </Surface>

      {/* Statistics Cards */}
      <View style={styles.statsContainer}>
        <StatCard
          title="Total Users"
          value={stats?.users?.total || stats?.totalUsers || 0}
          icon="people"
          color="#4CAF50"
          subtitle={`+${stats?.users?.newLast30Days || 0} this month`}
        />
        <StatCard
          title="Total Decks"
          value={stats?.content?.decks || stats?.totalDecks || 0}
          icon="library-books"
          color="#2196F3"
          subtitle="Flashcard collections"
        />
        <StatCard
          title="Total Flashcards"
          value={stats?.content?.flashcards || stats?.totalFlashcards || 0}
          icon="style"
          color="#FF9800"
          subtitle="Learning cards"
        />
        <StatCard
          title="Total Notes"
          value={stats?.content?.notes || 0}
          icon="note"
          color="#9C27B0"
          subtitle="Study materials"
        />
      </View>

      {/* Charts Section */}
      {stats && (
        <View style={styles.chartsSection}>
          {/* User Role Distribution */}
          <Card style={styles.chartCard}>
            <Card.Content>
              <Title style={styles.chartTitle}>User Role Distribution</Title>
              {(() => {
                try {
                  const roleData = getUserRoleData();
                  return roleData.length > 0 ? (
                    <PieChart
                      data={roleData}
                      width={screenWidth - 60}
                      height={220}
                      chartConfig={chartConfig}
                      accessor="population"
                      backgroundColor="transparent"
                      paddingLeft="15"
                      center={[10, 10]}
                      absolute
                    />
                  ) : (
                    <View style={styles.noDataContainer}>
                      <Paragraph>No user role data available</Paragraph>
                    </View>
                  );
                } catch (error) {
                  console.error("Error rendering pie chart:", error);
                  return (
                    <View style={styles.noDataContainer}>
                      <Paragraph>Error loading chart data</Paragraph>
                    </View>
                  );
                }
              })()}
            </Card.Content>
          </Card>

          {/* Content Distribution */}
          <Card style={styles.chartCard}>
            <Card.Content>
              <Title style={styles.chartTitle}>Content Distribution</Title>
              {(() => {
                try {
                  return (
                    <BarChart
                      data={getContentData()}
                      width={screenWidth - 60}
                      height={220}
                      chartConfig={chartConfig}
                      verticalLabelRotation={30}
                      showValuesOnTopOfBars
                      yAxisLabel=""
                      yAxisSuffix=""
                    />
                  );
                } catch (error) {
                  console.error("Error rendering bar chart:", error);
                  return (
                    <View style={styles.noDataContainer}>
                      <Paragraph>Error loading content chart</Paragraph>
                    </View>
                  );
                }
              })()}
            </Card.Content>
          </Card>

          {/* Progress Indicators */}
          <Card style={styles.chartCard}>
            <Card.Content>
              <Title style={styles.chartTitle}>System Health</Title>
              {(() => {
                try {
                  return (
                    <ProgressChart
                      data={getProgressData()}
                      width={screenWidth - 60}
                      height={220}
                      strokeWidth={16}
                      radius={32}
                      chartConfig={chartConfig}
                      hideLegend={false}
                    />
                  );
                } catch (error) {
                  console.error("Error rendering progress chart:", error);
                  return (
                    <View style={styles.noDataContainer}>
                      <Paragraph>Error loading progress chart</Paragraph>
                    </View>
                  );
                }
              })()}
            </Card.Content>
          </Card>
        </View>
      )}

      {/* Recent Users */}
      <Card style={styles.recentUsersCard}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Title>{t("admin.recentUsers")}</Title>
            <Paragraph style={styles.cardSubtitle}>
              {recentUsers?.length || 0} users
            </Paragraph>
          </View>
          <Divider style={styles.divider} />

          {usersLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" />
              <Paragraph style={styles.loadingText}>Loading users...</Paragraph>
            </View>
          ) : recentUsers && recentUsers.length > 0 ? (
            recentUsers.map((user: AdminUser, index: number) => (
                <List.Item
                  key={user.id || index}
                  title={
                    user?.name ||
                    user?.fullName ||
                    user?.firstName + " " + user?.lastName ||
                    t("admin.unknownUser")
                  }
                  description={`${user?.email || t("admin.noEmail")} • ${
                    user.createdAt ? formatDate(user.createdAt) : "No date"
                  }`}
                  left={(props) => (
                    <List.Icon
                      {...props}
                      icon="account-circle"
                      color={getRoleColor(user.role)}
                    />
                  )}
                  right={(props) => (
                    <View style={styles.userRole}>
                      <Chip
                        mode="outlined"
                        textStyle={[
                          styles.roleChip,
                          { color: getRoleColor(user.role) },
                        ]}
                        style={[
                          styles.roleChipContainer,
                          { borderColor: getRoleColor(user.role) },
                        ]}
                      >
                        {(user.role || "USER").toUpperCase()}
                      </Chip>
                    </View>
                  )}
                  style={styles.userListItem}
                />
              ))
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="people-outline" size={48} color="#ccc" />
              <Paragraph style={styles.noDataText}>
                {t("admin.noRecentUsers")}
              </Paragraph>
              <Paragraph style={styles.noDataSubtext}>
                New users will appear here
              </Paragraph>
            </View>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
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
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statCard: {
    width: "48%",
    marginBottom: 12,
    elevation: 4,
  },
  statCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
  },
  statSubtitle: {
    fontSize: 12,
    marginTop: 4,
  },
  headerCard: {
    marginBottom: 16,
    elevation: 2,
    borderRadius: 12,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  headerSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  systemInfo: {
    alignItems: "flex-end",
  },
  systemChip: {
    marginBottom: 8,
  },
  uptimeText: {
    fontSize: 12,
    opacity: 0.7,
  },
  chartsSection: {
    marginTop: 16,
  },
  chartCard: {
    marginBottom: 16,
    elevation: 2,
    borderRadius: 12,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  recentUsersCard: {
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 12,
    opacity: 0.7,
  },
  divider: {
    marginVertical: 8,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 8,
    opacity: 0.7,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 32,
  },
  noDataText: {
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 12,
    marginBottom: 4,
    opacity: 0.7,
    fontSize: 16,
  },
  noDataSubtext: {
    textAlign: "center",
    fontSize: 12,
    opacity: 0.5,
  },
  roleChip: {
    fontSize: 10,
    fontWeight: "bold",
  },
  roleChipContainer: {
    height: 24,
  },
  userListItem: {
    paddingVertical: 4,
  },
  userRole: {
    justifyContent: "center",
    alignItems: "center",
  },
  roleText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  noDataContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default AdminDashboardScreen;
