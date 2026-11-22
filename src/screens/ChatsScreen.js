import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { colors, radius, spacing, shadow, typography } from '../theme';
import { Avatar, Card } from '../components/ui';
import { api } from '../api/client';
import ExamMeta from '../components/ExamMeta';

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
          <ExamMeta user={item.requester} style={{ marginTop: 2 }} />
        </View>
      </View>
      <View style={styles.actionRow}>
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
      activeOpacity={0.7}
      onPress={() => navigation.navigate('Chat', { friend: item.friend })}
    >
      <Avatar name={item.friend.name} color={item.friend.avatarColor} size={48} />
      <View style={{ flex: 1, marginLeft: spacing.md }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={styles.name} numberOfLines={1}>{item.friend.name || 'Student'}</Text>
          {item.unread > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.unread}</Text>
            </View>
          )}
        </View>
        <Text style={styles.preview} numberOfLines={1}>
          {item.lastMessage
            ? `${item.lastMessage.sender === item.friend._id ? '' : 'You: '}${item.lastMessage.text}`
            : `Say hi to ${item.friend.name?.split(' ')[0] || 'your saathi'}`}
        </Text>
        <ExamMeta user={item.friend} style={{ marginTop: 2 }} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chats</Text>
        <Text style={styles.headerSubtitle}>Talk to your saathis at the exam center</Text>
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
              <View style={styles.emptyIconWrap}>
                <MaterialCommunityIcons name="message-text-outline" size={32} color={colors.primary} />
              </View>
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
  header: {
    backgroundColor: colors.primary,
    padding: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
    ...shadow,
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: colors.white },
  headerSubtitle: { fontSize: 13, color: colors.primaryLight, marginTop: 2 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  requestCard: { marginHorizontal: spacing.lg, marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center' },
  actionRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  actionText: { color: colors.white, fontWeight: '700', fontSize: 14 },
  thread: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  name: { fontSize: 15, fontWeight: '700', color: colors.text, flexShrink: 1 },
  meta: { fontSize: 12, color: colors.textSecondary, marginTop: 1 },
  preview: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  badge: {
    backgroundColor: colors.accent,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginLeft: spacing.sm,
  },
  badgeText: { color: colors.white, fontSize: 11, fontWeight: '700' },
  empty: { alignItems: 'center', padding: spacing.xxl, marginTop: spacing.xxl },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
  emptyText: { ...typography.secondary, textAlign: 'center', maxWidth: 260 },
});
