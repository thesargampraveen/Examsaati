import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing, typography } from '../theme';
import { Avatar, Card, SecondaryButton } from '../components/ui';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen({ navigation }) {
  const { user, signOut } = useAuth();
  const [blocked, setBlocked] = useState([]);

  const loadBlocked = useCallback(async () => {
    try {
      const res = await api.getBlocked();
      setBlocked(res.blocked || []);
    } catch {
      setBlocked([]);
    }
  }, []);

  React.useEffect(() => {
    loadBlocked();
  }, [loadBlocked]);

  const unblock = async (u) => {
    try {
      await api.unblock(u._id);
      loadBlocked();
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const confirmSignOut = () => {
    Alert.alert('Sign out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: signOut },
    ]);
  };

  const statusLabel =
    user?.verificationStatus === 'verified'
      ? '✓ Verified candidate'
      : '⏳ Verification pending';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
        <Card style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
          <Avatar name={user?.name} color={user?.avatarColor} size={72} />
          <Text style={styles.name}>{user?.name || 'Student'}</Text>
          <Text style={styles.phone}>{user?.phone}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{statusLabel}</Text>
          </View>
        </Card>

        <Card style={{ marginTop: spacing.lg }}>
          <Text style={styles.sectionTitle}>Exam details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Exam</Text>
            <Text style={styles.detailValue}>{user?.exam || '—'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Center</Text>
            <Text style={[styles.detailValue, { flex: 2, textAlign: 'right' }]}>
              {user?.examCenter?.name || '—'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>City</Text>
            <Text style={styles.detailValue}>{user?.homeCity || '—'}</Text>
          </View>
          <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.detailLabel}>Guardian</Text>
            <Text style={styles.detailValue}>
              {user?.guardian?.name
                ? `${user.guardian.name}${user.guardian.phone ? ` · ${user.guardian.phone}` : ''}`
                : 'Not set'}
            </Text>
          </View>
          <SecondaryButton
            title={user?.guardian?.name ? 'Edit guardian contact' : 'Add guardian contact'}
            onPress={() => navigation.navigate('Guardian')}
          />
        </Card>

        <Card style={{ marginTop: spacing.lg }}>
          <Text style={styles.sectionTitle}>Blocked students ({blocked.length})</Text>
          {blocked.length === 0 ? (
            <Text style={styles.muted}>No one blocked. Keep it that way 🙌</Text>
          ) : (
            blocked.map((u) => (
              <View key={u._id} style={styles.blockedRow}>
                <Text style={styles.blockedName}>{u.name || u.phone}</Text>
                <TouchableOpacity onPress={() => unblock(u)}>
                  <Text style={styles.unblock}>Unblock</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </Card>

        <TouchableOpacity style={styles.signOut} onPress={confirmSignOut}>
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>

        <Text style={styles.about}>
          ExamSaathi · Student-only, verified community.{'\n'}
          Admit-card data is deleted after verification.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  name: { fontSize: 20, fontWeight: '800', color: colors.text, marginTop: spacing.md },
  phone: { ...typography.secondary, marginTop: 2 },
  statusBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.full,
    marginTop: spacing.md,
  },
  statusText: { color: colors.white, fontSize: 12, fontWeight: '700' },
  sectionTitle: { ...typography.h2, marginBottom: spacing.md },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.sm,
  },
  detailLabel: { flex: 1, fontSize: 14, color: colors.textSecondary },
  detailValue: { flex: 2, fontSize: 14, fontWeight: '600', color: colors.text, textAlign: 'right' },
  blockedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  blockedName: { fontSize: 14, color: colors.text },
  unblock: { color: colors.primary, fontSize: 13, fontWeight: '700' },
  muted: { ...typography.muted },
  signOut: {
    marginTop: spacing.xl,
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  signOutText: { color: colors.danger, fontWeight: '700', fontSize: 15 },
  about: { ...typography.muted, textAlign: 'center', marginTop: spacing.md, lineHeight: 18 },
});
