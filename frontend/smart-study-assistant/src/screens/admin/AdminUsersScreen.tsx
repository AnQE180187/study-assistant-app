import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Alert,
} from "react-native";
import {
  Card,
  Title,
  Paragraph,
  useTheme,
  ActivityIndicator,
  Searchbar,
  IconButton,
  Chip,
  Menu,
  Divider,
} from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import {
  getAdminUsers,
  deleteAdminUser,
  updateUserRole,
  AdminUser,
} from "../../services/adminService";
// import { useAdminRealTimeData } from "../../hooks/useRealTimeData";

const AdminUsersScreen: React.FC = () => {
  const theme = useTheme();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState<{ [key: string]: boolean }>(
    {}
  );

  // Simple fetch function
  const fetchUsers = async () => {
    try {
      const data = await getAdminUsers();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  // Update filtered users when users data changes
  useEffect(() => {
    fetchUsers();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!users) return;

    if (query.trim() === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(
        (user) =>
          (user?.name || "").toLowerCase().includes(query.toLowerCase()) ||
          (user?.email || "").toLowerCase().includes(query.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  };

  const handleDeleteUser = (user: AdminUser) => {
    Alert.alert(
      "Delete User",
      `Are you sure you want to delete ${user?.name || "this user"}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAdminUser(user.id);
              await fetchUsers();
              Alert.alert("Success", "User deleted successfully");
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to delete user");
            }
          },
        },
      ]
    );
  };

  const handleChangeUserRole = (user: AdminUser) => {
    const isAdmin = user.role === "ADMIN";
    const newRole = isAdmin ? "USER" : "ADMIN";
    const action = isAdmin ? "demote" : "promote";

    Alert.alert(
      `${action === "promote" ? "Promote" : "Demote"} User`,
      `Are you sure you want to ${action} ${user?.name || "this user"} ${
        action === "promote" ? "to admin" : "to regular user"
      }?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: action === "promote" ? "Promote" : "Demote",
          style: action === "promote" ? "default" : "destructive",
          onPress: async () => {
            try {
              await updateUserRole(user.id, newRole);
              await fetchUsers();
              Alert.alert("Success", `User ${action}d successfully`);
            } catch (error: any) {
              Alert.alert("Error", error.message || `Failed to ${action} user`);
            }
          },
        },
      ]
    );
  };

  const toggleMenu = (userId: string) => {
    setMenuVisible((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const getEducationLabel = (education?: string) => {
    const labels: { [key: string]: string } = {
      ELEMENTARY: "Elementary",
      MIDDLE_SCHOOL: "Middle School",
      HIGH_SCHOOL: "High School",
      UNIVERSITY: "University",
      GRADUATE: "Graduate",
      OTHER: "Other",
    };
    return education ? labels[education] || education : "N/A";
  };

  const getRoleColor = (role: string) => {
    return role === "ADMIN" ? theme.colors.error : theme.colors.primary;
  };

  // Initial fetch handled by useEffect above

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const renderUserItem = ({ item: user }: { item: AdminUser }) => (
    <Card style={styles.userCard}>
      <Card.Content>
        <View style={styles.userHeader}>
          <View style={styles.userInfo}>
            <Title style={styles.userName}>
              {user?.name || "Unknown User"}
            </Title>
            <Paragraph style={styles.userEmail}>
              {user?.email || "No email"}
            </Paragraph>
          </View>
          <View style={styles.userActions}>
            <Chip
              mode="outlined"
              textStyle={{ color: getRoleColor(user.role) }}
              style={{ borderColor: getRoleColor(user.role) }}
            >
              {user.role}
            </Chip>
            <Menu
              visible={menuVisible[user.id] || false}
              onDismiss={() => toggleMenu(user.id)}
              anchor={
                <IconButton
                  icon="dots-vertical"
                  onPress={() => toggleMenu(user.id)}
                />
              }
            >
              <Menu.Item
                onPress={() => {
                  toggleMenu(user.id);
                  handleChangeUserRole(user);
                }}
                title={
                  user.role === "ADMIN" ? "Demote to User" : "Promote to Admin"
                }
                leadingIcon={
                  user.role === "ADMIN"
                    ? "account-arrow-down"
                    : "account-arrow-up"
                }
              />
              <Menu.Item
                onPress={() => {
                  toggleMenu(user.id);
                  handleDeleteUser(user);
                }}
                title="Delete User"
                leadingIcon="delete"
              />
            </Menu>
          </View>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.userDetails}>
          <View style={styles.detailRow}>
            <Paragraph style={styles.detailLabel}>Education:</Paragraph>
            <Paragraph style={styles.detailValue}>
              {getEducationLabel(user.education)}
            </Paragraph>
          </View>
          <View style={styles.detailRow}>
            <Paragraph style={styles.detailLabel}>Gender:</Paragraph>
            <Paragraph style={styles.detailValue}>
              {user.gender || "N/A"}
            </Paragraph>
          </View>
          <View style={styles.detailRow}>
            <Paragraph style={styles.detailLabel}>Date of Birth:</Paragraph>
            <Paragraph style={styles.detailValue}>
              {user.dateOfBirth ? formatDate(user.dateOfBirth) : "N/A"}
            </Paragraph>
          </View>
          <View style={styles.detailRow}>
            <Paragraph style={styles.detailLabel}>Language:</Paragraph>
            <Paragraph style={styles.detailValue}>
              {user.language === "vi" ? "Tiếng Việt" : "English"}
            </Paragraph>
          </View>
          <View style={styles.detailRow}>
            <Paragraph style={styles.detailLabel}>Joined:</Paragraph>
            <Paragraph style={styles.detailValue}>
              {formatDate(user.createdAt)}
            </Paragraph>
          </View>
        </View>

        {/* User Activity Stats */}
        {user._count && (
          <View style={styles.userStats}>
            <Divider style={styles.divider} />
            <Title style={styles.statsTitle}>Activity</Title>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Paragraph style={styles.statNumber}>
                  {user._count.notes || 0}
                </Paragraph>
                <Paragraph style={styles.statLabel}>Notes</Paragraph>
              </View>
              <View style={styles.statItem}>
                <Paragraph style={styles.statNumber}>
                  {user._count.decks || 0}
                </Paragraph>
                <Paragraph style={styles.statLabel}>Decks</Paragraph>
              </View>
              <View style={styles.statItem}>
                <Paragraph style={styles.statNumber}>
                  {user._count.studyPlans || 0}
                </Paragraph>
                <Paragraph style={styles.statLabel}>Plans</Paragraph>
              </View>
            </View>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Searchbar
        placeholder="Search users by name or email"
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchbar}
      />

      <FlatList
        data={filteredUsers}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
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
  listContainer: {
    paddingBottom: 16,
  },
  userCard: {
    marginBottom: 12,
    elevation: 2,
  },
  userHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    opacity: 0.7,
  },
  userActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  divider: {
    marginVertical: 12,
  },
  userDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailLabel: {
    fontWeight: "bold",
    flex: 1,
  },
  detailValue: {
    flex: 1,
    textAlign: "right",
  },
  userStats: {
    marginTop: 8,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2196F3",
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
});

export default AdminUsersScreen;
