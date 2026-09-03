import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../../contexts/StoreContext';
import { useTheme } from '../../contexts/ThemeContext';

export default function SellerOrdersScreen() {
  const { orders } = useStore();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Pronto':
        return { bg: '#DCFCE7', text: '#16A34A', label: 'PRONTO PARA RETIRAR ✓' };
      case 'Em Separação':
        return { bg: '#FEF3C7', text: '#D97706', label: 'SEPARANDO NO ESTOQUE ⏳' };
      default:
        return { bg: colors.chip, text: colors.primary, label: 'AGUARDANDO ESTOQUISTA' };
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingBottom: insets.bottom + 10 }]}>
      <View style={styles.headerInfo}>
        <Text style={[styles.screenTitle, { color: colors.text }]}>Meus Pedidos em Andamento</Text>
        <Text style={[styles.screenSubtitle, { color: colors.subText }]}>
          Acompanhe o status das peças solicitadas para os clientes
        </Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={{ fontSize: 44, marginBottom: 8 }}>🛍️</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Nenhum pedido solicitado</Text>
            <Text style={[styles.emptySub, { color: colors.subText }]}>
              Vá ao catálogo e solicite peças aos estoquistas usando os cards.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const statusConfig = getStatusStyle(item.status);

          return (
            <View
              style={[
                styles.orderCard,
                {
                  backgroundColor: colors.card,
                  borderColor: item.status === 'Pronto' ? '#16A34A' : item.isUrgent ? colors.danger : colors.border,
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

                {item.isUrgent && (
                  <View style={[styles.urgentBadge, { backgroundColor: colors.dangerSurface }]}>
                    <Text style={[styles.urgentBadgeText, { color: colors.danger }]}>URGENTE</Text>
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

              <View style={[styles.statusBanner, { backgroundColor: statusConfig.bg }]}>
                <Text style={[styles.statusBannerText, { color: statusConfig.text }]}>
                  {statusConfig.label}
                </Text>
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
  headerInfo: { paddingHorizontal: 16, paddingTop: 14 },
  screenTitle: { fontSize: 20, fontWeight: '800' },
  screenSubtitle: { fontSize: 13, marginTop: 2 },
  orderCard: { borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1.5, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderCode: { fontSize: 11, fontWeight: '700' },
  orderProduct: { fontSize: 16, fontWeight: '800', marginTop: 2 },
  urgentBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  urgentBadgeText: { fontSize: 10, fontWeight: '800' },
  specsRow: { flexDirection: 'row', justifyContent: 'space-around', padding: 10, borderRadius: 8, marginVertical: 12 },
  specText: { fontSize: 13 },
  statusBanner: { paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  statusBannerText: { fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  emptyContainer: { alignItems: 'center', marginTop: 80, paddingHorizontal: 20 },
  emptyTitle: { fontSize: 17, fontWeight: '700' },
  emptySub: { fontSize: 13, textAlign: 'center', marginTop: 6, lineHeight: 18 },
});