import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../theme';
import { Card, FieldLabel, PrimaryButton } from '../components/ui';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function GuardianScreen({ navigation }) {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.guardian?.name || '');
  const [phone, setPhone] = useState((user?.guardian?.phone || '').replace('+91', ''));
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (phone.replace(/\D/g, '').length < 10) {
      Alert.alert('Error', 'Enter a valid 10-digit phone number');
      return;
    }
    setSaving(true);
    try {
      const res = await api.saveGuardian(name.trim() || 'Guardian', phone.replace(/\D/g, ''));
      await updateUser({ guardian: res.guardian });
      Alert.alert('Saved', 'Your guardian contact is set. The "I reached" button will notify them.');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <Text style={styles.title}>Parent / guardian contact</Text>
        <Text style={styles.subtitle}>
          We notify this person when you tap "I reached safely" at the exam center.
        </Text>

        <Card>
          <FieldLabel>Guardian's name</FieldLabel>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={(t) => setName(t.slice(0, 60))}
            placeholder="e.g. Papa / Mummy / Didi"
            placeholderTextColor={colors.textMuted}
          />
          <FieldLabel>Guardian's mobile number</FieldLabel>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={(t) => setPhone(t.replace(/\D/g, '').slice(0, 10))}
            keyboardType="phone-pad"
            maxLength={10}
            placeholder="98765 43210"
            placeholderTextColor={colors.textMuted}
          />
          <PrimaryButton title="Save contact" onPress={save} loading={saving} />
        </Card>

        <View style={styles.noteRow}>
          <MaterialCommunityIcons name="lock-outline" size={14} color={colors.textMuted} style={styles.noteIcon} />
          <Text style={styles.note}>
            The guardian only receives your arrival alert — they cannot see your chats or profile.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.xl },
  title: { ...typography.title, marginBottom: spacing.sm },
  subtitle: { ...typography.secondary, marginBottom: spacing.xl },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  noteRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: spacing.lg },
  noteIcon: { marginTop: 2 },
  note: { ...typography.muted, flex: 1, lineHeight: 18 },
});
