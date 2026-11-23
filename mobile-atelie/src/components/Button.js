import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { colors, spacing, radius, typography } from '../theme/theme';

/**
 * Botão padrão do app.
 * Variantes: primary (ação principal), secondary (ação neutra)
 * e danger (ação destrutiva, ex.: excluir).
 */
export default function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
}) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      // Acessibilidade: leitores de tela anunciam o botão corretamente.
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}>
      {loading ? (
        <ActivityIndicator color={colors.textInverse} />
      ) : (
        <Text style={[styles.label, variant === 'secondary' && styles.labelDark]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48, // alvo de toque confortável (usabilidade)
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: colors.primary },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  danger: { backgroundColor: colors.danger },
  disabled: { backgroundColor: colors.disabled },
  label: { ...typography.button, color: colors.textInverse },
  labelDark: { color: colors.textPrimary },
});
