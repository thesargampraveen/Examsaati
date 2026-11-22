import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, shadow, spacing, typography } from '../theme';
import { Card, PrimaryButton, SecondaryButton } from '../components/ui';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

const CHECKLIST_ITEMS = [
  { id: 'admitCard', label: 'Admit card' },
  { id: 'aadhar', label: 'Original Aadhar card + xerox' },
  { id: 'photos', label: 'Min. 5 passport size photos' },
  { id: 'waterBottle', label: 'Water bottle' },
];

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [reaching, setReaching] = useState(false);
  const [checkedItems, setCheckedItems] = useState({});
  const [showReadyModal, setShowReadyModal] = useState(false);
  const saveTimer = useRef(null);

  const allChecked = CHECKLIST_ITEMS.every((item) => checkedItems[item.id]);

  // Load the saved checklist from the backend on mount
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await api.getChecklist();
        if (active && res?.items) setCheckedItems(res.items);
      } catch {
        // offline / server down — start unticked
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Optimistic tick + debounced save to the database
  const toggleItem = useCallback((id) => {
    setCheckedItems((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        api.saveChecklist(next).catch(() => {});
      }, 400);
      return next;
    });
  }, []);

  const markReached = useCallback(async () => {
    setReaching(true);
    try {
      const res = await api.reached();
      Alert.alert('You marked "I reached"', res.message);
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
          <Text style={styles.userName}>{user?.name || 'Saathi'}</Text>
        </View>
        <View style={styles.verifiedBadge}>
          <MaterialCommunityIcons
            name={user?.verificationStatus === 'verified' ? 'check-circle-outline' : 'timer-sand'}
            size={14}
            color={colors.white}
          />
          <Text style={styles.verifiedText}>
            {user?.verificationStatus === 'verified' ? ' Verified' : ' Pending'}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
        {/* I reached — the hero action */}
        <View style={styles.reachCard}>
          <Text style={styles.reachTitle}>Reached the exam center?</Text>
          <Text style={styles.reachText}>
            One tap notifies {user?.guardian?.name ? user.guardian.name : 'your guardian'} that you
            arrived safely.
          </Text>
          <PrimaryButton
            title="I reached safely"
            icon="shield-check-outline"
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
                  title="Center guide"
                  icon="book-open-variant"
                  style={{ flex: 1 }}
                  onPress={() => navigation.navigate('CenterGuide')}
                />
                <SecondaryButton
                  title="Students"
                  icon="account-group-outline"
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
        {/* <View style={styles.quickRow}>
          <Card style={styles.quickCard}>
            <MaterialCommunityIcons name="message-text-outline" size={26} color={colors.primary} style={styles.quickIcon} />
            <Text style={styles.quickLabel}>Chats</Text>
          </Card>
        </View> */}

        {/* Exam essentials checklist */}
        <Card style={styles.checklistCard}>
          <View style={styles.tipTitleRow}>
            <MaterialCommunityIcons name="clipboard-check-outline" size={18} color={colors.primaryDark} />
            <Text style={styles.checklistTitle}>  Exam essentials</Text>
          </View>
          <Text style={styles.checklistSub}>Tick off everything before you leave for the center.</Text>

          {CHECKLIST_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.checkRow}
              activeOpacity={0.7}
              onPress={() => toggleItem(item.id)}
            >
              <MaterialCommunityIcons
                name={checkedItems[item.id] ? 'checkbox-marked' : 'checkbox-blank-outline'}
                size={22}
                color={checkedItems[item.id] ? colors.accent : colors.textMuted}
              />
              <Text
                style={[
                  styles.checkLabel,
                  checkedItems[item.id] && styles.checkLabelDone,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}

          {allChecked && (
            <PrimaryButton
              title="Done"
              icon="check-decagram-outline"
              onPress={() => setShowReadyModal(true)}
              style={{ marginTop: spacing.lg }}
            />
          )}
        </Card>

        <Card style={styles.tipCard}>
          <View style={styles.tipTitleRow}>
            <MaterialCommunityIcons name="lightbulb-on-outline" size={16} color={colors.primaryDark} />
            <Text style={styles.tipTitle}> Exam day tip</Text>
          </View>
          <Text style={styles.tipText}>
            Visit your center a day early if you can. Note the entry gate, nearest food spot and
            carry a printed admit card plus a photo ID.
          </Text>
        </Card>
      </ScrollView>

      {/* All-packed popup */}
      <Modal visible={showReadyModal} transparent animationType="fade" onRequestClose={() => setShowReadyModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconWrap}>
              <MaterialCommunityIcons name="check-decagram" size={40} color={colors.white} />
            </View>
            <Text style={styles.modalTitle}>You're ready for the exam!</Text>
            <Text style={styles.modalText}>
              All your essentials are packed. Stay calm, reach on time and give it your best.
            </Text>
            <PrimaryButton
              title="Let's go"
              onPress={() => setShowReadyModal(false)}
              style={{ marginTop: spacing.xl, alignSelf: 'stretch' }}
            />
          </View>
        </View>
      </Modal>
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedText: { color: colors.white, fontSize: 12, fontWeight: '700' },
  body: {
    flex: 1,
    backgroundColor: colors.bg,
    marginTop: -spacing.sm,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  bodyContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
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
  quickIcon: { marginBottom: spacing.xs },
  quickLabel: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  checklistCard: { marginTop: spacing.lg },
  checklistTitle: { fontSize: 15, fontWeight: '800', color: colors.text },
  checklistSub: { ...typography.secondary, marginTop: spacing.xs },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  checkLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.text },
  checkLabelDone: { color: colors.textMuted, textDecorationLine: 'line-through' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  modalCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadow,
  },
  modalIconWrap: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: { fontSize: 19, fontWeight: '800', color: colors.text, textAlign: 'center' },
  modalText: {
    ...typography.secondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  tipTitleRow: { flexDirection: 'row', alignItems: 'center' },
  tipCard: { marginTop: spacing.lg, backgroundColor: colors.primaryLight, borderColor: colors.primaryLight },
  tipTitle: { fontSize: 14, fontWeight: '800', color: colors.primaryDark },
  tipText: { ...typography.secondary, marginTop: spacing.sm },
});
