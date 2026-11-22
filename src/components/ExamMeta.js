import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing } from '../theme';
import { formatExamDate } from './CalendarPicker';
import { formatExamTime } from './TimePicker';

/**
 * Compact 📅 exam-date + 🕘 timing line for a user object
 * (expects user.examDate and user.examTime).
 * Pass `light` when rendering on a dark/primary-colored background.
 * Renders nothing if the user has neither value.
 */
export default function ExamMeta({ user, light, style }) {
  if (!user?.examDate && !user?.examTime) return null;
  return (
    <View style={[styles.row, style]}>
      <MaterialCommunityIcons
        name="calendar"
        size={12}
        color={light ? colors.primaryLight : colors.primary}
      />
      <Text style={[styles.text, light && styles.textLight]}>
        {user.examDate ? formatExamDate(new Date(user.examDate)) : 'Date not set'}
      </Text>
      <MaterialCommunityIcons
        name="clock-outline"
        size={12}
        color={light ? colors.primaryLight : colors.primary}
        style={styles.icon}
      />
      <Text style={[styles.text, light && styles.textLight]}>
        {user.examTime ? formatExamTime(user.examTime) : 'Timing not set'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  icon: { marginLeft: spacing.sm },
  text: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 4,
  },
  textLight: { color: colors.primaryLight },
});
