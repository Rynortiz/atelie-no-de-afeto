import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import {
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';
import { uploadService, filenameFromUrl } from '../api/uploadService';
import { colors, spacing, radius, typography } from '../theme/theme';
import { resolveImageUrl } from '../utils/imageUrl';

/**
 * Espelha as regras do middleware Multer no backend.
 * Validar aqui também não substitui a checagem do servidor — apenas
 * evita subir 10MB para receber um 400 previsível.
 */
const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/**
 * Pede permissão de câmera no Android.
 * A galeria não precisa: o seletor do sistema devolve apenas o arquivo
 * escolhido, sem dar acesso ao restante das fotos.
 */
async function ensureCameraPermission() {
  if (Platform.OS !== 'android') return true;

  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.CAMERA,
    {
      title: 'Permissão de câmera',
      message: 'O app precisa da câmera para fotografar a peça.',
      buttonPositive: 'Permitir',
      buttonNegative: 'Agora não',
    },
  );

  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

/**
 * Campo de imagem do produto: escolhe da galeria ou tira foto, envia
 * para a API e devolve a URL pública ao formulário.
 *
 * O upload acontece na hora da escolha, não ao salvar o produto — assim
 * a pessoa vê a imagem real que ficou no servidor e descobre qualquer
 * erro (tamanho, formato) antes de preencher o resto.
 */
export default function ImagePickerField({
  imageUrl,
  onChange,
  editable = true,
  error,
}) {
  const [uploading, setUploading] = useState(false);

  const validateAsset = asset => {
    if (asset.fileSize && asset.fileSize > MAX_SIZE_MB * 1024 * 1024) {
      return `A imagem excede o limite de ${MAX_SIZE_MB}MB.`;
    }
    if (asset.type && !ALLOWED_TYPES.includes(asset.type)) {
      return 'Formato inválido. Envie JPG, PNG, WEBP ou GIF.';
    }
    return null;
  };

  const handleAsset = async asset => {
    const localError = validateAsset(asset);
    if (localError) {
      Alert.alert('Imagem inválida', localError);
      return;
    }

    setUploading(true);
    const previousFilename = filenameFromUrl(imageUrl);

    try {
      const { imageUrl: uploadedUrl } = await uploadService.uploadImage(asset);
      onChange(uploadedUrl);

      // Só apaga a anterior depois que a nova subiu com sucesso —
      // se o upload falhar, a imagem antiga continua válida.
      if (previousFilename) {
        uploadService.deleteImage(previousFilename).catch(() => {
          // Falha ao limpar arquivo órfão não deve travar o fluxo.
        });
      }
    } catch (err) {
      Alert.alert('Erro no upload', err.message || 'Não foi possível enviar.');
    } finally {
      setUploading(false);
    }
  };

  const pickFrom = async source => {
    const options = {
      mediaType: 'photo',
      // Reduz o arquivo antes de sair do aparelho: economiza rede e
      // mantém o upload longe do teto de 5MB.
      maxWidth: 1280,
      maxHeight: 1280,
      quality: 0.8,
    };

    try {
      let result;

      if (source === 'camera') {
        const allowed = await ensureCameraPermission();
        if (!allowed) {
          Alert.alert(
            'Permissão negada',
            'Sem acesso à câmera não é possível tirar a foto.',
          );
          return;
        }
        result = await launchCamera(options);
      } else {
        result = await launchImageLibrary(options);
      }

      if (result.didCancel) return;
      if (result.errorCode) {
        Alert.alert('Erro', result.errorMessage || 'Não foi possível abrir.');
        return;
      }

      const asset = result.assets?.[0];
      if (asset?.uri) await handleAsset(asset);
    } catch (err) {
      Alert.alert('Erro', err.message || 'Falha ao selecionar a imagem.');
    }
  };

  const handleRemove = () => {
    Alert.alert('Remover imagem', 'Deseja remover a foto do produto?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: () => {
          const filename = filenameFromUrl(imageUrl);
          onChange(null);
          if (filename) {
            uploadService.deleteImage(filename).catch(() => {});
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Imagem do produto</Text>

      <View style={[styles.preview, !!error && styles.previewError]}>
        {uploading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.hint}>Enviando...</Text>
          </View>
        ) : imageUrl ? (
          <Image
            source={{ uri: resolveImageUrl(imageUrl) }}
            style={styles.image}
            resizeMode="cover"
            accessibilityLabel="Imagem do produto"
          />
        ) : (
          <View style={styles.center}>
            <Text style={styles.placeholderGlyph}>🧺</Text>
            <Text style={styles.hint}>
              {editable ? 'Nenhuma imagem escolhida' : 'Sem imagem'}
            </Text>
          </View>
        )}
      </View>

      {editable && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.action}
            onPress={() => pickFrom('library')}
            disabled={uploading}
            accessibilityRole="button">
            <Text style={styles.actionText}>Galeria</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.action}
            onPress={() => pickFrom('camera')}
            disabled={uploading}
            accessibilityRole="button">
            <Text style={styles.actionText}>Câmera</Text>
          </TouchableOpacity>

          {!!imageUrl && (
            <TouchableOpacity
              style={[styles.action, styles.actionDanger]}
              onPress={handleRemove}
              disabled={uploading}
              accessibilityRole="button">
              <Text style={[styles.actionText, styles.actionTextDanger]}>
                Remover
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <Text style={styles.rules}>
        JPG, PNG, WEBP ou GIF · até {MAX_SIZE_MB}MB
      </Text>

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
  preview: {
    height: 180,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewError: { borderColor: colors.danger },
  image: { width: '100%', height: '100%' },
  center: { alignItems: 'center' },
  placeholderGlyph: { fontSize: 34, marginBottom: spacing.xs },
  hint: { ...typography.caption, color: colors.textSecondary },

  actions: { flexDirection: 'row', marginTop: spacing.sm },
  action: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
  },
  actionDanger: { borderColor: colors.danger },
  actionText: { ...typography.caption, color: colors.textPrimary },
  actionTextDanger: { color: colors.danger },

  rules: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    fontSize: 12,
  },
  error: { ...typography.caption, color: colors.danger, marginTop: spacing.xs },
});