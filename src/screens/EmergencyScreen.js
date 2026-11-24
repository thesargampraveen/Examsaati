import React from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing, typography } from '../theme';

// India-wide emergency helplines
const EMERGENCY_NUMBERS = [
  { id: '112', name: 'National Emergency', number: '112', icon: 'shield-alert', color: colors.danger, desc: 'All-in-one emergency (Police · Fire · Medical)' },
  { id: 'police', name: 'Police', number: '100', icon: 'police-badge-outline', color: colors.primary, desc: 'Law & order, safety threats' },
  { id: 'ambulance', name: 'Ambulance', number: '108', icon: 'ambulance', color: colors.accent, desc: 'Medical emergency, free service' },
  { id: 'fire', name: 'Fire Brigade', number: '101', icon: 'fire-extinguisher', color: colors.warning, desc: 'Fire accidents & rescue' },
  { id: 'women', name: 'Women Helpline', number: '1091', icon: 'account-lock-outline', color: '#DB2777', desc: 'Harassment & women safety' },
  { id: 'child', name: 'Child Helpline', number: '1098', icon: 'baby-face-outline', color: '#0EA5E9', desc: 'Children in distress' },
  { id: 'tourist', name: 'Tourist Helpline', number: '1363', icon: 'map-marker-question-outline', color: '#7C3AED', desc: 'Help for out-of-station students' },
  { id: 'gas', name: 'Gas Leak / LPG', number: '1906', icon: 'gas-cylinder', color: '#EA580C', desc: 'LPG leakage & accidents' },
];

export default function EmergencyScreen({ navigation }) {
  const call = (item) => {
    Alert.alert(
      `Call ${item.name}?`,
      `${item.number} · ${item.desc}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call now',
          style: 'destructive',
          onPress: () => Linking.openURL(`tel:${item.number}`).catch(() =>
            Alert.alert('Error', 'Could not open the dialer on this device.'),
          ),
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Emergency Numbers</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
        <View style={styles.banner}>
          <MaterialCommunityIcons name="phone-in-talk" size={22} color={colors.white} />
          <Text style={styles.bannerText}>
            Tap the call icon on any card to dial directly. For life-threatening emergencies, call 112 first.
          </Text>
        </View>

        {EMERGENCY_NUMBERS.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={[styles.iconWrap, { backgroundColor: `${item.color}1A` }]}>
              <MaterialCommunityIcons name={item.icon} size={24} color={item.color} />
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.desc} numberOfLines={1}>{item.desc}</Text>
              <Text style={[styles.number, { color: item.color }]}>{item.number}</Text>
            </View>
            <TouchableOpacity
              style={[styles.callBtn, { backgroundColor: item.color }]}
              onPress={() => call(item)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="phone" size={22} color={colors.white} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: colors.text },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.danger,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  bannerText: { flex: 1, color: colors.white, fontSize: 12, fontWeight: '600', marginLeft: spacing.sm, lineHeight: 16 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1, marginLeft: spacing.md },
  name: { fontSize: 15, fontWeight: '700', color: colors.text },
  desc: { ...typography.muted, marginTop: 2 },
  number: { fontSize: 16, fontWeight: '800', marginTop: 2 },
  callBtn: {
    width: 46,
    height: 46,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
