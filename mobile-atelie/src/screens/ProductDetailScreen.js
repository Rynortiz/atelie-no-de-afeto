import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { formatCurrency } from '../utils/formatters';
import { colors, spacing, radius, typography, shadows } from '../theme/theme';
import { resolveImageUrl } from '../utils/imageUrl';

export default function ProductDetailScreen({ route }) {
  const { product, categoryName } = route.params ?? {};
  const { width } = useWindowDimensions();
  const [imageFailed, setImageFailed] = useState(false);

  const outOfStock = product?.stock <= 0;
  const hasImage = Boolean(product?.imageUrl) && !imageFailed;

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <View style={[styles.imageWrapper, { height: width }]}>
        {hasImage ? (
          <Image
            source={{ uri: resolveImageUrl(product.imageUrl) }}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImageFailed(true)}
            accessibilityLabel={product.name}
          />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderGlyph}>🧶</Text>
            <Text style={styles.placeholderText}>sem foto</Text>
          </View>
        )}
      </View>

      <View style={styles.body}>
        {!!categoryName && (
          <View style={styles.categoryTag}>
            <Text style={styles.categoryText}>{categoryName}</Text>
          </View>
        )}

        <Text style={styles.name}>{product?.name}</Text>

        <Text style={styles.price}>{formatCurrency(product?.price)}</Text>

        <View
          style={[
            styles.availability,
            outOfStock ? styles.availabilityOut : styles.availabilityIn,
          ]}>
          <Text
            style={[
              styles.availabilityText,
              outOfStock && styles.availabilityTextOut,
            ]}>
            {outOfStock ? 'Esgotado no momento' : 'Disponível'}
          </Text>
        </View>

        {!!product?.description && (
          <>
            <Text style={styles.sectionTitle}>Sobre a peça</Text>
            <Text style={styles.description}>{product.description}</Text>
          </>
        )}

        <View style={styles.note}>
          <Text style={styles.noteText}>
            Cada peça é feita à mão, então pequenas variações de cor e
            acabamento fazem parte do charme do artesanal.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xl },

  imageWrapper: { width: '100%', backgroundColor: colors.surface },
  image: { width: '100%', height: '100%' },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  placeholderGlyph: { fontSize: 44, opacity: 0.4 },
  placeholderText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  body: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    marginTop: -spacing.lg,
    padding: spacing.lg,
    ...shadows.card,
  },

  categoryTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.decorWarm,
    borderRadius: radius.pill,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.sm,
  },
  categoryText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: '600',
  },

  name: { ...typography.title, color: colors.textPrimary },
  price: {
    ...typography.title,
    color: colors.primary,
    marginTop: spacing.sm,
  },

  availability: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  availabilityIn: { backgroundColor: 'rgba(46, 125, 83, 0.12)' },
  availabilityOut: { backgroundColor: 'rgba(192, 57, 43, 0.10)' },
  availabilityText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '600',
  },
  availabilityTextOut: { color: colors.danger },

  sectionTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },

  note: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  noteText: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 19,
  },
});