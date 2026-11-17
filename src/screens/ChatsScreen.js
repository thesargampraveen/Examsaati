import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { colors, radius, spacing, typography } from '../theme';
import { Avatar, Card } from '../components/ui';
import { api } from '../api/client';

export default function ChatsScreen({ navigation }) {
  const [threads, setThreads] = useState(null);
  const [requests, setRequests] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [t, r] = await Promise.all([api.getThreads(), api.getRequests()]);
      setThreads(t.threads || []);
      setRequests(r.requests || []);
    } catch {
      setThreads((prev) => prev || []);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const respond = async (id, action) => {
    try {
      if (action === 'accept') await api.acceptRequest(id);
      else await api.declineRequest(id);
      load();
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const renderRequest = ({ item }) => (
    <Card style={styles.requestCard}>
      <View style={styles.row}>
        <Avatar name={item.requester.name} color={item.requester.avatarColor} size={40} />
        <View style={{ flex: 1, marginLeft: spacing.md }}>
          <Text style={styles.name}>{item.requester.name || 'Student'}</Text>
          <Text style={styles.meta}>wants to connect · {item.requester.exam || ''}</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.md }}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.accent }]}
          onPress={() => respond(item._id, 'accept')}
        >
          <Text style={styles.actionText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border }]}
          onPress={() => respond(item._id, 'decline')}
        >
          <Text style={[styles.actionText, { color: colors.textSecondary }]}>Decline</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  const renderThread = ({ item }) => (
    <TouchableOpacity
      style={styles.thread}
      onPress={() => navigation.navigate('Chat', { friend: item.friend })}
    >
      <Avatar name={item.friend.name} color={item.friend.avatarColor} size={48} />
      <View style={{ flex: 1, marginLeft: spacing.md }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={styles.name}>{item.friend.name || 'Student'}</Text>
          {item.unread > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.unread}</Text>
            </View>
          )}
        </View>
        <Text style={styles.preview} numberOfLines={1}>
          {item.lastMessage
            ? `${item.lastMessage.sender === item.friend._id ? '' : 'You: '}${item.lastMessage.text}`
            : `Say hi to ${item.friend.name?.split(' ')[0] || 'your saathi'} 👋`}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chats</Text>
      </View>

      {threads === null ? (
        <ActivityIndicator style={{ marginTop: spacing.xxl }} color={colors.primary} />
      ) : (
        <FlatList
          data={threads}
          keyExtractor={(item) => String(item.friend._id)}
          renderItem={renderThread}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ paddingBottom: spacing.xl }}
          ListHeaderComponent={
            requests.length > 0 ? (
              <View style={{ paddingTop: spacing.md }}>
                <Text style={styles.sectionLabel}>
                  Connect requests ({requests.length})
                </Text>
                {requests.map((r) => (
                  <View key={r._id}>{renderRequest({ item: r })}</View>
                ))}
                <Text style={[styles.sectionLabel, { marginTop: spacing.lg }]}>Messages</Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>💬</Text>
              <Text style={styles.emptyTitle}>No chats yet</Text>
              <Text style={styles.emptyText}>
                Connect with students at your center to start chatting.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { backgroundColor: colors.primary, padding: spacing.xl, paddingBottom: spacing.lg },
  headerTitle: { fontSize: 22, fontWeight: '800', color: colors.white },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  requestCard: { marginHorizontal: spacing.lg, marginBottom: spacing.sm },
  thread: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.bg,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  name: { fontSize: 15, fontWeight: '700', color: colors.text },
  meta: { fontSize: 12, color: colors.textSecondary, marginTop: 1 },
  preview: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  badge: {
    backgroundColor: colors.primary,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: { color: colors.white, fontSize: 11, fontWeight: '700' },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  actionText: { color: colors.white, fontWeight: '700', fontSize: 14 },
  empty: { alignItems: 'center', padding: spacing.xxl, marginTop: spacing.xxl },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  emptyText: { ...typography.secondary, textAlign: 'center', marginTop: spacing.sm },
});
