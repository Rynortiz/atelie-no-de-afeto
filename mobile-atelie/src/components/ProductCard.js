import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, radius, typography, shadows } from '../theme/theme';
import { formatCurrency } from '../utils/formatters';
import { resolveImageUrl } from '../utils/imageUrl';

function ProductImage({ uri, style, label }) {
  const [failed, setFailed] = useState(false);

  if (!uri || failed) {
    return (
      <View style={[style, styles.placeholder]}>
        <Text style={styles.placeholderGlyph}>🧶</Text>
        <Text style={styles.placeholderText}>sem foto</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: resolveImageUrl(uri) }}
      style={style}
      resizeMode="cover"
      onError={() => setFailed(true)}
      accessibilityLabel={label}
    />
  );
}

function ProductCard({
  product,
  onPress,
  onEdit,
  onDelete,
  variant = 'showcase',
}) {
  const outOfStock = product.stock <= 0;

  if (variant === 'manage') {
    return (
      <TouchableOpacity
        style={styles.manageCard}
        onPress={onPress}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={`Produto ${product.name}`}>
        <View style={styles.row}>
          <ProductImage
            uri={product.imageUrl}
            style={styles.thumb}
            label={product.name}
          />

          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={2}>
              {product.name}
            </Text>
            <Text style={styles.price}>{formatCurrency(product.price)}</Text>
            <Text style={[styles.stock, outOfStock && styles.stockOut]}>
              {outOfStock ? 'Sem estoque' : `${product.stock} em estoque`}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            onPress={onEdit}
            style={styles.actionBtn}
            accessibilityRole="button"
            accessibilityLabel={`Editar ${product.name}`}>
            <Text style={styles.actionText}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onDelete}
            style={[styles.actionBtn, styles.deleteBtn]}
            accessibilityRole="button"
            accessibilityLabel={`Excluir ${product.name}`}>
            <Text style={[styles.actionText, styles.deleteText]}>Excluir</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.showcaseCard}
      onPress={onPress}
      activeOpacity={0.9}
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, ${formatCurrency(product.price)}`}>
      <View style={styles.showcaseImageWrapper}>
        <ProductImage
          uri={product.imageUrl}
          style={styles.showcaseImage}
          label={product.name}
        />

        {outOfStock && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Esgotado</Text>
          </View>
        )}
      </View>

      <View style={styles.showcaseInfo}>
        <Text style={styles.showcaseName} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.showcasePrice}>
          {formatCurrency(product.price)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default React.memo(ProductCard);

const styles = StyleSheet.create({
  // ─── Vitrine (cliente) ───────────────────────────────────
  showcaseCard: {
    width: '48.5%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadows.emblem,
  },
  showcaseImageWrapper: { width: '100%', aspectRatio: 1 },
  showcaseImage: { width: '100%', height: '100%' },
  showcaseInfo: { padding: spacing.sm },
  showcaseName: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
    minHeight: 40,
  },
  showcasePrice: {
    ...typography.subtitle,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  badge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: 'rgba(61, 44, 35, 0.85)',
    borderRadius: radius.pill,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
  },
  badgeText: {
    ...typography.caption,
    color: colors.textInverse,
    fontSize: 11,
    fontWeight: '600',
  },

  // ─── Gestão (admin) ──────────────────────────────────────
  manageCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  row: { flexDirection: 'row' },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
  },
  info: { flex: 1, marginLeft: spacing.md, justifyContent: 'center' },
  name: { ...typography.subtitle, color: colors.textPrimary },
  price: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  stock: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  stockOut: { color: colors.danger },
  actions: {
    flexDirection: 'row',
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  actionBtn: {
    flex: 1,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
  },
  deleteBtn: { marginLeft: spacing.sm },
  actionText: { ...typography.body, fontWeight: '600', color: colors.primary },
  deleteText: { color: colors.danger },

  // ─── Compartilhado ───────────────────────────────────────
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  placeholderGlyph: { fontSize: 26, opacity: 0.5 },
  placeholderText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
});