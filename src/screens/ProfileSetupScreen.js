import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, EXAMS, radius, spacing, typography } from '../theme';
import { PrimaryButton, SecondaryButton, Card, FieldLabel, Chip, Avatar } from '../components/ui';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

const GENDERS = [
  { key: 'female', label: 'Female' },
  { key: 'male', label: 'Male' },
  { key: 'other', label: 'Other' },
];

export default function ProfileSetupScreen() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [gender, setGender] = useState(user?.gender || '');
  const [homeCity, setHomeCity] = useState(user?.homeCity || '');
  const [exam, setExam] = useState(user?.exam || '');
  const [rollNumber, setRollNumber] = useState('');
  const [centerQuery, setCenterQuery] = useState('');
  const [centers, setCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [addingCenter, setAddingCenter] = useState(false);
  const debounce = useRef(null);

  useEffect(() => {
    if (centerQuery.trim().length < 2 || selectedCenter) {
      setCenters([]);
      return;
    }
    clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await api.searchCenters(centerQuery);
        setCenters(res.centers || []);
      } catch {
        setCenters([]);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(debounce.current);
  }, [centerQuery, selectedCenter]);

  const save = async () => {
    setError('');
    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!gender) {
      setError('Please select your gender (tap one of Female / Male / Other)');
      return;
    }
    if (!exam) {
      setError('Please select your exam (tap one of JEE Main, NEET, UPSC…)');
      return;
    }
    if (!selectedCenter) {
      setError(
        'Please TAP your exam center in the list below — typing alone does not select it'
      );
      return;
    }
    setSaving(true);
    try {
      const res = await api.completeProfile({
        name,
        gender,
        homeCity,
        exam,
        examCenterId: selectedCenter._id,
        rollNumber: rollNumber.trim() || undefined,
      });
      await updateUser(res.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const addMissingCenter = async () => {
    const cName = centerQuery.trim();
    if (cName.length < 3) {
      setError('Type the full center name first, then tap "Add it"');
      return;
    }
    const cCity = homeCity.trim();
    if (!cCity) {
      setError('Enter your city above first — the center is created there');
      return;
    }
    setAddingCenter(true);
    setError('');
    try {
      const res = await api.addCenter(cName, cCity);
      setSelectedCenter(res.center);
      setCenters([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setAddingCenter(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Set up your profile</Text>
          <Text style={styles.subtitle}>
            This helps us match you with verified students at your exam center.
          </Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Card style={{ marginBottom: spacing.md }}>
            <FieldLabel>Full name</FieldLabel>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={(t) => setName(t.slice(0, 60))}
              placeholder="e.g. Priya Sharma"
              placeholderTextColor={colors.textMuted}
            />

            <FieldLabel>Gender</FieldLabel>
            <View style={{ flexDirection: 'row', marginBottom: spacing.md }}>
              {GENDERS.map((g) => (
                <Chip
                  key={g.key}
                  label={g.label}
                  active={gender === g.key}
                  onPress={() => setGender(g.key)}
                  style={{ marginRight: spacing.sm }}
                />
              ))}
            </View>

            <FieldLabel>Your city (home)</FieldLabel>
            <TextInput
              style={styles.input}
              value={homeCity}
              onChangeText={(t) => setHomeCity(t.slice(0, 40))}
              placeholder="e.g. Muzaffarpur"
              placeholderTextColor={colors.textMuted}
            />
          </Card>

          <Card style={{ marginBottom: spacing.md }}>
            <FieldLabel>Which exam?</FieldLabel>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {EXAMS.map((e) => (
                <Chip key={e} label={e} active={exam === e} onPress={() => setExam(e)} />
              ))}
            </View>
          </Card>

          <Card style={{ marginBottom: spacing.md }}>
            <FieldLabel>Exam center (as on admit card)</FieldLabel>
            {selectedCenter ? (
              <View style={styles.selectedCenter}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.centerName}>{selectedCenter.name}</Text>
                  <Text style={styles.centerMeta}>
                    {selectedCenter.city}
                    {selectedCenter.code ? ` · Code ${selectedCenter.code}` : ''}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedCenter(null)}>
                  <Text style={styles.changeText}>Change</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <TextInput
                  style={styles.input}
                  value={centerQuery}
                  onChangeText={setCenterQuery}
                  placeholder="Search center name, city or code…"
                  placeholderTextColor={colors.textMuted}
                />
                {searching ? (
                  <ActivityIndicator style={{ marginVertical: spacing.md }} color={colors.primary} />
                ) : null}
                <FlatList
                  data={centers}
                  keyboardShouldPersistTaps="handled"
                  keyExtractor={(item) => item._id}
                  nestedScrollEnabled
                  style={{ maxHeight: 220 }}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.centerRow}
                      onPress={() => {
                        setSelectedCenter(item);
                        setCenters([]);
                      }}
                    >
                      <Text style={styles.centerName}>{item.name}</Text>
                      <Text style={styles.centerMeta}>
                        {item.city}
                        {item.code ? ` · Code ${item.code}` : ''}
                      </Text>
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={
                    centerQuery.trim().length >= 2 && !searching ? (
                      <View>
                        <Text style={styles.emptyText}>
                          No centers found for "{centerQuery.trim()}"
                        </Text>
                        <SecondaryButton
                          title={`Add "${centerQuery.trim()}" as my center`}
                          icon="plus"
                          onPress={addMissingCenter}
                          loading={addingCenter}
                        />
                      </View>
                    ) : (
                      <Text style={styles.hint}>Search and TAP a result to select it</Text>
                    )
                  }
                />
              </>
            )}
          </Card>

          <Card style={{ marginBottom: spacing.xl }}>
            <FieldLabel>Admit card roll number (for verification)</FieldLabel>
            <TextInput
              style={styles.input}
              value={rollNumber}
              onChangeText={(t) => setRollNumber(t.slice(0, 40))}
              placeholder="e.g. 25JEE1048291"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="characters"
            />
            <Text style={styles.hint}>
              Stored only to verify you and match your center. Deleted once verification is done.
            </Text>
          </Card>

          <PrimaryButton title="Start connecting" onPress={save} loading={saving} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.xl, paddingBottom: spacing.xxl },
  title: { ...typography.title, marginBottom: spacing.sm },
  subtitle: { ...typography.secondary, marginBottom: spacing.xl },
  error: { color: colors.danger, fontSize: 13, marginBottom: spacing.md },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
    marginBottom: spacing.md,
  },
  selectedCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  centerRow: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  centerName: { fontSize: 15, fontWeight: '700', color: colors.text },
  centerMeta: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  changeText: { color: colors.primary, fontWeight: '700', fontSize: 14 },
  hint: { ...typography.muted, marginTop: spacing.sm },
  emptyText: { ...typography.muted, paddingVertical: spacing.md },
});
