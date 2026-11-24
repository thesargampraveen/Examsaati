import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '../theme';
import TravelSection from '../components/nearby/TravelSection';
import FoodOutletsSection from '../components/nearby/FoodOutletsSection';

const SECTIONS = [
  { key: 'travel', label: 'Travel', icon: 'bag-suitcase-outline' },
  { key: 'food', label: 'Food outlets', icon: 'food-outline' },
];

export default function NearbyScreen() {
  const [section, setSection] = useState('travel');
  const [refreshKey, setRefreshKey] = useState(0);

  const switchSection = (key) => {
    setSection(key);
    setRefreshKey((k) => k + 1); // reload data when switching
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nearby</Text>
        <Text style={styles.headerSub}>Around your exam center</Text>
        <View style={styles.segmented}>
          {SECTIONS.map((s) => {
            const active = section === s.key;
            return (
              <TouchableOpacity
                key={s.key}
                onPress={() => switchSection(s.key)}
                style={[styles.segment, active && styles.segmentActive]}
              >
                <MaterialCommunityIcons
                  name={s.icon}
                  size={15}
                  color={active ? colors.primary : colors.primaryLight}
                  style={styles.segmentIcon}
                />
                <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                  {s.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {section === 'travel' ? (
        <TravelSection refreshKey={refreshKey} />
      ) : (
        <FoodOutletsSection refreshKey={refreshKey} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { backgroundColor: colors.primary, padding: spacing.xl, paddingBottom: spacing.lg },
  headerTitle: { fontSize: 22, fontWeight: '800', color: colors.white },
  headerSub: { fontSize: 13, color: colors.primaryLight, marginTop: 2, marginBottom: spacing.md },
  segmented: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.full,
    padding: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: radius.full,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  segmentActive: { backgroundColor: colors.white },
  segmentIcon: { marginRight: 5 },
  segmentText: { color: colors.primaryLight, fontSize: 13, fontWeight: '700' },
  segmentTextActive: { color: colors.primary },
});
