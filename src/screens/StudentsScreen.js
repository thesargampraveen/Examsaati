import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing, typography } from '../theme';
import { Avatar, Card, PrimaryButton, SecondaryButton } from '../components/ui';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import ReportBlockSheet from '../components/ReportBlockSheet';
import ExamMeta from '../components/ExamMeta';

export default function StudentsScreen({ navigation }) {
  const { user } = useAuth();
  const [students, setStudents] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [reportTarget, setReportTarget] = useState(null);
  const [friends, setFriends] = useState([]);
  const poll = useRef(null);

  const load = useCallback(async () => {
    try {
      if (!user?.examCenter) {
        setStudents([]);
        return;
      }
      const [s, f] = await Promise.all([
        api.getCenterStudents(user.examCenter._id || user.examCenter),
        api.getFriends(),
      ]);
      setStudents(s.students || []);
      setFriends((f.friends || []).map((x) => x.friend._id));
    } catch (err) {
      setStudents([]);
    }
  }, [user]);

  useEffect(() => {
    load();
    poll.current = setInterval(load, 15000);
    return () => clearInterval(poll.current);
  }, [load]);

  const connect = async (student) => {
    setBusyId(student._id);
    try {
      await api.connect(student._id);
      setStudents((prev) =>
        prev.map((s) => (s._id === student._id ? { ...s, requestSent: true } : s))
      );
    } catch (err) {
      if (err.message.includes('already exists')) {
        setStudents((prev) =>
          prev.map((s) => (s._id === student._id ? { ...s, requestSent: true } : s))
        );
      } else {
        Alert.alert('Error', err.message);
      }
    } finally {
      setBusyId(null);
    }
  };

  const renderStudent = ({ item }) => {
    const isFriend = friends.includes(item._id) || item.connectionStatus === 'friends';
    const requestSent = item.requestSent || item.connectionStatus === 'pending_sent';
    const requestReceived = item.connectionStatus === 'pending_received';
    return (
      <Card style={styles.card}>
        <View style={styles.row}>
          <Avatar name={item.name} color={item.avatarColor} />
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text style={styles.name}>{item.name || 'Student'}</Text>
            <Text style={styles.meta}>
              {item.exam || 'Student'}
              {item.homeCity ? ` · ${item.homeCity}` : ''}
            </Text>
            {!!item.gender && <Text style={styles.meta}>{item.gender}</Text>}
            <ExamMeta user={item} style={{ marginTop: 4 }} />
          </View>
          <TouchableOpacity onPress={() => setReportTarget(item)}>
            <Text style={styles.reportLink}>Report</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.md }}>
          {isFriend ? (
            <SecondaryButton
              title="Message"
              icon="message-text-outline"
              style={{ flex: 1 }}
              onPress={() => navigation.navigate('Chat', { friend: item })}
            />
          ) : requestSent ? (
            <SecondaryButton title="Request sent" icon="check" style={{ flex: 1 }} />
          ) : requestReceived ? (
            <SecondaryButton title="Request received" icon="bell-outline" style={{ flex: 1 }} />
          ) : (
            <PrimaryButton
              title="Connect"
              onPress={() => connect(item)}
              loading={busyId === item._id}
              style={{ flex: 1 }}
            />
          )}
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Students at your center</Text>
        <Text style={styles.headerSub}>
          {user?.examCenter?.name || user?.examCenter
            ? `${user.examCenter?.name ?? 'Your center'} · ${user?.exam || ''}`
            : 'Select your center in profile setup'}
        </Text>
        <Text style={styles.headerNote}>
          Showing only students with the same exam AND same center
        </Text>
      </View>

      {students === null ? (
        <ActivityIndicator style={{ marginTop: spacing.xxl }} color={colors.primary} />
      ) : students.length === 0 ? (
        <View style={styles.empty}>
          <MaterialCommunityIcons name="account-group-outline" size={48} color={colors.textMuted} style={styles.emptyIcon} />
          <Text style={styles.emptyTitle}>No matching students yet</Text>
          <Text style={styles.emptyText}>
            Only students with the same exam AND same exam center appear here. As more of
            them join, they will show up in this list.
          </Text>
        </View>
      ) : (
        <FlatList
          data={students}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: spacing.lg }}
          renderItem={renderStudent}
        />
      )}

      <ReportBlockSheet
        visible={!!reportTarget}
        targetUser={reportTarget}
        onClose={() => setReportTarget(null)}
        onDone={load}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { backgroundColor: colors.primary, padding: spacing.xl, paddingBottom: spacing.lg },
  headerTitle: { fontSize: 22, fontWeight: '800', color: colors.white },
  headerSub: { fontSize: 13, color: colors.primaryLight, marginTop: 2 },
  headerNote: { fontSize: 11, color: colors.primaryLight, marginTop: 4, opacity: 0.85 },
  card: { marginBottom: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center' },
  name: { fontSize: 16, fontWeight: '700', color: colors.text },
  meta: { fontSize: 13, color: colors.textSecondary, marginTop: 1, textTransform: 'capitalize' },
  reportLink: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  empty: { alignItems: 'center', padding: spacing.xxl, marginTop: spacing.xxl },
  emptyIcon: { marginBottom: spacing.md },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  emptyText: { ...typography.secondary, textAlign: 'center', marginTop: spacing.sm },
});
