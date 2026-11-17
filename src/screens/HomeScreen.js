import React, { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, shadow, spacing, typography } from '../theme';
import { Card, PrimaryButton, SecondaryButton } from '../components/ui';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [reaching, setReaching] = useState(false);

  const markReached = useCallback(async () => {
    setReaching(true);
    try {
      const res = await api.reached();
      Alert.alert('✅ You marked "I reached"', res.message);
    } catch (err) {
      if (err.data?.needsGuardian) {
        Alert.alert(
          'Add a guardian first',
          'Choose a parent or trusted contact to be notified when you reach the center.',
          [
            { text: 'Add now', onPress: () => navigation.navigate('Guardian') },
            { text: 'Later', style: 'cancel' },
          ]
        );
      } else {
        Alert.alert('Error', err.message);
      }
    } finally {
      setReaching(false);
    }
  }, [navigation]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{greeting()},</Text>
          <Text style={styles.userName}>{user?.name || 'Saathi'} 👋</Text>
        </View>
        <View style={styles.verifiedBadge}>
          <Text style={styles.verifiedText}>
            {user?.verificationStatus === 'verified' ? '✓ Verified' : '⏳ Pending'}
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        {/* I reached — the hero action */}
        <View style={styles.reachCard}>
          <Text style={styles.reachTitle}>Reached the exam center?</Text>
          <Text style={styles.reachText}>
            One tap notifies {user?.guardian?.name ? user.guardian.name : 'your guardian'} that you
            arrived safely.
          </Text>
          <PrimaryButton
            title="🛡️  I reached safely"
            onPress={markReached}
            loading={reaching}
            style={{ backgroundColor: colors.accent, marginTop: spacing.lg }}
          />
        </View>

        {/* Center card */}
        <Card style={styles.centerCard}>
          <Text style={styles.sectionTitle}>Your exam center</Text>
          {user?.examCenter ? (
            <>
              <Text style={styles.centerName}>{user.examCenter.name}</Text>
              <Text style={styles.centerMeta}>
                {user.examCenter.city}
                {user.examDate ? ` · ${new Date(user.examDate).toDateString()}` : ''}
              </Text>
              <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg }}>
                <SecondaryButton
                  title="📖 Center guide"
                  style={{ flex: 1 }}
                  onPress={() => navigation.navigate('CenterGuide')}
                />
                <SecondaryButton
                  title="👥 Students"
                  style={{ flex: 1 }}
                  onPress={() => navigation.navigate('Students')}
                />
              </View>
            </>
          ) : (
            <Text style={styles.centerMeta}>
              No center selected yet. Complete your profile to match with students.
            </Text>
          )}
        </Card>

        {/* Quick actions */}
        <View style={styles.quickRow}>
          <Card style={[styles.quickCard]}>
            <Text style={styles.quickIcon}>🧳</Text>
            <Text style={styles.quickLabel}>Travel partners</Text>
          </Card>
          <Card style={styles.quickCard}>
            <Text style={styles.quickIcon}>🏨</Text>
            <Text style={styles.quickLabel}>Stay sharing</Text>
          </Card>
          <Card style={styles.quickCard}>
            <Text style={styles.quickIcon}>💬</Text>
            <Text style={styles.quickLabel}>Chats</Text>
          </Card>
        </View>

        <Card style={styles.tipCard}>
          <Text style={styles.tipTitle}>💡 Exam day tip</Text>
          <Text style={styles.tipText}>
            Visit your center a day early if you can. Note the entry gate, nearest food spot and
            carry a printed admit card plus a photo ID.
          </Text>
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primary },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    paddingTop: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: { fontSize: 14, color: colors.primaryLight },
  userName: { fontSize: 22, fontWeight: '800', color: colors.white, marginTop: 2 },
  verifiedBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  verifiedText: { color: colors.white, fontSize: 12, fontWeight: '700' },
  body: {
    flex: 1,
    backgroundColor: colors.bg,
    marginTop: -spacing.sm,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
  },
  reachCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginTop: spacing.md,
    ...shadow,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reachTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  reachText: { ...typography.secondary, marginTop: spacing.sm },
  centerCard: { marginTop: spacing.lg },
  sectionTitle: { ...typography.h2, marginBottom: spacing.sm },
  centerName: { fontSize: 16, fontWeight: '700', color: colors.text },
  centerMeta: { ...typography.secondary, marginTop: 2 },
  quickRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  quickCard: { flex: 1, alignItems: 'center', paddingVertical: spacing.lg },
  quickIcon: { fontSize: 26, marginBottom: spacing.xs },
  quickLabel: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  tipCard: { marginTop: spacing.lg, backgroundColor: colors.primaryLight, borderColor: colors.primaryLight },
  tipTitle: { fontSize: 14, fontWeight: '800', color: colors.primaryDark },
  tipText: { ...typography.secondary, marginTop: spacing.sm },
});
