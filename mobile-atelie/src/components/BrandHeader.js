import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius, typography, shadows } from '../theme/theme';

/**
 * Ornamentos de fundo: círculos translúcidos posicionados fora dos
 * cantos da tela. São puramente decorativos — `pointerEvents="none"`
 * garante que nunca interceptem toques nos campos do formulário.
 */
export function BackdropDecor() {
  return (
    <View style={styles.decorLayer} pointerEvents="none">
      <View style={[styles.circle, styles.circleTop]} />
      <View style={[styles.circle, styles.circleBottom]} />
      <View style={[styles.circle, styles.circleSmall]} />
    </View>
  );
}

/** Filete decorativo com um losango ao centro, separando marca e formulário. */
export function Ornament() {
  return (
    <View style={styles.ornament}>
      <View style={styles.ornamentLine} />
      <View style={styles.ornamentDiamond} />
      <View style={styles.ornamentLine} />
    </View>
  );
}

/**
 * Assinatura visual do app: emblema, nome em Dancing Script (a mesma
 * fonte manuscrita do site) e uma linha de apoio.
 * `compact` reduz a escala para telas internas, como o cadastro.
 */
export function BrandHeader({ tagline, compact = false }) {
  return (
    <View style={[styles.header, compact && styles.headerCompact]}>
      {!compact && (
        <View style={styles.emblem}>
          <View style={styles.emblemInner}>
            <Text style={styles.emblemGlyph}>🧶</Text>
          </View>
        </View>
      )}

      <Text
        style={[styles.brand, compact && styles.brandCompact]}
        // O nome é uma unidade só para o leitor de tela, apesar do
        // visual em duas linhas.
        numberOfLines={2}
        adjustsFontSizeToFit
        accessibilityRole="header">
        Ateliê{'\n'}Nós de Afeto
      </Text>

      {!compact && <Ornament />}

      {!!tagline && <Text style={styles.tagline}>{tagline}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  decorLayer: { ...StyleSheet.absoluteFillObject },
  circle: { position: 'absolute', borderRadius: radius.pill },
  circleTop: {
    width: 260,
    height: 260,
    top: -110,
    right: -90,
    backgroundColor: colors.decorWarm,
  },
  circleBottom: {
    width: 320,
    height: 320,
    bottom: -150,
    left: -120,
    backgroundColor: colors.decorSoft,
  },
  circleSmall: {
    width: 90,
    height: 90,
    top: 140,
    left: -40,
    backgroundColor: colors.decorWarm,
  },

  header: { alignItems: 'center', marginBottom: spacing.lg },
  headerCompact: { marginBottom: spacing.md },

  emblem: {
    width: 84,
    height: 84,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    ...shadows.emblem,
  },
  emblemInner: {
    width: 68,
    height: 68,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emblemGlyph: { fontSize: 30 },

  brand: {
    ...typography.brand,
    color: colors.primary,
    textAlign: 'center',
  },
  brandCompact: { ...typography.brandSmall, color: colors.primary },

  tagline: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    letterSpacing: 0.6,
    marginTop: spacing.xs,
  },

  ornament: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  ornamentLine: {
    width: 44,
    height: 1,
    backgroundColor: colors.primaryLight,
  },
  ornamentDiamond: {
    width: 7,
    height: 7,
    marginHorizontal: spacing.sm,
    backgroundColor: colors.primaryLight,
    transform: [{ rotate: '45deg' }],
  },
});