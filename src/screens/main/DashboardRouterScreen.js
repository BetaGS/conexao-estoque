import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useStore } from '../../contexts/StoreContext';
import { useTheme } from '../../contexts/ThemeContext';

// Importe as telas específicas de cada função
import ProductCatalogScreen from '../products/ProductCatalogScreen';
import OrdersQueueScreen from '../store/OrdersQueueScreen';
import ManageEmployeesScreen from '../store/ManageEmployeesScreen';
import JoinStoreScreen from '../store/JoinStoreScreen';

export default function DashboardRouterScreen({ navigation }) {
  const { store, userRoleInStore, membershipStatus } = useStore();
  const { colors } = useTheme();

  // 1. Se o usuário não tem loja vinculada ou saiu de uma loja:
  if (!store) {
    return <JoinStoreScreen navigation={navigation} />;
  }

  // 2. Se pediu para entrar na loja e ainda aguarda aprovação do gerente:
  if (membershipStatus === 'pending') {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // 3. Roteamento baseado na função (Role):
  // Estoquista -> Vai direto para a fila de separação de pedidos
  if (userRoleInStore === 'Estoquista') {
    return <OrdersQueueScreen navigation={navigation} />;
  }

  // Gerente -> Vê painel/gestão de equipe ou catálogo com controles administrativos
  if (userRoleInStore === 'Gerente') {
    return <ProductCatalogScreen navigation={navigation} isManager />;
  }

  // Vendedor (padrão) -> Abre catálogo para lançar pedidos
  return <ProductCatalogScreen navigation={navigation} />;
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});