import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing, shadow, typography } from '../theme';
import { Avatar } from '../components/ui';
import { api } from '../api/client';
import ExamMeta from '../components/ExamMeta';

export default function CreateGroupScreen({ route, navigation }) {
  // Optional: opened from a group chat → adds selected students to that group instead
  const existingGroup = route.params?.group || null;
  const alreadyMemberIds = useMemo(
    () => (existingGroup?.members || []).map((m) => m._id || m),
    [existingGroup]
  );

  const [friends, setFriends] = useState(null);
  const [selected, setSelected] = useState([]);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.getFriends();
        const list = (res.friends || [])
          .map((f) => f.friend)
          .filter((f) => !alreadyMemberIds.includes(f._id));
        setFriends(list);
      } catch (err) {
        Alert.alert('Error', err.message);
        setFriends([]);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const create = async () => {
    if (!name.trim()) {
      Alert.alert('Group name', 'Please enter a group name first.');
      return;
    }
    if (selected.length === 0) {
      Alert.alert('Add students', 'Select at least one student for the group.');
      return;
    }
    setSaving(true);
    try {
      if (existingGroup) {
        await api.addGroupMembers(existingGroup._id, selected);
        navigation.goBack();
      } else {
        const res = await api.createGroup(name.trim(), selected);
        navigation.replace('Chat', { group: res.group, refreshGroups: true });
      }
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const renderFriend = ({ item }) => {
    const picked = selected.includes(item._id);
    return (
      <TouchableOpacity style={styles.row} activeOpacity={0.7} onPress={() => toggle(item._id)}>
        <Avatar name={item.name} color={item.avatarColor} size={48} />
        <View style={{ flex: 1, marginLeft: spacing.md }}>
          <Text style={styles.name} numberOfLines={1}>{item.name || 'Student'}</Text>
          <ExamMeta user={item} style={{ marginTop: 2 }} />
        </View>
        <View style={[styles.checkbox, picked && styles.checkboxOn]}>
          {picked && (
            <MaterialCommunityIcons name="check" size={16} color={colors.white} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.white} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>
            {existingGroup ? 'Add students' : 'New group'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {existingGroup
              ? `Add to ${existingGroup.name}`
              : 'Add students you are connected with'}
          </Text>
        </View>
      </View>

      {!existingGroup && (
        <View style={styles.nameRow}>
          <View style={styles.groupIcon}>
            <MaterialCommunityIcons name="account-group" size={24} color={colors.white} />
          </View>
          <TextInput
            style={styles.nameInput}
            value={name}
            onChangeText={setName}
            placeholder="Group name (e.g. JEE 2026 Center A)"
            placeholderTextColor={colors.textMuted}
            maxLength={50}
          />
        </View>
      )}

      <Text style={styles.sectionLabel}>
        {friends === null ? 'Loading students…' : `Connected students (${friends.length})`}
      </Text>

      {friends === null ? (
        <ActivityIndicator style={{ marginTop: spacing.xxl }} color={colors.primary} />
      ) : (
        <FlatList
          data={friends}
          keyExtractor={(item) => String(item._id)}
          renderItem={renderFriend}
          contentContainerStyle={{ paddingBottom: spacing.xxl }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No one to add</Text>
              <Text style={styles.emptyText}>
                {existingGroup
                  ? 'All your connected students are already in this group.'
                  : 'Connect with students first, then create a group.'}
              </Text>
            </View>
          }
        />
      )}

      {selected.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={create}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <>
              <MaterialCommunityIcons
                name={existingGroup ? 'account-plus' : 'arrow-right'}
                size={22}
                color={colors.white}
              />
              <Text style={styles.fabText}>{selected.length}</Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
    ...shadow,
  },
  backBtn: {
    marginRight: spacing.sm,
    padding: spacing.xs,
    borderRadius: radius.full,
  },
  headerTitle: { color: colors.white, fontWeight: '800', fontSize: 18 },
  headerSubtitle: { color: colors.primaryLight, fontSize: 12, marginTop: 1 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  groupIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  nameInput: { flex: 1, fontSize: 15, color: colors.text, paddingVertical: 4 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  row: {
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
  name: { fontSize: 15, fontWeight: '700', color: colors.text },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.xs,
    ...shadow,
  },
  fabText: { color: colors.white, fontWeight: '800', fontSize: 15 },
  empty: { alignItems: 'center', padding: spacing.xxl, marginTop: spacing.xl },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
  emptyText: { ...typography.secondary, textAlign: 'center', maxWidth: 260 },
});
