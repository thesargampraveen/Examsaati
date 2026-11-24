import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, radius, spacing, typography } from '../../theme';
import { Card } from '../ui';
import { getNearbyData } from '../../data/nearbyData';
import { useAuth } from '../../context/AuthContext';

export default function TravelSection({ refreshKey }) {
  const { user } = useAuth();
  void refreshKey;

  const centerName = user?.examCenter?.name || '';
  const data = getNearbyData(centerName);
  const travel = data?.travel || [];

  return (
    <FlatList
      data={travel}
      keyExtractor={(t) => t.type}
      contentContainerStyle={{ padding: spacing.lg }}
      ListHeaderComponent={
        <>
          <Text style={styles.sectionTitle}>Public transport</Text>
          <Text style={styles.sectionSub}>
            How to reach {centerName || 'your exam center'}
          </Text>
        </>
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <MaterialCommunityIcons name="bus-multiple" size={44} color={colors.textMuted} style={styles.emptyIcon} />
          <Text style={styles.emptyTitle}>No travel info yet</Text>
          <Text style={styles.emptyText}>
            Public transport stops for this center haven't been added yet.
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <Card style={styles.card}>
          <View style={styles.row}>
            <View style={styles.iconWrap}>
              <MaterialCommunityIcons name={item.icon} size={24} color={colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.kind}>{item.kind}</Text>
            </View>
            <View style={styles.distanceBadge}>
              <MaterialCommunityIcons name="map-marker-distance" size={13} color={colors.primary} />
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
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontSize: 16, fontWeight: '700', color: colors.text },
  kind: { fontSize: 13, color: colors.textSecondary, marginTop: 1 },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  distanceText: { fontSize: 12, fontWeight: '700', color: colors.primary },
  empty: { alignItems: 'center', padding: spacing.xxl },
  emptyIcon: { marginBottom: spacing.md },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  emptyText: { ...typography.secondary, textAlign: 'center', marginTop: spacing.sm, paddingHorizontal: spacing.lg },
});
