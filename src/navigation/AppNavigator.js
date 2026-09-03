import React from 'react';
import { View, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../contexts/ThemeContext';
import { useStore } from '../contexts/StoreContext';

// Telas de Autenticação
import * as LoginMod from '../screens/auth/LoginScreen';
import * as RegisterMod from '../screens/auth/RegisterScreen';

// Telas de Perfil e Loja
import * as ProfileMod from '../screens/profile/ProfileScreen';
import * as CreateStoreMod from '../screens/store/CreateStoreScreen';
import * as JoinStoreMod from '../screens/store/JoinStoreScreen';
import * as PendingApprovalMod from '../screens/store/PendingApprovalScreen';
import * as ManageEmployeesMod from '../screens/store/ManageEmployeesScreen';
import * as OrdersQueueMod from '../screens/store/OrdersQueueScreen';

// Telas de Produtos e Vendedor
import * as ProductCatalogMod from '../screens/products/ProductCatalogScreen';
import * as CreateProductMod from '../screens/products/CreateProductScreen';
import * as SellerOrdersMod from '../screens/seller/SellerOrdersScreen';

const Stack = createNativeStackNavigator();

function resolveScreen(moduleOrComponent, name) {
  const comp = moduleOrComponent?.default || moduleOrComponent;
  if (!comp || typeof comp !== 'function') {
    console.error(`⚠️ ATENÇÃO: O componente da tela "${name}" está 'undefined'. Verifique o export desse arquivo.`);
    return function FallbackScreen() {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#ff4444', textAlign: 'center' }}>
            Erro de Export/Import na tela: {name}
          </Text>
          <Text style={{ fontSize: 13, color: '#666', marginTop: 8, textAlign: 'center' }}>
            Verifique se o arquivo possui "export default function {name}()"
          </Text>
        </View>
      );
    };
  }
  return comp;
}

export default function AppNavigator() {
  const { colors } = useTheme();
  const { store, userRoleInStore, membershipStatus } = useStore();

  const LoginScreen = resolveScreen(LoginMod, 'LoginScreen');
  const RegisterScreen = resolveScreen(RegisterMod, 'RegisterScreen');
  const ProductCatalogScreen = resolveScreen(ProductCatalogMod, 'ProductCatalogScreen');
  const CreateStoreScreen = resolveScreen(CreateStoreMod, 'CreateStoreScreen');
  const JoinStoreScreen = resolveScreen(JoinStoreMod, 'JoinStoreScreen');
  const PendingApprovalScreen = resolveScreen(PendingApprovalMod, 'PendingApprovalScreen');
  const ProfileScreen = resolveScreen(ProfileMod, 'ProfileScreen');
  const CreateProductScreen = resolveScreen(CreateProductMod, 'CreateProductScreen');
  const ManageEmployeesScreen = resolveScreen(ManageEmployeesMod, 'ManageEmployeesScreen');
  const OrdersQueueScreen = resolveScreen(OrdersQueueMod, 'OrdersQueueScreen');
  const SellerOrdersScreen = resolveScreen(SellerOrdersMod, 'SellerOrdersScreen');

  // Direciona para a tela correta dependendo do vínculo e papel (Role) do usuário
  const RoleBasedMainScreen = (props) => {
    // 1. Sem loja vinculada
    if (!store) {
      return <JoinStoreScreen {...props} />;
    }

    // 2. Aguardando aprovação do gerente
    if (membershipStatus === 'pending') {
      return <PendingApprovalScreen {...props} />;
    }

    // 3. Papel de Estoquista
    if (userRoleInStore === 'Estoquista') {
      return <OrdersQueueScreen {...props} />;
    }

    // 4. Papel de Vendedor ou Gerente
    return <ProductCatalogScreen {...props} />;
  };

  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerStyle: { backgroundColor: colors?.card || '#ffffff' },
        headerTintColor: colors?.text || '#111827',
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors?.background || '#f3f4f6' },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MainTabs" component={RoleBasedMainScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CreateStore" component={CreateStoreScreen} options={{ title: 'Criar Minha Loja' }} />
      <Stack.Screen name="JoinStore" component={JoinStoreScreen} options={{ title: 'Acessar Loja' }} />
      <Stack.Screen name="PendingApproval" component={PendingApprovalScreen} options={{ title: 'Aguardando Aprovação' }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Meu Perfil' }} />
      <Stack.Screen name="CreateProduct" component={CreateProductScreen} options={{ title: 'Criar Card de Produto' }} />
      <Stack.Screen name="ManageEmployees" component={ManageEmployeesScreen} options={{ title: 'Equipe e Permissões' }} />
      <Stack.Screen name="OrdersQueue" component={OrdersQueueScreen} options={{ title: 'Fila de Separação (Estoque)' }} />
      <Stack.Screen name="SellerOrders" component={SellerOrdersScreen} options={{ title: 'Meus Pedidos' }} />
    </Stack.Navigator>
  );
}