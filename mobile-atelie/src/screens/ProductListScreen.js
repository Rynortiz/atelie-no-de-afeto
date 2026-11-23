import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  Alert,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ProductCard from '../components/ProductCard';
import Button from '../components/Button';
import CategoryFilter, { ALL_CATEGORIES } from '../components/CategoryFilter';
import { LoadingView, EmptyView, ErrorView } from '../components/StateViews';
import { productService, categoryService } from '../api/productService';
import { useAuth } from '../contexts/AuthContext';
import { colors, spacing, typography } from '../theme/theme';

export default function ProductListScreen({ navigation }) {
  const { user, isAdmin, signOut } = useAuth();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadData = useCallback(async ({ isRefresh = false } = {}) => {
    if (isRefresh) setRefreshing(true);
    setError('');

    try {
      const [productResponse, categoryResponse] = await Promise.all([
        productService.list({ page: 1, limit: 50 }),
        categoryService.list(),
      ]);

      setProducts(productResponse.data ?? []);
      setCategories(categoryResponse.data ?? []);
    } catch (err) {
      setError(err.message || 'Erro ao carregar produtos.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // recarregamento automatico
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  /**
   * aplicação do filtro na lista já carregada
   */
  const visibleProducts = useMemo(() => {
    if (selectedCategory === ALL_CATEGORIES) return products;
    return products.filter(
      p => String(p.categoryId) === String(selectedCategory),
    );
  }, [products, selectedCategory]);

  /** callback para achar os detalhes a partir do ID */
  const categoryNameOf = useCallback(
    categoryId =>
      categories.find(c => String(c.id) === String(categoryId))?.name,
    [categories],
  );

  const handleDelete = product => {
    // confirmação antes da exclusão
    Alert.alert(
      'Excluir produto',
      `Deseja realmente excluir "${product.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await productService.remove(product.id);
              setProducts(prev => prev.filter(p => p.id !== product.id));
            } catch (err) {
              Alert.alert('Erro', err.message || 'Não foi possível excluir.');
            }
          },
        },
      ],
    );
  };

  if (loading) return <LoadingView message="Carregando produtos..." />;

  if (error && products.length === 0) {
    return <ErrorView message={error} onRetry={loadData} />;
  }

  const emptyMessage =
    selectedCategory === ALL_CATEGORIES
      ? 'Nenhum produto cadastrado ainda.'
      : 'Nenhuma peça nesta categoria.';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.greeting}>
            Olá, {user?.name?.split(' ')[0]}
          </Text>
          <Text style={styles.subtitle}>
            {isAdmin ? 'Gerenciar catálogo' : 'Peças feitas à mão'}
          </Text>
        </View>

        <TouchableOpacity
          onPress={signOut}
          style={styles.signOut}
          accessibilityRole="button"
          accessibilityLabel="Sair da conta">
          <Text style={styles.signOutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      {/* RN: só admin cria produtos */}
      {isAdmin && (
        <Button
          title="+ Novo produto"
          onPress={() => navigation.navigate('ProductForm', { product: null })}
          style={styles.newButton}
        />
      )}

      <CategoryFilter
        categories={categories}
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />

      <FlatList
        // numColumns não pode mudar sem remontar a lista; a key garante
        // isso caso o papel do usuário mude na mesma sessão.
        key={isAdmin ? 'manage' : 'showcase'}
        data={visibleProducts}
        keyExtractor={item => String(item.id)}
        numColumns={isAdmin ? 1 : 2}
        columnWrapperStyle={isAdmin ? undefined : styles.column}
        contentContainerStyle={styles.list}
        refreshing={refreshing}
        onRefresh={() => loadData({ isRefresh: true })}
        ListEmptyComponent={<EmptyView message={emptyMessage} />}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            variant={isAdmin ? 'manage' : 'showcase'}
            onPress={() =>
              isAdmin
                ? navigation.navigate('ProductForm', { product: item })
                : navigation.navigate('ProductDetail', {
                    product: item,
                    categoryName: categoryNameOf(item.categoryId),
                  })
            }
            onEdit={() => navigation.navigate('ProductForm', { product: item })}
            onDelete={() => handleDelete(item)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerText: { flex: 1 },
  greeting: { ...typography.subtitle, color: colors.textPrimary },
  subtitle: { ...typography.caption, color: colors.textSecondary },
  signOut: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  signOutText: { ...typography.body, color: colors.primary },
  newButton: { marginHorizontal: spacing.md, marginBottom: spacing.md },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  column: { justifyContent: 'space-between' },
});