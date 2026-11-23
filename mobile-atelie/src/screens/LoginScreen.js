import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import TextField from '../components/TextField';
import Button from '../components/Button';
import { BrandHeader, BackdropDecor } from '../components/BrandHeader';
import { useAuth } from '../contexts/AuthContext';
import { validateLoginForm } from '../utils/validators';
import { colors, spacing, radius, typography, shadows } from '../theme/theme';

export default function LoginScreen({ navigation }) {
  const { signIn } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // limpa mensagem de erro assim que corrigido
    setErrors(prev => ({ ...prev, [field]: undefined }));
    setApiError('');
  };

  const handleSubmit = async () => {
    const validationErrors = validateLoginForm(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    setApiError('');

    try {
      await signIn(form.email.trim(), form.password);
      // await pro authcontext
    } catch (err) {
      setApiError(err.message || 'Não foi possível entrar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.flex}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <BackdropDecor />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}>
          <BrandHeader tagline="FEITO À MÃO, PONTO A PONTO" />

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Entre na sua conta</Text>

            <TextField
              label="E-mail"
              value={form.email}
              onChangeText={v => updateField('email', v)}
              placeholder="seu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />

            <TextField
              label="Senha"
              value={form.password}
              onChangeText={v => updateField('password', v)}
              placeholder="Sua senha"
              secureTextEntry
              autoCapitalize="none"
              error={errors.password}
            />

            {!!apiError && (
              <View style={styles.apiErrorBox}>
                <Text style={styles.apiError}>{apiError}</Text>
              </View>
            )}

            <Button
              title="Entrar"
              onPress={handleSubmit}
              loading={loading}
              style={styles.submit}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Ainda não tem conta?</Text>
            <TouchableOpacity
              style={styles.linkWrapper}
              onPress={() => navigation.navigate('Register')}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="Criar conta">
              <Text style={styles.link}>Criar conta</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    paddingTop: spacing.xxl,
    // espaço extra pro teclado não cobrir a barra da senha
    paddingBottom: 160,
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  cardTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  submit: { marginTop: spacing.sm },

  apiErrorBox: {
    backgroundColor: 'rgba(192, 57, 43, 0.08)',
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  apiError: {
    ...typography.caption,
    color: colors.danger,
    textAlign: 'center',
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  footerText: { ...typography.body, color: colors.textSecondary },
  linkWrapper: {
    marginLeft: spacing.xs,
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  link: { ...typography.body, color: colors.primary, fontWeight: '700' },
});