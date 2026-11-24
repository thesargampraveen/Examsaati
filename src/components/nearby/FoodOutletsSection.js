import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, radius, spacing, typography } from '../../theme';
import { Card } from '../ui';
import { getNearbyData } from '../../data/nearbyData';
import { useAuth } from '../../context/AuthContext';

export default function FoodOutletsSection({ refreshKey }) {
  const { user } = useAuth();
  void refreshKey;

  const centerName = user?.examCenter?.name || '';
  const data = getNearbyData(centerName);
  const outlets = data?.food || [];

  return (
    <FlatList
      data={outlets}
      keyExtractor={(o) => o.name}
      contentContainerStyle={{ padding: spacing.lg }}
      ListHeaderComponent={
        <>
          <Text style={styles.sectionTitle}>Food outlets near your center</Text>
          <Text style={styles.sectionSub}>Quick bites and meals close to {centerName || 'your exam center'}</Text>
        </>
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <MaterialCommunityIcons name="food-outline" size={44} color={colors.textMuted} style={styles.emptyIcon} />
          <Text style={styles.emptyTitle}>No food spots yet</Text>
          <Text style={styles.emptyText}>
            Food outlets for this center haven't been added yet.
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <Card style={styles.card}>
          <View style={styles.row}>
            <View style={styles.iconWrap}>
              <MaterialCommunityIcons name={item.icon} size={22} color={colors.accent} />
            </View>
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Text style={styles.name}>{item.name}</Text>
            </View>
            <View style={styles.distanceBadge}>
              <MaterialCommunityIcons name="map-marker-distance" size={13} color={colors.accent} />
              <Text style={styles.distanceText}> {item.distance}</Text>
            </View>
          </View>
        </Card>
      )}
    />
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  sectionSub: { ...typography.secondary, marginTop: 2, marginBottom: spacing.md },
  card: { marginBottom: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontSize: 16, fontWeight: '700', color: colors.text },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  distanceText: { fontSize: 12, fontWeight: '700', color: colors.accent },
  empty: { alignItems: 'center', padding: spacing.xxl },
  emptyIcon: { marginBottom: spacing.md },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  emptyText: { ...typography.secondary, textAlign: 'center', marginTop: spacing.sm, paddingHorizontal: spacing.lg },
});
