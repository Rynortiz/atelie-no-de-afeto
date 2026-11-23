import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { colors, spacing, radius, typography } from '../theme/theme';

export default function TextField({
  label,
  value,
  onChangeText,
  error,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  multiline = false,
  editable = true,
  maxLength,
  prefix,
}) {
  const [revealed, setRevealed] = useState(false);

  const isPassword = secureTextEntry;
  const hideText = isPassword && !revealed;

  return (
    <View style={styles.container}>
      {!!label && <Text style={styles.label}>{label}</Text>}

      <View style={styles.inputWrapper}>
        {!!prefix && (
          <Text style={styles.prefix} pointerEvents="none">
            {prefix}
          </Text>
        )}

        <TextInput
          style={[
            styles.input,
            multiline && styles.multiline,
            isPassword && styles.inputWithAction,
            !!prefix && styles.inputWithPrefix,
            !!error && styles.inputError,
            !editable && styles.inputDisabled,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          secureTextEntry={hideText}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          editable={editable}
          maxLength={maxLength}
          accessibilityLabel={label}
        />

        {isPassword && (
          <TouchableOpacity
            style={styles.action}
            onPress={() => setRevealed(prev => !prev)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel={revealed ? 'Ocultar senha' : 'Mostrar senha'}>
            <Text style={styles.actionGlyph}>{revealed ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        )}
      </View>

      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  inputWrapper: { justifyContent: 'center' },
  input: {
    minHeight: 48,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    ...typography.body,
    color: colors.textPrimary,
  },
  inputWithAction: { paddingRight: 52 },
  inputWithPrefix: { paddingLeft: 44 },
  prefix: {
    position: 'absolute',
    left: spacing.md,
    zIndex: 1,
    ...typography.body,
    color: colors.textSecondary,
  },
  multiline: { minHeight: 96, textAlignVertical: 'top', paddingTop: spacing.sm },
  inputError: { borderColor: colors.danger },
  inputDisabled: { backgroundColor: colors.background },

  action: {
    position: 'absolute',
    right: spacing.sm,
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionGlyph: { fontSize: 18 },

  error: {
    ...typography.caption,
    color: colors.danger,
    marginTop: spacing.xs,
  },
});