import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../contexts/ThemeContext';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import CreateStoreScreen from '../screens/store/CreateStoreScreen';
import JoinStoreScreen from '../screens/store/JoinStoreScreen';
import ManageEmployeesScreen from '../screens/store/ManageEmployeesScreen';
import ProductCatalogScreen from '../screens/products/ProductCatalogScreen';
import CreateProductScreen from '../screens/products/CreateProductScreen';
import OrdersQueueScreen from '../screens/store/OrdersQueueScreen';
import SellerOrdersScreen from '../screens/seller/SellerOrdersScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MainTabs" component={ProductCatalogScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CreateStore" component={CreateStoreScreen} options={{ title: 'Criar Minha Loja' }} />
      <Stack.Screen name="JoinStore" component={JoinStoreScreen} options={{ title: 'Acessar Loja' }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Meu Perfil' }} />
      <Stack.Screen name="CreateProduct" component={CreateProductScreen} options={{ title: 'Criar Card de Produto' }} />
      <Stack.Screen name="ManageEmployees" component={ManageEmployeesScreen} options={{ title: 'Equipe e Permissões' }} />
      <Stack.Screen name="OrdersQueue" component={OrdersQueueScreen} options={{ title: 'Fila de Separação (Estoque)' }} />
      <Stack.Screen name="SellerOrders" component={SellerOrdersScreen} options={{ title: 'Meus Pedidos' }} />
    </Stack.Navigator>
  );
}