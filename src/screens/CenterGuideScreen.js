import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CATEGORY_META, colors, radius, spacing, typography } from '../theme';
import { Avatar, Card, PrimaryButton } from '../components/ui';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function CenterGuideScreen() {
  const { user } = useAuth();
  const centerId = user?.examCenter?._id || user?.examCenter;
  const [tips, setTips] = useState(null);
  const [category, setCategory] = useState('route');
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);

  const load = useCallback(async () => {
    if (!centerId) return;
    try {
      const res = await api.getGuideTips(centerId);
      setTips(res.tips || []);
    } catch {
      setTips([]);
    }
  }, [centerId]);

  useEffect(() => {
    load();
  }, [load]);

  const post = async () => {
    if (!text.trim()) return;
    setPosting(true);
    try {
      await api.addGuideTip(centerId, category, text.trim());
      setText('');
      load();
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setPosting(false);
    }
  };

  const removeTip = async (id) => {
    try {
      await api.deleteGuideTip(id);
      load();
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  if (!centerId) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📖</Text>
          <Text style={styles.emptyTitle}>Select your exam center first</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Center guide</Text>
        <Text style={styles.headerSub}>{user.examCenter?.name || 'Your exam center'}</Text>
      </View>

      <FlatList
        data={tips || []}
        keyExtractor={(t) => t._id}
        contentContainerStyle={{ padding: spacing.lg }}
        ListHeaderComponent={
          <Card style={{ marginBottom: spacing.lg }}>
            <Text style={styles.shareTitle}>Share something useful 📝</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginVertical: spacing.md }}>
              {Object.entries(CATEGORY_META).map(([key, meta]) => (
                <TouchableOpacity
                  key={key}
                  onPress={() => setCategory(key)}
                  style={[styles.catChip, category === key && styles.catChipActive]}
                >
                  <Text style={[styles.catText, category === key && styles.catTextActive]}>
                    {meta.icon} {meta.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.input}
              value={text}
              onChangeText={setText}
              placeholder="e.g. Gate 3 is least crowded; idli shop behind the school is cheap and clean"
              placeholderTextColor={colors.textMuted}
              multiline
              maxLength={1000}
            />
            <PrimaryButton title="Share with students" onPress={post} loading={posting} disabled={!text.trim()} />
          </Card>
        }
        ListEmptyComponent={
          tips === null ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.lg }} />
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🗺️</Text>
              <Text style={styles.emptyTitle}>No tips yet</Text>
              <Text style={styles.emptyText}>Be the first to share a route or food tip!</Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <Card style={styles.tip}>
            <View style={styles.tipHeader}>
              <Text style={styles.catBadge}>
                {CATEGORY_META[item.category]?.icon || '💡'} {CATEGORY_META[item.category]?.label || 'Tip'}
              </Text>
              {item.author?._id === user?._id && (
                <TouchableOpacity onPress={() => removeTip(item._id)}>
                  <Text style={styles.delete}>Delete</Text>
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.tipText}>{item.text}</Text>
            <View style={styles.tipFooter}>
              <Avatar name={item.author?.name} color={item.author?.avatarColor} size={22} />
              <Text style={styles.tipAuthor}>
                {item.author?._id === user?._id ? 'You' : item.author?.name || 'Student'}
              </Text>
              <Text style={styles.tipDate}>· {new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
          </Card>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { backgroundColor: colors.primary, padding: spacing.xl, paddingBottom: spacing.lg },
  headerTitle: { fontSize: 22, fontWeight: '800', color: colors.white },
  headerSub: { fontSize: 13, color: colors.primaryLight, marginTop: 2 },
  shareTitle: { ...typography.h2 },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.full,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  catChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  catText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  catTextActive: { color: colors.white },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.bg,
    padding: spacing.md,
    minHeight: 80,
    fontSize: 14,
    color: colors.text,
    textAlignVertical: 'top',
    marginBottom: spacing.md,
  },
  tip: { marginBottom: spacing.md },
  tipHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  catBadge: { fontSize: 12, fontWeight: '700', color: colors.primary },
  delete: { color: colors.danger, fontSize: 12, fontWeight: '600' },
  tipText: { fontSize: 15, color: colors.text, marginTop: spacing.sm, lineHeight: 21 },
  tipFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  tipAuthor: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  tipDate: { fontSize: 12, color: colors.textMuted },
  empty: { alignItems: 'center', padding: spacing.xxl },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  emptyText: { ...typography.secondary, marginTop: spacing.sm, textAlign: 'center' },
});
