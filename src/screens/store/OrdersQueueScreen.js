import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../../contexts/StoreContext';
import { useTheme } from '../../contexts/ThemeContext';

export default function OrdersQueueScreen() {
  const { orders, updateOrderStatus } = useStore();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  
  const [activeTab, setActiveTab] = useState('Fila Ativa');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1200);
  }, []);

  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'Histórico') {
      return o.status === 'Pronto' || o.status === 'Entregue';
    }
    if (activeTab === 'Urgentes') {
      return o.isUrgent && o.status !== 'Pronto' && o.status !== 'Entregue';
    }
    return o.status === 'Pendente' || o.status === 'Em Separação';
  });

  const handleFinishOrder = (orderId) => {
    updateOrderStatus(orderId, 'Pronto');
    Alert.alert('Pedido Pronto!', 'A peça foi marcada como pronta e uma notificação foi disparada ao vendedor.');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingBottom: insets.bottom + 10 }]}>
      <View style={styles.filterRow}>
        {['Fila Ativa', 'Urgentes', 'Histórico'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.filterTab,
              { backgroundColor: colors.card, borderColor: colors.border },
              activeTab === tab && { backgroundColor: colors.primary, borderColor: colors.primary },
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.filterTabText,
                { color: colors.text },
                activeTab === tab && { color: colors.primaryText, fontWeight: '700' },
              ]}
            >
              {tab === 'Urgentes' ? '🚨 Urgentes' : tab === 'Histórico' ? '📦 Concluídos' : '⚡ Fila Ativa'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={{ fontSize: 44, marginBottom: 8 }}>
              {activeTab === 'Histórico' ? '📂' : '✨'}
            </Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {activeTab === 'Histórico' ? 'Nenhum pedido concluído ainda' : 'Fila de separação vazia!'}
            </Text>
            <Text style={[styles.emptySub, { color: colors.subText }]}>
              {activeTab === 'Histórico'
                ? 'Os pedidos finalizados aparecerão arquivados aqui.'
                : 'Todos os pedidos foram atendidos e despachados.'}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const isPending = item.status === 'Pendente';
          const isSeparating = item.status === 'Em Separação';
          const isFinished = item.status === 'Pronto' || item.status === 'Entregue';

          return (
            <View
              style={[
                styles.orderCard,
                {
                  backgroundColor: colors.card,
                  borderColor: item.isUrgent && !isFinished ? colors.danger : colors.border,
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <View>
                  <Text style={[styles.orderCode, { color: colors.subText }]}>
                    {item.id} • {item.createdAt}
                  </Text>
                  <Text style={[styles.orderProduct, { color: colors.text }]}>{item.productTitle}</Text>
                </View>

                {item.isUrgent && !isFinished && (
                  <View style={[styles.urgentBadge, { backgroundColor: colors.dangerSurface }]}>
                    <Text style={[styles.urgentBadgeText, { color: colors.danger }]}>URGENTE</Text>
                  </View>
                )}

                {isFinished && (
                  <View style={[styles.doneBadge, { backgroundColor: '#DCFCE7' }]}>
                    <Text style={styles.doneBadgeText}>CONCLUÍDO ✓</Text>
                  </View>
                )}
              </View>

              <View style={[styles.specsRow, { backgroundColor: colors.chip }]}>
                <Text style={[styles.specText, { color: colors.text }]}>
                  Tam: <Text style={{ fontWeight: '800' }}>{item.size}</Text>
                </Text>
                <Text style={[styles.specText, { color: colors.text }]}>
                  Cor: <Text style={{ fontWeight: '800' }}>{item.color}</Text>
                </Text>
                <Text style={[styles.specText, { color: colors.text }]}>
                  Qtd: <Text style={{ fontWeight: '800' }}>{item.quantity} un</Text>
                </Text>
              </View>

              <Text style={[styles.requestedByText, { color: colors.subText }]}>
                Solicitante: <Text style={{ color: colors.text, fontWeight: '600' }}>{item.requestedBy?.name}</Text> ({item.requestedBy?.role})
              </Text>

              <View style={styles.actionControls}>
                <View style={[styles.statusPill, { backgroundColor: colors.chip }]}>
                  <Text style={[styles.statusText, { color: isFinished ? '#16A34A' : colors.primary }]}>
                    {item.status}
                  </Text>
                </View>

                <View style={styles.statusButtons}>
                  {isPending && (
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                      onPress={() => updateOrderStatus(item.id, 'Em Separação')}
                    >
                      <Text style={[styles.actionBtnText, { color: colors.primaryText }]}>Iniciar Separação</Text>
                    </TouchableOpacity>
                  )}

                  {isSeparating && (
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: '#16A34A' }]}
                      onPress={() => handleFinishOrder(item.id)}
                    >
                      <Text style={[styles.actionBtnText, { color: '#FFF' }]}>Finalizar (Pronto) ✓</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 12, gap: 8 },
  filterTab: { flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  filterTabText: { fontSize: 13, fontWeight: '600' },
  orderCard: { borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderCode: { fontSize: 11, fontWeight: '700' },
  orderProduct: { fontSize: 16, fontWeight: '800', marginTop: 2 },
  urgentBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  urgentBadgeText: { fontSize: 10, fontWeight: '800' },
  doneBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  doneBadgeText: { color: '#16A34A', fontSize: 10, fontWeight: '800' },
  specsRow: { flexDirection: 'row', justifyContent: 'space-around', padding: 10, borderRadius: 8, marginVertical: 12 },
  specText: { fontSize: 13 },
  requestedByText: { fontSize: 12, marginBottom: 12 },
  actionControls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusPill: { paddingVertical: 5, paddingHorizontal: 12, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '700' },
  statusButtons: { flexDirection: 'row', gap: 6 },
  actionBtn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 },
  actionBtnText: { fontSize: 12, fontWeight: '700' },
  emptyContainer: { alignItems: 'center', marginTop: 80, paddingHorizontal: 20 },
  emptyTitle: { fontSize: 17, fontWeight: '700' },
  emptySub: { fontSize: 13, textAlign: 'center', marginTop: 6, lineHeight: 18 },
});