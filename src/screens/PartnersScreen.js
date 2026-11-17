import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing, typography } from '../theme';
import { Avatar, Card } from '../components/ui';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import ReportBlockSheet from '../components/ReportBlockSheet';

const TABS = [
  { key: 'travel', label: '🧳 Travel partners' },
  { key: 'stay', label: '🏨 Stay sharing' },
];

const GENDER_FILTERS = [
  { key: '', label: 'All' },
  { key: 'same', label: 'Same gender only' },
];

export default function PartnersScreen() {
  const { user } = useAuth();
  const [tab, setTab] = useState('travel');
  const [sameGenderOnly, setSameGenderOnly] = useState(true);
  const [partners, setPartners] = useState(null);
  const [sentTo, setSentTo] = useState({});
  const [reportTarget, setReportTarget] = useState(null);

  const load = useCallback(async () => {
    setPartners(null);
    try {
      let res;
      if (tab === 'travel') {
        const genderParam =
          sameGenderOnly && user?.gender ? user.gender : '';
        res = await api.getTravelPartners(user?.homeCity, genderParam);
      } else {
        res = await api.getStayPartners(
          sameGenderOnly && user?.gender ? user.gender : ''
        );
      }
      setPartners(res.partners || []);
    } catch {
      setPartners([]);
    }
  }, [tab, sameGenderOnly, user]);

  useEffect(() => {
    load();
  }, [load]);

  const connect = async (p) => {
    try {
      await api.connect(p._id);
      setSentTo((prev) => ({ ...prev, [p._id]: true }));
    } catch (err) {
      if (err.message.toLowerCase().includes('already')) {
        setSentTo((prev) => ({ ...prev, [p._id]: true }));
      } else {
        Alert.alert('Error', err.message);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Travel & stay</Text>
        <View style={styles.tabs}>
          {TABS.map((t) => (
            <TouchableOpacity
              key={t.key}
              onPress={() => setTab(t.key)}
              style={[styles.tab, tab === t.key && styles.tabActive]}
            >
              <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ flexDirection: 'row', marginTop: spacing.md }}>
          {GENDER_FILTERS.map((g) => (
            <TouchableOpacity
              key={g.key}
              onPress={() => setSameGenderOnly(g.key === 'same')}
              style={[
                styles.filterChip,
                (g.key === 'same') === sameGenderOnly && styles.filterChipActive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  (g.key === 'same') === sameGenderOnly && styles.filterTextActive,
                ]}
              >
                🛡️ {g.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {partners === null ? (
        <ActivityIndicator style={{ marginTop: spacing.xxl }} color={colors.primary} />
      ) : partners.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>{tab === 'travel' ? '🧳' : '🏨'}</Text>
          <Text style={styles.emptyTitle}>No matches yet</Text>
          <Text style={styles.emptyText}>
            {tab === 'travel'
              ? user?.homeCity
                ? `No verified students from ${user.homeCity} yet. Check back soon.`
                : 'Add your home city in profile setup to find students travelling from your city.'
              : 'No verified students looking to share accommodation at your center yet.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={partners}
          keyExtractor={(p) => p._id}
          contentContainerStyle={{ padding: spacing.lg }}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <View style={styles.row}>
                <Avatar name={item.name} color={item.avatarColor} />
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Text style={styles.name}>{item.name || 'Student'}</Text>
                  <Text style={styles.meta}>
                    {item.exam || ''}
                    {item.homeCity ? ` · from ${item.homeCity}` : ''}
                  </Text>
                  {item.examCenter?.name ? (
                    <Text style={styles.meta}>
                      → {item.examCenter.name}, {item.examCenter.city}
                    </Text>
                  ) : null}
                </View>
                <TouchableOpacity onPress={() => setReportTarget(item)}>
                  <Text style={styles.reportLink}>Report</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={[styles.connectBtn, sentTo[item._id] && styles.connectBtnDone]}
                onPress={() => !sentTo[item._id] && connect(item)}
              >
                <Text style={[styles.connectText, sentTo[item._id] && styles.connectTextDone]}>
                  {sentTo[item._id] ? 'Request sent ✓' : 'Connect'}
                </Text>
              </TouchableOpacity>
            </Card>
          )}
        />
      )}

      <ReportBlockSheet
        visible={!!reportTarget}
        targetUser={reportTarget}
        onClose={() => setReportTarget(null)}
        onDone={load}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { backgroundColor: colors.primary, padding: spacing.xl, paddingBottom: spacing.lg },
  headerTitle: { fontSize: 22, fontWeight: '800', color: colors.white, marginBottom: spacing.md },
  tabs: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: radius.full, padding: 4 },
  tab: { flex: 1, paddingVertical: 8, borderRadius: radius.full, alignItems: 'center' },
  tabActive: { backgroundColor: colors.white },
  tabText: { color: colors.primaryLight, fontSize: 13, fontWeight: '700' },
  tabTextActive: { color: colors.primary },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginRight: spacing.sm,
  },
  filterChipActive: { backgroundColor: colors.white },
  filterText: { fontSize: 12, fontWeight: '600', color: colors.primaryLight },
  filterTextActive: { color: colors.primary },
  card: { marginBottom: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center' },
  name: { fontSize: 16, fontWeight: '700', color: colors.text },
  meta: { fontSize: 13, color: colors.textSecondary, marginTop: 1 },
  reportLink: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  connectBtn: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 10,
    alignItems: 'center',
  },
  connectBtnDone: { backgroundColor: colors.primaryLight },
  connectText: { color: colors.white, fontWeight: '700', fontSize: 14 },
  connectTextDone: { color: colors.primary },
  empty: { alignItems: 'center', padding: spacing.xxl, marginTop: spacing.xxl },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  emptyText: { ...typography.secondary, textAlign: 'center', marginTop: spacing.sm, paddingHorizontal: spacing.xl },
});
