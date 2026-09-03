import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useStore } from '../../contexts/StoreContext';
import { useTheme } from '../../contexts/ThemeContext';

export default function CreateStoreScreen({ navigation }) {
  const [storeName, setStoreName] = useState('');
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [customSizes, setCustomSizes] = useState([]);
  const { createStore } = useStore();
  const { colors } = useTheme();

  const handleAddSize = () => {
    const trimmed = customSizeInput.trim().toUpperCase();
    if (!trimmed) return;
    if (customSizes.includes(trimmed)) {
      Alert.alert('Atenção', 'Este tamanho já foi incluído na grade.');
      return;
    }
    setCustomSizes((prev) => [...prev, trimmed]);
    setCustomSizeInput('');
  };

  const handleRemoveSize = (sizeToRemove) => {
    setCustomSizes((prev) => prev.filter((s) => s !== sizeToRemove));
  };

  const handleCreate = () => {
    if (!storeName.trim()) {
      Alert.alert('Erro', 'Informe o nome da loja.');
      return;
    }

    if (customSizes.length === 0) {
      Alert.alert('Atenção', 'Adicione pelo menos um tamanho à grade da sua loja.');
      return;
    }

    createStore({
      name: storeName.trim(),
      allowedSizes: customSizes,
    });

    navigation.replace('MainTabs');
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Criar Nova Loja</Text>
      <Text style={[styles.subtitle, { color: colors.subText }]}>Defina o nome e monte sua grade personalizada</Text>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.label, { color: colors.subText }]}>Nome da Loja *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
          value={storeName}
          onChangeText={setStoreName}
          placeholder="Ex: Boutique Exclusiva"
          placeholderTextColor={colors.subText}
        />

        <Text style={[styles.label, { color: colors.subText }]}>Monte a Grade de Tamanhos da Loja *</Text>
        <View style={styles.addSizeRow}>
          <TextInput
            style={[styles.input, styles.sizeInputFlex, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
            value={customSizeInput}
            onChangeText={setCustomSizeInput}
            placeholder="Ex: 38, P, G, Único"
            placeholderTextColor={colors.subText}
            autoCapitalize="characters"
          />
          <TouchableOpacity style={[styles.addSizeBtn, { backgroundColor: colors.primary }]} onPress={handleAddSize}>
            <Text style={[styles.addSizeBtnText, { color: colors.primaryText }]}>+ Incluir</Text>
          </TouchableOpacity>
        </View>

        {/* Chips de tamanhos criados */}
        <View style={styles.chipsContainer}>
          {customSizes.length === 0 ? (
            <Text style={[styles.emptySizesNotice, { color: colors.subText }]}>Nenhum tamanho adicionado ainda.</Text>
          ) : (
            customSizes.map((size) => (
              <TouchableOpacity
                key={size}
                style={[styles.sizeBadge, { backgroundColor: colors.chip, borderColor: colors.border }]}
                onPress={() => handleRemoveSize(size)}
              >
                <Text style={[styles.sizeBadgeText, { color: colors.text }]}>{size} ✕</Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        <TouchableOpacity style={[styles.primaryButton, { backgroundColor: colors.primary }]} onPress={handleCreate}>
          <Text style={[styles.primaryButtonText, { color: colors.primaryText }]}>Salvar e Acessar Loja</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 22, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '800' },
  subtitle: { fontSize: 13, marginBottom: 20, marginTop: 4 },
  card: { padding: 20, borderRadius: 20, borderWidth: 1, elevation: 2 },
  label: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 15, marginBottom: 14 },
  addSizeRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  sizeInputFlex: { flex: 1, marginBottom: 0 },
  addSizeBtn: { paddingHorizontal: 16, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  addSizeBtnText: { fontWeight: '700', fontSize: 14 },
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 12, minHeight: 40 },
  emptySizesNotice: { fontSize: 13, fontStyle: 'italic', marginVertical: 6 },
  sizeBadge: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1 },
  sizeBadgeText: { fontSize: 13, fontWeight: '600' },
  primaryButton: { padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  primaryButtonText: { fontWeight: '700', fontSize: 15 },
});