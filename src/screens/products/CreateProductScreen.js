import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useStore } from '../../contexts/StoreContext';
import { useTheme } from '../../contexts/ThemeContext';

export default function CreateProductScreen({ route, navigation }) {
  const productToEdit = route.params?.productToEdit;
  const isEditing = !!productToEdit;

  const { store, addProduct, updateProduct, deleteProduct } = useStore();
  const { colors } = useTheme();

  const [productTitle, setProductTitle] = useState(productToEdit ? productToEdit.title : '');
  const [selectedSizes, setSelectedSizes] = useState(productToEdit ? productToEdit.sizes : []);
  const [variants, setVariants] = useState(productToEdit ? productToEdit.variants : []);

  const [currentColorName, setCurrentColorName] = useState('');
  const [currentImageUri, setCurrentImageUri] = useState(null);

  const availableSizes = store?.allowedSizes || [];

  const toggleSize = (size) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const pickImageForColor = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Autorize o acesso à galeria para anexar foto a esta cor.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      setCurrentImageUri(result.assets[0].uri);
    }
  };

  // Adiciona a cor (foto é opcional)
  const handleAddColorVariant = () => {
    if (!currentColorName.trim()) {
      Alert.alert('Atenção', 'Informe o nome da cor.');
      return;
    }

    const newVariant = {
      id: String(Date.now()),
      colorName: currentColorName.trim(),
      imageUri: currentImageUri || null, // Opcional
    };

    setVariants((prev) => [...prev, newVariant]);
    setCurrentColorName('');
    setCurrentImageUri(null);
  };

  const handleRemoveVariant = (variantId) => {
    setVariants((prev) => prev.filter((v) => v.id !== variantId));
  };

  const handleSaveProduct = () => {
    if (!productTitle.trim() || selectedSizes.length === 0 || variants.length === 0) {
      Alert.alert(
        'Campos incompletos',
        'Informe o título, selecione ao menos 1 tamanho e cadastre ao menos 1 cor (com ou sem foto).'
      );
      return;
    }

    const payload = {
      title: productTitle.trim(),
      sizes: selectedSizes,
      variants,
    };

    if (isEditing) {
      updateProduct(productToEdit.id, payload);
      Alert.alert('Atualizado', 'Card atualizado com sucesso!');
    } else {
      addProduct(payload);
      Alert.alert('Cadastrado', 'Novo card publicado!');
    }

    navigation.goBack();
  };

  const handleDelete = () => {
    Alert.alert('Excluir Card', 'Deseja remover este card do catálogo?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          deleteProduct(productToEdit.id);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.screenTitle, { color: colors.text }]}>
        {isEditing ? 'Editar Card de Produto' : 'Criar Card de Produto'}
      </Text>

      <Text style={[styles.label, { color: colors.subText }]}>Título do Produto *</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
        placeholder="Ex: Calça Cargo Sarja"
        placeholderTextColor={colors.subText}
        value={productTitle}
        onChangeText={setProductTitle}
      />

      {/* Seleção da Grade da Loja */}
      <Text style={[styles.label, { color: colors.subText }]}>Tamanhos Disponíveis para este Produto *</Text>
      <View style={styles.chipsWrap}>
        {availableSizes.map((size) => {
          const isSelected = selectedSizes.includes(size);
          return (
            <TouchableOpacity
              key={size}
              style={[
                styles.sizeChip,
                { backgroundColor: colors.card, borderColor: colors.border },
                isSelected && { backgroundColor: colors.primary, borderColor: colors.primary }
              ]}
              onPress={() => toggleSize(size)}
            >
              <Text style={[styles.sizeChipText, { color: colors.text }, isSelected && { color: colors.primaryText, fontWeight: '700' }]}>
                {size}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Cadastro de Cor e Foto (Foto Opcional) */}
      <View style={[styles.variantBuilderBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.subTitle, { color: colors.text }]}>Cores do Card</Text>
        <Text style={[styles.helperText, { color: colors.subText }]}>
          Defina o nome da cor. A foto é opcional.
        </Text>

        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
          placeholder="Nome da cor (Ex: Azul Marinho)"
          placeholderTextColor={colors.subText}
          value={currentColorName}
          onChangeText={setCurrentColorName}
        />

        <View style={styles.imagePickerRow}>
          <TouchableOpacity
            style={[styles.uploadButton, { backgroundColor: colors.chip, borderColor: colors.border }]}
            onPress={pickImageForColor}
          >
            <Text style={[styles.uploadButtonText, { color: colors.text }]}>
              {currentImageUri ? '📷 Trocar Imagem' : '📷 Foto (Opcional)'}
            </Text>
          </TouchableOpacity>
          {currentImageUri && (
            <Image source={{ uri: currentImageUri }} style={styles.previewThumbnail} />
          )}
        </View>

        <TouchableOpacity style={[styles.addColorButton, { backgroundColor: colors.primary }]} onPress={handleAddColorVariant}>
          <Text style={[styles.addColorButtonText, { color: colors.primaryText }]}>+ Incluir esta Cor</Text>
        </TouchableOpacity>
      </View>

      {/* Cores vinculadas */}
      {variants.length > 0 && (
        <View style={[styles.addedVariantsList, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.subText }]}>Cores Vinculadas ({variants.length})</Text>
          {variants.map((item) => (
            <View key={item.id} style={[styles.variantItem, { borderBottomColor: colors.border }]}>
              {item.imageUri ? (
                <Image source={{ uri: item.imageUri }} style={styles.variantThumb} />
              ) : (
                <View style={[styles.variantThumb, styles.noThumb, { backgroundColor: colors.chip }]}>
                  <Text style={{ fontSize: 16 }}>🎨</Text>
                </View>
              )}
              <Text style={[styles.variantName, { color: colors.text }]}>
                {item.colorName} {item.imageUri ? '' : '(Sem foto)'}
              </Text>
              <TouchableOpacity onPress={() => handleRemoveVariant(item.id)}>
                <Text style={{ color: colors.danger, fontWeight: '700' }}>Remover</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity style={[styles.saveProductButton, { backgroundColor: colors.primary }]} onPress={handleSaveProduct}>
        <Text style={[styles.saveProductButtonText, { color: colors.primaryText }]}>
          {isEditing ? 'Salvar Alterações' : 'Publicar Card'}
        </Text>
      </TouchableOpacity>

      {isEditing && (
        <TouchableOpacity style={[styles.deleteButton, { backgroundColor: colors.dangerSurface }]} onPress={handleDelete}>
          <Text style={[styles.deleteButtonText, { color: colors.danger }]}>Excluir Card</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  screenTitle: { fontSize: 22, fontWeight: '800', marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 6, marginTop: 8 },
  subTitle: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  helperText: { fontSize: 12, marginBottom: 12 },
  input: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 12, fontSize: 14 },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  sizeChip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1 },
  sizeChipText: { fontSize: 13, fontWeight: '500' },
  variantBuilderBox: { padding: 16, borderRadius: 16, borderWidth: 1, marginTop: 8 },
  imagePickerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  uploadButton: { flex: 1, borderWidth: 1, borderStyle: 'dashed', padding: 12, borderRadius: 10, alignItems: 'center' },
  uploadButtonText: { fontSize: 13, fontWeight: '600' },
  previewThumbnail: { width: 44, height: 44, borderRadius: 8 },
  addColorButton: { padding: 11, borderRadius: 10, alignItems: 'center' },
  addColorButtonText: { fontWeight: '700', fontSize: 13 },
  addedVariantsList: { marginTop: 16, padding: 14, borderRadius: 14, borderWidth: 1 },
  variantItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1 },
  variantThumb: { width: 38, height: 38, borderRadius: 8 },
  noThumb: { justifyContent: 'center', alignItems: 'center' },
  variantName: { flex: 1, fontSize: 14, fontWeight: '600', marginLeft: 10 },
  saveProductButton: { padding: 16, borderRadius: 14, alignItems: 'center', marginTop: 24 },
  saveProductButtonText: { fontWeight: '700', fontSize: 16 },
  deleteButton: { padding: 14, borderRadius: 14, alignItems: 'center', marginTop: 12, marginBottom: 30 },
  deleteButtonText: { fontWeight: '700', fontSize: 15 },
});