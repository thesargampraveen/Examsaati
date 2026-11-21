import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing, typography } from '../theme';
import { PrimaryButton, Card, FieldLabel } from '../components/ui';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

const PASSWORD_MIN = 6;

export default function LoginScreen({ navigation }) {
  const { signInWithToken } = useAuth();
  const [mode, setMode] = useState('login'); // login | register
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const switchMode = (next) => {
    setMode(next);
    setError('');
    setPassword('');
    setConfirmPassword('');
  };

  const validate = () => {
    if (phone.length !== 10) return 'Enter a valid 10-digit mobile number';
    if (password.length < PASSWORD_MIN) return `Password must be at least ${PASSWORD_MIN} characters`;
    if (mode === 'register') {
      if (!name.trim()) return 'Enter your name';
      if (password !== confirmPassword) return 'Passwords do not match';
    }
    return '';
  };

  const submit = async () => {
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res =
        mode === 'register'
          ? await api.register(name.trim(), phone, password)
          : await api.login(phone, password);
      // Registration lands on ProfileSetup automatically (exam center not set yet)
      await signInWithToken(res.token, res.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isRegister = mode === 'register';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          <View style={styles.titleRow}>
            <MaterialCommunityIcons
              name={isRegister ? 'school-outline' : 'hand-wave-outline'}
              size={22}
              color={colors.primary}
            />
            <Text style={styles.title}>
              {isRegister ? '  Create your account' : '  Welcome back, saathi'}
            </Text>
          </View>
          <Text style={styles.subtitle}>
            {isRegister
              ? 'Register with your number and a password to get started.'
              : 'Log in with your registered number and password.'}
          </Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Card>
            {isRegister ? (
              <>
                <FieldLabel>Full name</FieldLabel>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={(t) => setName(t.slice(0, 60))}
                  placeholder="e.g. Priya Sharma"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="words"
                />
              </>
            ) : null}

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

            <FieldLabel>Password</FieldLabel>
            <View style={styles.passwordRow}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholder={isRegister ? `At least ${PASSWORD_MIN} characters` : 'Your password'}
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
                <Text style={styles.showToggle}>{showPassword ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>

            {isRegister ? (
              <>
                <FieldLabel>Confirm password</FieldLabel>
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                  placeholder="Re-enter password"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                />
              </>
            ) : null}

            <PrimaryButton
              title={isRegister ? 'Register' : 'Log In'}
              onPress={submit}
              loading={loading}
              disabled={
                phone.length !== 10 ||
                password.length < PASSWORD_MIN ||
                (isRegister && (!name.trim() || password !== confirmPassword))
              }
            />
          </Card>

          <TouchableOpacity onPress={() => switchMode(isRegister ? 'login' : 'register')}>
            <Text style={styles.switchText}>
              {isRegister
                ? 'Already have an account? Log in'
                : "New here? Create an account"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backRow} onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={16} color={colors.textMuted} />
            <Text style={styles.back}> Back</Text>
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
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  subtitle: { ...typography.secondary, marginBottom: spacing.xl },
  error: { color: colors.danger, fontSize: 13, marginBottom: spacing.md },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.bg,
    fontSize: 16,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    marginBottom: spacing.lg,
  },
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
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
    backgroundColor: colors.bg,
  },
  passwordInput: { flex: 1, fontSize: 16, color: colors.text, paddingVertical: 14 },
  showToggle: { fontSize: 13, fontWeight: '700', color: colors.primary },
  switchText: {
    color: colors.primary,
    textAlign: 'center',
    marginTop: spacing.xl,
    fontSize: 14,
    fontWeight: '600',
  },
  backRow: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  back: { color: colors.textMuted, fontSize: 14 },
});
