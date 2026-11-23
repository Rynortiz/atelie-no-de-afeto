import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import TextField from '../components/TextField';
import Button from '../components/Button';
import { BrandHeader, BackdropDecor } from '../components/BrandHeader';
import { useAuth } from '../contexts/AuthContext';
import { validateRegisterForm } from '../utils/validators';
import { formatCpf, formatPhone } from '../utils/formatters';
import { colors, spacing, radius, typography, shadows } from '../theme/theme';

const INITIAL_FORM = {
  name: '',
  email: '',
  cpf: '',
  phone: '',
  password: '',
  confirmPassword: '',
};

export default function RegisterScreen({ navigation }) {
  const { signUp } = useAuth();

  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // limpa mensagem de erro assim que corrigida 
    setErrors(prev => ({ ...prev, [field]: undefined }));
    setApiError('');
  };

  const handleSubmit = async () => {
    const validationErrors = validateRegisterForm(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    setApiError('');

    try {
      await signUp(form);
    } catch (err) {
      // mensagem de erro tratada de CPF ou email inválidos
      setApiError(err.message || 'Não foi possível criar a conta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.flex}>
      <BackdropDecor />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}>
          <BrandHeader compact tagline="LEVA MENOS DE UM MINUTO" />

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Criar conta</Text>

            <TextField
              label="Nome completo"
              value={form.name}
              onChangeText={v => updateField('name', v)}
              placeholder="Como podemos te chamar"
              autoCapitalize="words"
              error={errors.name}
            />

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
              label="CPF"
              value={form.cpf}
              onChangeText={v => updateField('cpf', formatCpf(v))}
              placeholder="000.000.000-00"
              keyboardType="number-pad"
              maxLength={14}
              error={errors.cpf}
            />

            <TextField
              label="Telefone (opcional)"
              value={form.phone}
              onChangeText={v => updateField('phone', formatPhone(v))}
              placeholder="(00) 00000-0000"
              keyboardType="phone-pad"
              maxLength={15}
              error={errors.phone}
            />

            <TextField
              label="Senha"
              value={form.password}
              onChangeText={v => updateField('password', v)}
              placeholder="Crie uma senha"
              secureTextEntry
              autoCapitalize="none"
              error={errors.password}
            />

            <TextField
              label="Confirmar senha"
              value={form.confirmPassword}
              onChangeText={v => updateField('confirmPassword', v)}
              placeholder="Repita a senha"
              secureTextEntry
              autoCapitalize="none"
              error={errors.confirmPassword}
            />

            {!!apiError && (
              <View style={styles.apiErrorBox}>
                <Text style={styles.apiError}>{apiError}</Text>
              </View>
            )}

            <Button
              title="Cadastrar"
              onPress={handleSubmit}
              loading={loading}
              style={styles.submit}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Já tem conta?</Text>
            <TouchableOpacity
              style={styles.linkWrapper}
              onPress={() => navigation.goBack()}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="Entrar">
              <Text style={styles.link}>Entrar</Text>
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
    paddingTop: 70,
    // espaço extra embaixo pro teclado não cobrir nada
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