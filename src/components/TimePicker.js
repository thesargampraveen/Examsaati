import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, radius, spacing } from '../theme';

const FACE_SIZE = 260;
const CENTER = FACE_SIZE / 2;
const RADIUS = 100;

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1); // 1..12
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5); // 0,5,...,55

export function formatExamTime(time) {
  if (!time) return '';
  return `${time.hour}:${String(time.minute).padStart(2, '0')} ${time.period}`;
}

/** Convert a {hour(1-12), minute, period} time to 24h hours value */
export function to24Hour(time) {
  if (!time) return { h: 0, m: 0 };
  let h = time.hour % 12;
  if (time.period === 'PM') h += 12;
  return { h, m: time.minute };
}

const pos = (angleDeg) => {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    left: CENTER + RADIUS * Math.sin(rad) - 22,
    top: CENTER - RADIUS * Math.cos(rad) - 22,
  };
};

export default function TimePicker({ visible, value, onChange, onClose, title = 'Select exam timing' }) {
  const initial = value || { hour: 9, minute: 0, period: 'AM' };
  const [step, setStep] = useState('hour');
  const [hour, setHour] = useState(initial.hour);
  const [minute, setMinute] = useState(initial.minute);
  const [period, setPeriod] = useState(initial.period);

  useEffect(() => {
    if (visible) {
      const v = value || { hour: 9, minute: 0, period: 'AM' };
      setHour(v.hour);
      setMinute(v.minute);
      setPeriod(v.period);
      setStep('hour');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const numbers = step === 'hour' ? HOURS : MINUTES;
  const pickNumber = (n) => {
    if (step === 'hour') {
      setHour(n);
      setStep('minute');
    } else {
      setMinute(n);
    }
  };

  const confirm = () => {
    onChange({ hour, minute, period });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <MaterialCommunityIcons name="clock-outline" size={20} color={colors.primary} />
            <Text style={styles.headerText}>{title}</Text>
          </View>

          <Text style={styles.digital}>
            {hour}:{String(minute).padStart(2, '0')} {period}
          </Text>

          <View style={styles.periodRow}>
            {['AM', 'PM'].map((p) => (
              <TouchableOpacity
                key={p}
                onPress={() => setPeriod(p)}
                style={[styles.periodBtn, period === p && styles.periodActive]}
              >
                <Text style={[styles.periodText, period === p && styles.periodTextActive]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.face, { width: FACE_SIZE, height: FACE_SIZE }]}>
            <View style={styles.faceCenterDot} />
            {numbers.map((n) => {
              const angle = step === 'hour' ? (n % 12) * 30 : n * 6;
              const selected = step === 'hour' ? hour === n : minute === n;
              return (
                <TouchableOpacity
                  key={n}
                  onPress={() => pickNumber(n)}
                  style={[styles.faceNum, pos(angle), selected && styles.faceNumSelected]}
                >
                  <Text style={[styles.faceNumText, selected && styles.faceNumTextSelected]}>
                    {step === 'minute' ? String(n).padStart(2, '0') : n}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.actions}>
            <TouchableOpacity onPress={onClose} style={styles.actionBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={confirm} style={styles.okBtn}>
              <Text style={styles.okText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  sheet: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },
  headerText: {
    marginLeft: spacing.sm,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  digital: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  periodRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  periodBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: spacing.xs,
  },
  periodActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  periodText: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  periodTextActive: { color: colors.white },
  face: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
    borderRadius: radius.full,
    marginBottom: spacing.md,
  },
  faceCenterDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  faceNum: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faceNumSelected: {
    backgroundColor: colors.primary,
  },
  faceNumText: { fontSize: 15, color: colors.text },
  faceNumTextSelected: { color: colors.white, fontWeight: '700' },
  actions: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
  },
  actionBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  cancelText: { color: colors.primary, fontWeight: '700', fontSize: 14 },
  okBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  okText: { color: colors.primary, fontWeight: '700', fontSize: 14 },
});
