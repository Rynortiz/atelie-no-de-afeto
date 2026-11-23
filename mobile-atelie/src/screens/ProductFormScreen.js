import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import TextField from '../components/TextField';
import Button from '../components/Button';
import ImagePickerField from '../components/ImagePickerField';
import { LoadingView } from '../components/StateViews';
import { productService, categoryService } from '../api/productService';
import { validateProductForm } from '../utils/validators';
import { parseDecimal, formatPriceInput } from '../utils/formatters';
import { useAuth } from '../contexts/AuthContext';
import { colors, spacing, radius, typography } from '../theme/theme';

const emptyForm = {
  name: '',
  description: '',
  price: '',
  stock: '',
  categoryId: '',
  imageUrl: null,
};

export default function ProductFormScreen({ route, navigation }) {
  const { product, readOnly = false } = route.params ?? {};
  const isEditing = Boolean(product);
  const { isAdmin } = useAuth();

  // testa se é admin, se não, somente leitura
  const editable = isAdmin && !readOnly;

  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name ?? '',
        description: product.description ?? '',
        price: formatPriceInput(product.price),
        stock: String(product.stock ?? ''),
        categoryId: String(product.categoryId ?? ''),
        imageUrl: product.imageUrl ?? null,
      });
    }
  }, [product]);

  useEffect(() => {
    navigation.setOptions({
      title: isEditing
        ? editable
          ? 'Editar produto'
          : 'Detalhes do produto'
        : 'Novo produto',
    });
  }, [navigation, isEditing, editable]);

  const loadCategories = useCallback(async () => {
    try {
      const response = await categoryService.list();
      setCategories(response.data ?? []);
    } catch (err) {
      Alert.alert('Erro', err.message || 'Erro ao carregar categorias.');
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleSave = async () => {
    const validationErrors = validateProductForm(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setSaving(true);

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: parseDecimal(form.price),
      stock: Number(form.stock),
      categoryId: form.categoryId,
      imageUrl: form.imageUrl,
    };

    try {
      if (isEditing) {
        await productService.update(product.id, payload);
      } else {
        await productService.create(payload);
      }

      Alert.alert(
        'Sucesso',
        isEditing ? 'Produto atualizado.' : 'Produto cadastrado.',
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    } catch (err) {
      Alert.alert('Erro', err.message || 'Não foi possível salvar.');
    } finally {
      setSaving(false);
    }
  };

  if (loadingCategories) return <LoadingView message="Carregando..." />;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag">
        <ImagePickerField
          imageUrl={form.imageUrl}
          onChange={url => updateField('imageUrl', url)}
          editable={editable}
          error={errors.imageUrl}
        />

        <TextField
          label="Nome"
          value={form.name}
          onChangeText={v => updateField('name', v)}
          placeholder="Ex.: Amigurumi Coelho"
          error={errors.name}
          editable={editable}
        />

        <TextField
          label="Descrição"
          value={form.description}
          onChangeText={v => updateField('description', v)}
          placeholder="Detalhes da peça"
          multiline
          editable={editable}
        />

        <TextField
          label="Preço"
          value={form.price}
          onChangeText={v => updateField('price', v)}
          placeholder="0,00"
          prefix="R$"
          keyboardType="decimal-pad"
          error={errors.price}
          editable={editable}
        />

        <TextField
          label="Estoque"
          value={form.stock}
          onChangeText={v => updateField('stock', v)}
          placeholder="0"
          keyboardType="number-pad"
          error={errors.stock}
          editable={editable}
        />

        <Text style={styles.label}>Categoria</Text>
        <View style={styles.categoryList}>
          {categories.map(category => {
            const selected = String(category.id) === String(form.categoryId);
            return (
              <TouchableOpacity
                key={category.id}
                style={[styles.chip, selected && styles.chipSelected]}
                onPress={() =>
                  editable && updateField('categoryId', String(category.id))
                }
                disabled={!editable}
                accessibilityRole="button"
                accessibilityState={{ selected }}>
                <Text
                  style={[styles.chipText, selected && styles.chipTextSelected]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {!!errors.categoryId && (
          <Text style={styles.error}>{errors.categoryId}</Text>
        )}

        {editable && (
          <Button
            title={isEditing ? 'Salvar alterações' : 'Cadastrar produto'}
            onPress={handleSave}
            loading={saving}
            style={styles.saveButton}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg, paddingBottom: 160 },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  categoryList: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: { ...typography.body, color: colors.textPrimary },
  chipTextSelected: { color: colors.textInverse, fontWeight: '600' },
  error: { ...typography.caption, color: colors.danger },
  saveButton: { marginTop: spacing.lg },
});