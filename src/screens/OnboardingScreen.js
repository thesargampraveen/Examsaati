import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, shadow, spacing, typography } from '../theme';
import { PrimaryButton, Card } from '../components/ui';

const POINTS = [
  {
    icon: '🎓',
    title: 'Verified students only',
    text: 'Phone-verified accounts + admit-card check keeps fake agents and spam out.',
  },
  {
    icon: '🤝',
    title: 'Same-center friends',
    text: 'Connect with students appearing at your exact exam center.',
  },
  {
    icon: '🧳',
    title: 'Travel & stay partners',
    text: 'Find students from your city, with gender-safe filters.',
  },
  {
    icon: '🛡️',
    title: '"I reached" button',
    text: 'One tap tells your parents you arrived safely.',
  },
];

export default function OnboardingScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>ES</Text>
          </View>
          <Text style={styles.title}>ExamSaathi</Text>
          <Text style={styles.subtitle}>
            Verified students. Same exam center. Zero spam.
          </Text>
        </View>

        {POINTS.map((p) => (
          <Card key={p.title} style={styles.point}>
            <Text style={styles.pointIcon}>{p.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.pointTitle}>{p.title}</Text>
              <Text style={styles.pointText}>{p.text}</Text>
            </View>
          </Card>
        ))}

        <PrimaryButton
          title="Get Started"
          onPress={() => navigation.navigate('Login')}
          style={{ marginTop: spacing.xl }}
        />
        <Text style={styles.footer}>
          Free for students, always. Made for JEE, NEET, UPSC, SSC, GATE, Railway & more.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.xl, paddingBottom: spacing.xxl },
  hero: { alignItems: 'center', marginVertical: spacing.xxl },
  logo: {
    width: 84,
    height: 84,
    borderRadius: radius.xl,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    ...shadow,
  },
  logoText: { color: colors.white, fontSize: 32, fontWeight: '800' },
  title: { ...typography.title, fontSize: 30 },
  subtitle: { ...typography.secondary, marginTop: spacing.sm, textAlign: 'center' },
  point: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  pointIcon: { fontSize: 28 },
  pointTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  pointText: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  footer: {
    ...typography.muted,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
