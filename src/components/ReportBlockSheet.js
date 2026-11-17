import React, { useState } from 'react';
import { Alert, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { PrimaryButton, SecondaryButton } from './ui';
import { api } from '../api/client';

const REASONS = [
  { key: 'spam', label: 'Spam' },
  { key: 'fake_agent', label: 'Fake agent' },
  { key: 'harassment', label: 'Harassment' },
  { key: 'coaching_ad', label: 'Coaching ad' },
  { key: 'other', label: 'Other' },
];

export default function ReportBlockSheet({ visible, onClose, targetUser, onDone }) {
  const [reason, setReason] = useState('spam');
  const [details, setDetails] = useState('');
  const [busy, setBusy] = useState(false);

  const report = async () => {
    if (!targetUser) return;
    setBusy(true);
    try {
      await api.report(targetUser._id, reason, details);
      await api.block(targetUser._id);
      Alert.alert('Thank you', 'Report submitted. The user is blocked for you.');
      setDetails('');
      onDone?.();
      onClose();
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setBusy(false);
    }
  };

  const justBlock = async () => {
    if (!targetUser) return;
    setBusy(true);
    try {
      await api.block(targetUser._id);
      Alert.alert('Blocked', 'This student can no longer contact you.');
      onDone?.();
      onClose();
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setBusy(false);
    }
  };

  if (!targetUser) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Report or block</Text>
          <Text style={styles.subtitle}>{targetUser.name || 'This student'}</Text>

          <Text style={styles.label}>Reason</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {REASONS.map((r) => (
              <TouchableOpacity
                key={r.key}
                onPress={() => setReason(r.key)}
                style={[styles.reasonChip, reason === r.key && styles.reasonChipActive]}
              >
                <Text style={[styles.reasonText, reason === r.key && styles.reasonTextActive]}>
                  {r.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.details}
            value={details}
            onChangeText={setDetails}
            placeholder="Any details? (optional)"
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={1000}
          />

          <PrimaryButton title="Report & Block" onPress={report} loading={busy} />
          <SecondaryButton title="Just block" onPress={justBlock} style={{ marginTop: spacing.md }} />
          <TouchableOpacity onPress={onClose} style={{ marginTop: spacing.lg }}>
            <Text style={styles.cancel}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
  },
  title: { fontSize: 20, fontWeight: '800', color: colors.text },
  subtitle: { ...typographyCopy(), marginBottom: spacing.lg },
  label: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: spacing.sm },
  reasonChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  reasonChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  reasonText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  reasonTextActive: { color: colors.white },
  details: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.bg,
    padding: spacing.md,
    minHeight: 70,
    fontSize: 14,
    color: colors.text,
    marginVertical: spacing.lg,
    textAlignVertical: 'top',
  },
  cancel: { color: colors.textMuted, textAlign: 'center', fontSize: 14 },
});

function typographyCopy() {
  return { fontSize: 13, color: colors.textSecondary, marginTop: 2 };
}
