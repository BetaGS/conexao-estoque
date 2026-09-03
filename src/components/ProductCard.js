import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Modal, Switch, Alert } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../contexts/StoreContext';

export default function ProductCard({ product, onEdit, canEdit = true }) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { createOrder, userRoleInStore } = useStore();

  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);

  // Estados internos do Pedido
  const [orderSize, setOrderSize] = useState(product.sizes[0] || '');
  const [orderVariantIndex, setOrderVariantIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isUrgent, setIsUrgent] = useState(false);

  const activeVariant = product.variants[selectedVariantIndex] || product.variants[0];

  const handleOpenOrderModal = () => {
    setOrderSize(product.sizes[0] || '');
    setOrderVariantIndex(selectedVariantIndex);
    setQuantity(1);
    setIsUrgent(false);
    setModalVisible(true);
  };

  const handleConfirmOrder = () => {
    if (!orderSize) {
      Alert.alert('Atenção', 'Selecione o tamanho desejado.');
      return;
    }

    const selectedColor = product.variants[orderVariantIndex]?.colorName || 'Padrão';

    createOrder({
      product,
      color: selectedColor,
      size: orderSize,
      quantity,
      isUrgent,
      requestedBy: {
        name: user?.name || 'Colaborador',
        role: userRoleInStore || 'Equipe',
      },
    });

    setModalVisible(false);
    Alert.alert('Pedido Enviado!', 'O pedido foi encaminhado diretamente aos estoquistas.');
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Imagem dinâmica correspondente à cor selecionada */}
      <View style={[styles.imageContainer, { backgroundColor: colors.chip }]}>
        {activeVariant?.imageUri ? (
          <Image source={{ uri: activeVariant.imageUri }} style={styles.productImage} resizeMode="cover" />
        ) : (
          <View style={styles.placeholderBox}>
            <Text style={{ fontSize: 32 }}>📦</Text>
            <Text style={[styles.placeholderText, { color: colors.subText }]}>
              {activeVariant?.colorName ? `Sem foto para ${activeVariant.colorName}` : 'Sem foto'}
            </Text>
          </View>
        )}

        {/* Botão de Edição */}
        {canEdit && (
          <TouchableOpacity style={[styles.editBadge, { backgroundColor: colors.card }]} onPress={onEdit}>
            <Text style={[styles.editText, { color: colors.text }]}>✏️ Editar</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.detailsContainer}>
        <Text style={[styles.productTitle, { color: colors.text }]}>{product.title}</Text>

        {/* Cores interativas */}
        <Text style={[styles.sectionHeading, { color: colors.subText }]}>
          Cor: <Text style={{ color: colors.text, fontWeight: '700' }}>{activeVariant?.colorName}</Text>
        </Text>

        <View style={styles.colorChipsRow}>
          {product.variants.map((v, index) => {
            const isSelected = selectedVariantIndex === index;
            return (
              <TouchableOpacity
                key={v.id || index}
                style={[
                  styles.colorChip,
                  { backgroundColor: colors.chip, borderColor: colors.border },
                  isSelected && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
                onPress={() => setSelectedVariantIndex(index)}
              >
                <Text
                  style={[
                    styles.colorChipText,
                    { color: colors.text },
                    isSelected && { color: colors.primaryText, fontWeight: '700' },
                  ]}
                >
                  {v.colorName}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Grade de tamanhos */}
        <Text style={[styles.sectionHeading, { color: colors.subText }]}>Tamanhos disponíveis:</Text>
        <View style={styles.sizesRow}>
          {product.sizes.map((size) => (
            <View key={size} style={[styles.sizeBadge, { backgroundColor: colors.chip }]}>
              <Text style={[styles.sizeBadgeText, { color: colors.text }]}>{size}</Text>
            </View>
          ))}
        </View>

        {/* Botão de Ação: Fazer Pedido */}
        <TouchableOpacity
          style={[styles.orderButton, { backgroundColor: colors.primary }]}
          onPress={handleOpenOrderModal}
        >
          <Text style={[styles.orderButtonText, { color: colors.primaryText }]}>⚡ Solicitar ao Estoque</Text>
        </TouchableOpacity>
      </View>

      {/* Modal de Configuração do Pedido */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Solicitar Peça ao Estoque</Text>
            <Text style={[styles.modalSub, { color: colors.subText }]}>{product.title}</Text>

            {/* Escolha do Tamanho */}
            <Text style={[styles.modalLabel, { color: colors.subText }]}>Tamanho</Text>
            <View style={styles.modalOptionsRow}>
              {product.sizes.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.optionChip,
                    { backgroundColor: colors.chip, borderColor: colors.border },
                    orderSize === s && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                  onPress={() => setOrderSize(s)}
                >
                  <Text
                    style={[
                      styles.optionChipText,
                      { color: colors.text },
                      orderSize === s && { color: colors.primaryText, fontWeight: '700' },
                    ]}
                  >
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Escolha da Cor */}
            <Text style={[styles.modalLabel, { color: colors.subText }]}>Cor</Text>
            <View style={styles.modalOptionsRow}>
              {product.variants.map((v, idx) => (
                <TouchableOpacity
                  key={v.id || idx}
                  style={[
                    styles.optionChip,
                    { backgroundColor: colors.chip, borderColor: colors.border },
                    orderVariantIndex === idx && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                  onPress={() => setOrderVariantIndex(idx)}
                >
                  <Text
                    style={[
                      styles.optionChipText,
                      { color: colors.text },
                      orderVariantIndex === idx && { color: colors.primaryText, fontWeight: '700' },
                    ]}
                  >
                    {v.colorName}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Quantidade */}
            <Text style={[styles.modalLabel, { color: colors.subText }]}>Quantidade</Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={[styles.qtyBtn, { backgroundColor: colors.chip }]}
                onPress={() => setQuantity((prev) => Math.max(1, prev - 1))}
              >
                <Text style={[styles.qtyBtnText, { color: colors.text }]}>-</Text>
              </TouchableOpacity>
              <Text style={[styles.qtyDisplay, { color: colors.text }]}>{quantity}</Text>
              <TouchableOpacity
                style={[styles.qtyBtn, { backgroundColor: colors.chip }]}
                onPress={() => setQuantity((prev) => prev + 1)}
              >
                <Text style={[styles.qtyBtnText, { color: colors.text }]}>+</Text>
              </TouchableOpacity>
            </View>

            {/* Urgência */}
            <View style={[styles.urgencyRow, { borderColor: colors.border }]}>
              <View>
                <Text style={[styles.urgencyTitle, { color: isUrgent ? colors.danger : colors.text }]}>
                  {isUrgent ? '🚨 Pedido Urgente!' : 'Pedido Normal'}
                </Text>
                <Text style={[styles.urgencySub, { color: colors.subText }]}>Priorizar na fila do estoquista</Text>
              </View>
              <Switch
                value={isUrgent}
                onValueChange={setIsUrgent}
                thumbColor={isUrgent ? colors.danger : '#f4f3f4'}
                trackColor={{ false: '#767577', true: '#FCA5A5' }}
              />
            </View>

            {/* Ações */}
            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: colors.border }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.cancelBtnText, { color: colors.subText }]}>Voltar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmBtn, { backgroundColor: isUrgent ? colors.danger : colors.primary }]}
                onPress={handleConfirmOrder}
              >
                <Text style={[styles.confirmBtnText, { color: colors.primaryText }]}>Enviar Pedido</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, overflow: 'hidden', marginBottom: 18, borderWidth: 1, elevation: 2 },
  imageContainer: { width: '100%', height: 220, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  productImage: { width: '100%', height: '100%' },
  placeholderBox: { alignItems: 'center', justifyContent: 'center', padding: 12 },
  placeholderText: { fontSize: 13, marginTop: 6, fontWeight: '500' },
  editBadge: { position: 'absolute', top: 12, right: 12, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, elevation: 3 },
  editText: { fontSize: 12, fontWeight: '700' },
  detailsContainer: { padding: 16 },
  productTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  sectionHeading: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 6, marginBottom: 6 },
  colorChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  colorChip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1 },
  colorChipText: { fontSize: 12, fontWeight: '500' },
  sizesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  sizeBadge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8 },
  sizeBadgeText: { fontSize: 12, fontWeight: '700' },
  orderButton: { marginTop: 16, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  orderButtonText: { fontWeight: '700', fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 22, borderWidth: 1 },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  modalSub: { fontSize: 13, marginBottom: 16, marginTop: 2 },
  modalLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 6, marginTop: 10 },
  modalOptionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionChip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1 },
  optionChipText: { fontSize: 13, fontWeight: '500' },
  quantityContainer: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 6 },
  qtyBtn: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  qtyBtnText: { fontSize: 20, fontWeight: '700' },
  qtyDisplay: { fontSize: 18, fontWeight: '800' },
  urgencyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 18, paddingVertical: 10, borderTopWidth: 1, borderBottomWidth: 1 },
  urgencyTitle: { fontSize: 15, fontWeight: '700' },
  urgencySub: { fontSize: 12 },
  modalActionRow: { flexDirection: 'row', gap: 12, marginTop: 22, marginBottom: 10 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  cancelBtnText: { fontWeight: '600' },
  confirmBtn: { flex: 2, padding: 14, borderRadius: 12, alignItems: 'center' },
  confirmBtnText: { fontWeight: '700', fontSize: 15 },
});