import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, radius, spacing } from '../theme';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export function formatExamDate(date) {
  if (!date) return '';
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return `${days[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()].slice(0, 3)} ${date.getFullYear()}`;
}

export default function CalendarPicker({ visible, value, onChange, onClose, title = 'Select exam date' }) {
  const today = startOfToday();
  const initial = value && !isNaN(value) ? value : today;
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

  useEffect(() => {
    if (visible) {
      const base = value && !isNaN(value) ? value : today;
      setViewYear(base.getFullYear());
      setViewMonth(base.getMonth());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const shiftMonth = (delta) => {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setViewMonth(m);
    setViewYear(y);
  };

  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstWeekday; i += 1) cells.push(null);
  for (let d = 1; d <= daysInMonth; d += 1) cells.push(d);

  const isSameDay = (a, b) =>
    a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  const pick = (day) => {
    onChange(new Date(viewYear, viewMonth, day));
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <MaterialCommunityIcons name="calendar-month" size={20} color={colors.primary} />
            <Text style={styles.headerText}>{title}</Text>
          </View>

          <View style={styles.monthRow}>
            <TouchableOpacity onPress={() => shiftMonth(-1)} style={styles.navBtn}>
              <MaterialCommunityIcons name="chevron-left" size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text style={styles.monthLabel}>{MONTHS[viewMonth]} {viewYear}</Text>
            <TouchableOpacity onPress={() => shiftMonth(1)} style={styles.navBtn}>
              <MaterialCommunityIcons name="chevron-right" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.weekRow}>
            {WEEKDAYS.map((w, i) => (
              <Text key={`${w}${i}`} style={styles.weekday}>{w}</Text>
            ))}
          </View>

          <View style={styles.grid}>
            {cells.map((day, i) => {
              if (day === null) return <View key={`blank${i}`} style={styles.dayCell} />;
              const date = new Date(viewYear, viewMonth, day);
              const past = date < today;
              const selected = isSameDay(date, value);
              return (
                <TouchableOpacity
                  key={`d${day}`}
                  style={[styles.dayCell, selected && styles.daySelected]}
                  disabled={past}
                  onPress={() => pick(day)}
                >
                  <Text style={[styles.dayText, past && styles.dayPast, selected && styles.dayTextSelected]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerText: {
    marginLeft: spacing.sm,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  navBtn: { padding: spacing.xs },
  monthLabel: { fontSize: 15, fontWeight: '700', color: colors.text },
  weekRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  weekday: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  dayText: { fontSize: 14, color: colors.text },
  dayPast: { color: colors.textMuted, opacity: 0.4 },
  daySelected: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    width: 36,
    alignSelf: 'center',
    paddingVertical: 6,
  },
  dayTextSelected: { color: colors.white, fontWeight: '700' },
  cancelBtn: {
    alignSelf: 'flex-end',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  cancelText: { color: colors.primary, fontWeight: '700', fontSize: 14 },
});
