import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../../contexts/StoreContext';
import { useTheme } from '../../contexts/ThemeContext';
import ProductCard from '../../components/ProductCard';
import LogoBox from '../../components/LogoBox';
import OrdersQueueScreen from '../store/OrdersQueueScreen';

export default function ProductCatalogScreen({ navigation }) {
  const {
    products,
    store,
    userRoleInStore,
    membershipStatus,
    cancelJoinRequest,
    switchRole,
    orders,
    pendingRequests,
  } = useStore();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  // Estado do Pull-to-Refresh
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simula a requisição de atualização para o Back-end
    setTimeout(() => {
      setRefreshing(false);
    }, 1200);
  }, []);

  const isManager = userRoleInStore === 'Gerente';
  const isSeller = userRoleInStore === 'Vendedor';
  const isStockman = userRoleInStore === 'Estoquista';

  const pendingOrdersCount = orders ? orders.filter((o) => o.status === 'Pendente').length : 0;
  const myReadyCount = orders ? orders.filter((o) => o.status === 'Pronto').length : 0;
  const pendingRequestsCount = pendingRequests ? pendingRequests.length : 0;

  if (!store) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            paddingTop: insets.top + 10,
            paddingBottom: insets.bottom + 16,
            justifyContent: 'space-between',
          },
        ]}
      >
        <View style={styles.topEmptyBar}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={{ fontSize: 18 }}>👤</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.noStoreWrapper}>
          <LogoBox size="large" />
          <Text style={[styles.noStoreTitle, { color: colors.text }]}>Bem-vindo ao Conexão Estoque</Text>
          <Text style={[styles.noStoreSubtitle, { color: colors.subText }]}>
            Você ainda não faz parte de nenhuma loja. Escolha uma das opções abaixo para começar:
          </Text>

          <View style={styles.noStoreActions}>
            <TouchableOpacity
              style={[styles.actionBtnPrimary, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('CreateStore')}
            >
              <Text style={styles.actionBtnEmoji}>🏬</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.actionBtnPrimaryTitle, { color: colors.primaryText }]}>Criar Minha Própria Loja</Text>
                <Text style={[styles.actionBtnPrimarySub, { color: '#DBEAFE' }]}>Você será o gerente geral e definirá a equipe</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtnSecondary, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => navigation.navigate('JoinStore')}
            >
              <Text style={styles.actionBtnEmoji}>🔑</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.actionBtnSecondaryTitle, { color: colors.text }]}>Entrar em uma Loja Existente</Text>
                <Text style={[styles.actionBtnSecondarySub, { color: colors.subText }]}>Conecte-se com o código fornecido pelo gerente</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 20 }} />
      </View>
    );
  }

  if (membershipStatus === 'pending') {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            paddingTop: insets.top + 20,
            paddingBottom: insets.bottom + 20,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 24,
          },
        ]}
      >
        <LogoBox size="large" />
        <Text style={[styles.noStoreTitle, { color: colors.text, marginTop: 18 }]}>Solicitação em Análise ⏳</Text>
        <Text style={[styles.noStoreSubtitle, { color: colors.subText, marginBottom: 24 }]}>
          Você solicitou acesso à loja com o cargo de{' '}
          <Text style={{ fontWeight: '700', color: colors.primary }}>{userRoleInStore}</Text>. Aguarde o Gerente
          autorizar seu perfil para começar a trabalhar.
        </Text>

        <TouchableOpacity
          style={[styles.actionBtnSecondary, { backgroundColor: colors.card, borderColor: colors.border, width: '100%', justifyContent: 'center' }]}
          onPress={cancelJoinRequest}
        >
          <Text style={{ color: colors.danger, fontWeight: '700', fontSize: 14 }}>Cancelar Solicitação</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + 8,
        },
      ]}
    >
      {/* Seletor de visualização */}
      <View style={[styles.roleSwitcherBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.roleSwitcherLabel, { color: colors.subText }]}>Simular Visão:</Text>
        <View style={styles.roleChips}>
          {['Gerente', 'Vendedor', 'Estoquista'].map((role) => (
            <TouchableOpacity
              key={role}
              style={[
                styles.roleChip,
                { backgroundColor: colors.chip, borderColor: colors.border },
                userRoleInStore === role && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
              onPress={() => switchRole(role)}
            >
              <Text
                style={[
                  styles.roleChipText,
                  { color: colors.text },
                  userRoleInStore === role && { color: colors.primaryText, fontWeight: '800' },
                ]}
              >
                {role}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Topo */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <Text style={styles.boxEmoji}>📦</Text>
          <View>
            <Text style={[styles.storeName, { color: colors.text }]}>{store?.name || 'Conexão Estoque'}</Text>
            <Text style={[styles.storeGrade, { color: colors.subText }]}>
              Cód: <Text style={{ fontWeight: '700', color: colors.primary }}>{store?.code}</Text> • ({userRoleInStore})
            </Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          {isSeller && (
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border, position: 'relative' }]}
              onPress={() => navigation.navigate('SellerOrders')}
            >
              <Text style={{ fontSize: 18 }}>🛍️</Text>
              {myReadyCount > 0 && (
                <View style={[styles.badge, { backgroundColor: '#16A34A' }]}>
                  <Text style={styles.badgeText}>{myReadyCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          {isManager && (
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border, position: 'relative' }]}
              onPress={() => navigation.navigate('OrdersQueue')}
            >
              <Text style={{ fontSize: 18 }}>📋</Text>
              {pendingOrdersCount > 0 && (
                <View style={[styles.badge, { backgroundColor: colors.danger }]}>
                  <Text style={styles.badgeText}>{pendingOrdersCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          {isManager && (
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border, position: 'relative' }]}
              onPress={() => navigation.navigate('ManageEmployees')}
            >
              <Text style={{ fontSize: 18 }}>👥</Text>
              {pendingRequestsCount > 0 && (
                <View style={[styles.badge, { backgroundColor: colors.danger }]}>
                  <Text style={styles.badgeText}>{pendingRequestsCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={{ fontSize: 18 }}>👤</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Conteúdo dinâmico por perfil */}
      {isStockman ? (
        <View style={{ flex: 1 }}>
          <View style={[styles.stockmanBanner, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.stockmanBannerTitle, { color: colors.text }]}>Painel de Separação do Estoque</Text>
            <Text style={[styles.stockmanBannerSub, { color: colors.subText }]}>
              Itens solicitados pelos vendedores e gerência em tempo real
            </Text>
          </View>
          <OrdersQueueScreen />
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              canEdit={isManager}
              onEdit={() => navigation.navigate('CreateProduct', { productToEdit: item })}
            />
          )}
          contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
          showsVerticalScrollIndicator={false}
          // Pull-to-Refresh com suporte ao Dark/Light mode
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={{ fontSize: 48, marginBottom: 8 }}>📦</Text>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Nenhum produto cadastrado</Text>
              <Text style={[styles.emptySub, { color: colors.subText }]}>
                {isManager
                  ? 'Toque no botão abaixo para criar cards com tamanhos e cores.'
                  : 'Aguarde o gerente cadastrar os produtos.'}
              </Text>
            </View>
          }
        />
      )}

      {isManager && !isStockman && (
        <TouchableOpacity
          style={[
            styles.fab,
            {
              backgroundColor: colors.primary,
              bottom: insets.bottom + 16,
            },
          ]}
          onPress={() => navigation.navigate('CreateProduct')}
        >
          <Text style={[styles.fabText, { color: colors.primaryText }]}>+ Novo Card</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
  topEmptyBar: { alignItems: 'flex-end', width: '100%' },
  noStoreWrapper: { alignItems: 'center', paddingHorizontal: 12 },
  noStoreTitle: { fontSize: 24, fontWeight: '800', textAlign: 'center' },
  noStoreSubtitle: { fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 20, marginBottom: 28 },
  noStoreActions: { width: '100%', gap: 14 },
  actionBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    gap: 14,
    elevation: 3,
  },
  actionBtnPrimaryTitle: { fontSize: 16, fontWeight: '700' },
  actionBtnPrimarySub: { fontSize: 12, marginTop: 2 },
  actionBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    gap: 14,
  },
  actionBtnSecondaryTitle: { fontSize: 16, fontWeight: '700' },
  actionBtnSecondarySub: { fontSize: 12, marginTop: 2 },
  actionBtnEmoji: { fontSize: 28 },
  roleSwitcherBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  roleSwitcherLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginLeft: 4 },
  roleChips: { flexDirection: 'row', gap: 6 },
  roleChip: { paddingVertical: 5, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1 },
  roleChipText: { fontSize: 11, fontWeight: '600' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  boxEmoji: { fontSize: 32 },
  storeName: { fontSize: 18, fontWeight: '800' },
  storeGrade: { fontSize: 12, marginTop: 1 },
  actionButtons: { flexDirection: 'row', gap: 8 },
  iconButton: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
  stockmanBanner: { padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 8 },
  stockmanBannerTitle: { fontSize: 16, fontWeight: '800' },
  stockmanBannerSub: { fontSize: 12, marginTop: 2 },
  emptyBox: { alignItems: 'center', marginTop: 80, paddingHorizontal: 20 },
  emptyTitle: { fontSize: 17, fontWeight: '700' },
  emptySub: { fontSize: 13, textAlign: 'center', marginTop: 6, lineHeight: 18 },
  fab: {
    position: 'absolute',
    right: 20,
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 30,
    elevation: 5,
  },
  fabText: { fontWeight: '700', fontSize: 15 },
});