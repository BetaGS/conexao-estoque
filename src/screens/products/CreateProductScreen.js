import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useStore } from '../../contexts/StoreContext';
import { useTheme } from '../../contexts/ThemeContext';

export default function CreateProductScreen({ navigation }) {
  const { addProduct, store } = useStore();
  const { colors } = useTheme();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [colorsList, setColorsList] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);

  // Lista de tamanhos configurados na loja ou padrão
  const availableSizes = store?.allowedSizes?.length
    ? store.allowedSizes
    : ['PP', 'P', 'M', 'G', 'GG', '38', '39', '40', '41', '42'];

  // Alterna a seleção de tamanhos
  const toggleSize = (size) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter((s) => s !== size));
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  // 1. Tirar foto com a Câmera
  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão Negada', 'Precisamos de acesso à sua câmera para tirar fotos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 4],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível abrir a câmera.');
    }
  };

  // 2. Escolher foto da Galeria
  const handlePickGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão Negada', 'Precisamos de acesso à sua galeria para selecionar imagens.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 4],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível abrir a galeria.');
    }
  };

  // Menu de opções para a imagem
  const handleSelectImageOptions = () => {
    Alert.alert('Foto do Produto', 'Como você deseja adicionar a imagem?', [
      { text: '📷 Tirar Foto Agora', onPress: handleTakePhoto },
      { text: '🖼️ Escolher da Galeria', onPress: handlePickGallery },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  // Salvar produto
  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Campo Obrigatório', 'Por favor, digite o título do produto.');
      return;
    }

    if (selectedSizes.length === 0) {
      Alert.alert('Campo Obrigatório', 'Selecione ao menos um tamanho disponível.');
      return;
    }

    const formattedColors = colorsList
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    setLoading(true);
    const result = await addProduct({
      title: title.trim(),
      description: description.trim(),
      sizes: selectedSizes,
      colors: formattedColors.length > 0 ? formattedColors : ['Única'],
      image: imageUri,
    });
    setLoading(false);

    if (result.success) {
      Alert.alert('Sucesso', 'Card de produto criado com sucesso!');
      navigation.goBack();
    } else {
      Alert.alert('Erro ao Salvar', result.error || 'Não foi possível cadastrar o produto.');
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      {/* Seção da Imagem */}
      <View style={styles.imageSection}>
        <TouchableOpacity
          style={[styles.imagePickerBox, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={handleSelectImageOptions}
        >
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
          ) : (
            <View style={styles.placeholderBox}>
              <Text style={styles.cameraIcon}>📸</Text>
              <Text style={[styles.placeholderText, { color: colors.primary }]}>
                Tirar Foto ou Escolher da Galeria
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {imageUri && (
          <TouchableOpacity style={styles.changePhotoBtn} onPress={handleSelectImageOptions}>
            <Text style={[styles.changePhotoText, { color: colors.primary }]}>Trocar Foto</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Formulário */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.label, { color: colors.subText }]}>NOME DO PRODUTO / REFERÊNCIA *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
          placeholder="Ex: Camiseta Básica Slim"
          placeholderTextColor={colors.subText}
          value={title}
          onChangeText={setTitle}
        />

        <Text style={[styles.label, { color: colors.subText, marginTop: 14 }]}>DESCRIÇÃO / DETALHES</Text>
        <TextInput
          style={[
            styles.input,
            styles.textArea,
            { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text },
          ]}
          placeholder="Ex: 100% Algodão, corte regular..."
          placeholderTextColor={colors.subText}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />

        <Text style={[styles.label, { color: colors.subText, marginTop: 14 }]}>
          CORES DISPONÍVEIS (SEPARE POR VÍRGULA)
        </Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
          placeholder="Ex: Preto, Branco, Azul Marinho"
          placeholderTextColor={colors.subText}
          value={colorsList}
          onChangeText={setColorsList}
        />

        {/* Seleção de Tamanhos */}
        <Text style={[styles.label, { color: colors.subText, marginTop: 14 }]}>TAMANHOS DISPONÍVEIS *</Text>
        <View style={styles.sizesContainer}>
          {availableSizes.map((size) => {
            const isSelected = selectedSizes.includes(size);
            return (
              <TouchableOpacity
                key={size}
                style={[
                  styles.sizeChip,
                  isSelected
                    ? { backgroundColor: colors.primary, borderColor: colors.primary }
                    : { backgroundColor: colors.inputBg, borderColor: colors.border },
                ]}
                onPress={() => toggleSize(size)}
              >
                <Text
                  style={[
                    styles.sizeChipText,
                    { color: isSelected ? colors.primaryText : colors.text },
                  ]}
                >
                  {size}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Botão Salvar */}
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.primaryText} size="small" />
          ) : (
            <Text style={[styles.saveBtnText, { color: colors.primaryText }]}>Criar Card de Produto</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20 },
  imageSection: { alignItems: 'center', marginBottom: 20 },
  imagePickerBox: {
    width: '100%',
    height: 220,
    borderRadius: 20,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  placeholderBox: { alignItems: 'center', padding: 20 },
  cameraIcon: { fontSize: 40, marginBottom: 8 },
  placeholderText: { fontSize: 14, fontWeight: '700', textAlign: 'center' },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  changePhotoBtn: { marginTop: 10, paddingVertical: 4 },
  changePhotoText: { fontWeight: '700', fontSize: 13, textDecorationLine: 'underline' },
  card: { padding: 18, borderRadius: 20, borderWidth: 1, elevation: 2 },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 15 },
  textArea: { height: 75, textAlignVertical: 'top' },
  sizesContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  sizeChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    minWidth: 44,
    alignItems: 'center',
  },
  sizeChipText: { fontWeight: '700', fontSize: 13 },
  saveBtn: { paddingVertical: 15, borderRadius: 14, alignItems: 'center' },
  saveBtnText: { fontWeight: '700', fontSize: 15 },
});