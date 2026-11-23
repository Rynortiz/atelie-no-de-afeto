import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import Button from './Button';
import { colors, spacing, typography } from '../theme/theme';

export function LoadingView({ message = 'Carregando...' }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

export function EmptyView({ message = 'Nada por aqui ainda.', action }) {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
      {action}
    </View>
  );
}

export function ErrorView({ message, onRetry }) {
  return (
    <View style={styles.container}>
      <Text style={[styles.message, styles.error]}>{message}</Text>
      {!!onRetry && (
        <Button title="Tentar novamente" onPress={onRetry} variant="secondary" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginVertical: spacing.md,
  },
  error: { color: colors.danger },
});
