import React from 'react';
import { Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, radius, typography } from '../theme/theme';

/** Valor sentinela para "sem filtro" — distingue de uma categoria real. */
export const ALL_CATEGORIES = '__all__';

/**
 * Barra horizontal de categorias.
 * Rola na horizontal em vez de quebrar em várias linhas, para não
 * roubar altura da vitrine quando houver muitas categorias.
 */
export default function CategoryFilter({ categories, selected, onSelect }) {
  const options = [
    { id: ALL_CATEGORIES, name: 'Todas' },
    ...categories,
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      // Sem isto o ScrollView ocupa a altura livre da tela e estica
      // os chips junto com ele.
      style={styles.scroll}
      contentContainerStyle={styles.container}>
      {options.map(option => {
        const active = String(option.id) === String(selected);

        return (
          <TouchableOpacity
            key={String(option.id)}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => onSelect(String(option.id))}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={`Filtrar por ${option.name}`}>
            <Text style={[styles.text, active && styles.textActive]}>
              {option.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 0, flexShrink: 0 },
  container: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    alignItems: 'center',
  },
  chip: {
    // Altura fixa, não mínima: o chip não deve acompanhar o pai.
    height: 38,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  text: { ...typography.caption, color: colors.textPrimary },
  textActive: { color: colors.textInverse, fontWeight: '600' },
});