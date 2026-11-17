import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing, typography } from '../theme';
import { PrimaryButton, SecondaryButton, Card, FieldLabel } from '../components/ui';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const { signInWithToken } = useAuth();
  const [step, setStep] = useState('phone'); // phone | otp
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sendOtp = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await api.sendOtp(phone);
      setDevOtp(res.devOtp || '');
      setStep('otp');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await api.verifyOtp(phone, otp);
      // Signing in flips RootNavigator to the ProfileSetup branch automatically for new users
      await signInWithToken(res.token, res.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          <Text style={styles.title}>
            {step === 'phone' ? 'Welcome, saathi 👋' : 'Enter the OTP'}
          </Text>
          <Text style={styles.subtitle}>
            {step === 'phone'
              ? 'Only genuine exam candidates get in. Verify your phone to start.'
              : `We sent a 6-digit code to ${phone}. Valid for 10 minutes.`}
          </Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {step === 'phone' ? (
            <Card>
              <FieldLabel>Mobile number</FieldLabel>
              <View style={styles.phoneRow}>
                <Text style={styles.prefix}>+91</Text>
                <TextInput
                  style={styles.phoneInput}
                  value={phone}
                  onChangeText={(t) => setPhone(t.replace(/\D/g, '').slice(0, 10))}
                  keyboardType="phone-pad"
                  maxLength={10}
                  placeholder="98765 43210"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
              <PrimaryButton title="Send OTP" onPress={sendOtp} loading={loading} disabled={phone.length !== 10} />
            </Card>
          ) : (
            <Card>
              <FieldLabel>6-digit OTP</FieldLabel>
              <TextInput
                style={styles.otpInput}
                value={otp}
                onChangeText={(t) => setOtp(t.replace(/\D/g, '').slice(0, 6))}
                keyboardType="number-pad"
                maxLength={6}
                placeholder="••••••"
                placeholderTextColor={colors.textMuted}
              />
              {devOtp ? (
                <Text style={styles.devOtp}>Dev mode OTP: {devOtp}</Text>
              ) : null}
              <PrimaryButton title="Verify & Continue" onPress={verifyOtp} loading={loading} disabled={otp.length !== 6} />
              <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.md }}>
                <SecondaryButton
                  title="Change number"
                  style={{ flex: 1 }}
                  onPress={() => {
                    setStep('phone');
                    setOtp('');
                    setError('');
                  }}
                />
                <SecondaryButton
                  title="Resend OTP"
                  style={{ flex: 1 }}
                  onPress={sendOtp}
                />
              </View>
            </Card>
          )}

          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, padding: spacing.xl, justifyContent: 'center' },
  title: { ...typography.title, marginBottom: spacing.sm },
  subtitle: { ...typography.secondary, marginBottom: spacing.xl },
  error: { color: colors.danger, fontSize: 13, marginBottom: spacing.md },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
    backgroundColor: colors.bg,
  },
  prefix: { fontSize: 16, fontWeight: '700', color: colors.text, marginRight: spacing.sm },
  phoneInput: { flex: 1, fontSize: 16, color: colors.text, paddingVertical: 14 },
  otpInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.bg,
    fontSize: 24,
    letterSpacing: 12,
    textAlign: 'center',
    color: colors.text,
    paddingVertical: 14,
    marginBottom: spacing.lg,
  },
  devOtp: {
    fontSize: 12,
    color: colors.warning,
    fontWeight: '600',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  back: { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl, fontSize: 14 },
});
