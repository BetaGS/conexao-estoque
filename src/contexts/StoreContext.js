import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { api, socket } from '../services/api';
import { useAppNotification } from './NotificationContext';

const StoreContext = createContext({});

export function StoreProvider({ children }) {
  const { showNotification } = useAppNotification();

  // Estados principais
  const [store, setStore] = useState(null);
  const [userRoleInStore, setUserRoleInStore] = useState(null);
  const [membershipStatus, setMembershipStatus] = useState(null); // 'approved' | 'pending'
  const [employees, setEmployees] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  // Limpa completamente os dados de loja ao deslogar
  const resetStoreState = useCallback(() => {
    setStore(null);
    setUserRoleInStore(null);
    setMembershipStatus(null);
    setEmployees([]);
    setPendingRequests([]);
    setProducts([]);
    setOrders([]);
    if (socket.connected) {
      socket.disconnect();
    }
  }, []);

  // 1. Busca inicial de produtos, pedidos e equipe da loja
  const fetchStoreData = useCallback(async (storeId, isManager = false) => {
    if (!storeId) return;
    try {
      const [prodRes, ordersRes] = await Promise.all([
        api.get(`/products/${storeId}`),
        api.get(`/orders/${storeId}`),
      ]);
      setProducts(prodRes.data || []);
      setOrders(ordersRes.data || []);

      if (isManager) {
        const membersRes = await api.get(`/stores/${storeId}/members`);
        setEmployees(membersRes.data.activeEmployees || []);
        setPendingRequests(membersRes.data.pendingRequests || []);
      }
    } catch (err) {
      console.log('Erro ao carregar dados da loja:', err?.response?.data?.error || err.message);
    }
  }, []);

  // 2. Hidratação da loja no Login (Restaura loja e papel salvos no banco)
  const setInitialStoreData = useCallback(({ store: initialStore, role, membershipStatus: status }) => {
    if (initialStore) {
      setStore(initialStore);
      setUserRoleInStore(role || 'Gerente');
      setMembershipStatus(status || 'approved');
      fetchStoreData(initialStore.id, role === 'Gerente');
    } else {
      resetStoreState();
    }
  }, [fetchStoreData, resetStoreState]);

  // 3. Entra diretamente em uma loja que o usuário já gerencia
  const selectExistingStore = async (selectedStore) => {
    try {
      setStore(selectedStore);
      setUserRoleInStore('Gerente');
      setMembershipStatus('approved');
      await fetchStoreData(selectedStore.id, true);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao acessar a loja.',
      };
    }
  };

  // 4. WebSocket: Escuta pedidos e status em tempo real da loja
  useEffect(() => {
    if (store?.id && membershipStatus === 'approved') {
      socket.connect();
      socket.emit('entrar_loja', store.id);

      const handleNewOrder = (newOrder) => {
        setOrders((prev) => {
          if (prev.some((o) => o.id === newOrder.id)) return prev;
          return [newOrder, ...prev];
        });

        showNotification({
          title: newOrder.isUrgent ? '🚨 NOVO PEDIDO URGENTE!' : '📦 Novo Pedido Recebido',
          body: `${newOrder.quantity}x ${newOrder.productTitle} (${newOrder.color} - ${newOrder.size}) por ${newOrder.requestedBy?.nickname || 'Vendedor'}.`,
          isUrgent: Boolean(newOrder.isUrgent),
        });
      };

      const handleStatusUpdate = (updatedOrder) => {
        setOrders((prev) =>
          prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
        );

        if (updatedOrder.status === 'Pronto') {
          showNotification({
            title: '✨ Peça Pronta para Retirada!',
            body: `O pedido #${updatedOrder.id} (${updatedOrder.productTitle}) está pronto no balcão do estoque.`,
            isUrgent: false,
          });
        }
      };

      socket.on('novo_pedido', handleNewOrder);
      socket.on('status_pedido_atualizado', handleStatusUpdate);

      return () => {
        socket.off('novo_pedido', handleNewOrder);
        socket.off('status_pedido_atualizado', handleStatusUpdate);
        socket.disconnect();
      };
    }
  }, [store?.id, membershipStatus, showNotification]);

  // 5. Criar Loja
  const createStore = async ({ name, allowedSizes }) => {
    try {
      const res = await api.post('/stores', { name, allowedSizes });
      const createdStore = res.data.store;
      setStore(createdStore);
      setUserRoleInStore(res.data.role);
      setMembershipStatus(res.data.membershipStatus);
      await fetchStoreData(createdStore.id, true);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao criar loja.',
      };
    }
  };

  // 6. Solicitar entrada em loja existente
  const requestJoinStore = async (code, requestedRole = 'Vendedor') => {
    try {
      const res = await api.post('/stores/join', { code, requestedRole });
      setStore(res.data.store);
      setUserRoleInStore(res.data.role);
      setMembershipStatus(res.data.membershipStatus);
      return { success: true, message: res.data.message };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao solicitar entrada na loja.',
      };
    }
  };

  // Cancelar solicitação pendente
  const cancelJoinRequest = () => {
    resetStoreState();
  };

  // 7. Gerenciamento de Membros (Gerente)
  const approveMember = async (membershipId, finalRole) => {
    try {
      await api.patch(`/stores/members/${membershipId}`, { action: 'approve', role: finalRole });
      if (store?.id) await fetchStoreData(store.id, true);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao aprovar colaborador.',
      };
    }
  };

  const rejectMember = async (membershipId) => {
    try {
      await api.patch(`/stores/members/${membershipId}`, { action: 'reject' });
      if (store?.id) await fetchStoreData(store.id, true);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao recusar colaborador.',
      };
    }
  };

  // 8. Produtos (CRUD)
  const addProduct = async (productData) => {
    try {
      const res = await api.post('/products', {
        storeId: store?.id,
        ...productData,
      });
      setProducts((prev) => [res.data, ...prev]);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao criar produto.',
      };
    }
  };

  const updateProduct = async (id, updatedData) => {
    try {
      const res = await api.put(`/products/${id}`, updatedData);
      setProducts((prev) => prev.map((item) => (item.id === id ? res.data : item)));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao atualizar produto.',
      };
    }
  };

  const deleteProduct = async (id) => {
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((item) => item.id !== id));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao deletar produto.',
      };
    }
  };

  // 9. Pedidos
  const createOrder = async ({ product, color, size, quantity, isUrgent }) => {
    try {
      await api.post('/orders', {
        storeId: store?.id,
        productId: product.id,
        productTitle: product.title,
        color,
        size,
        quantity,
        isUrgent,
      });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao enviar pedido.',
      };
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? res.data : o)));
      return { success: true };
    } catch (error) {
      console.log('Erro ao atualizar status do pedido:', error?.response?.data?.error || error.message);
      return { success: false };
    }
  };

  // Alternador de papel para testes
  const switchRole = (newRole) => {
    setUserRoleInStore(newRole);
  };

  return (
    <StoreContext.Provider
      value={{
        store,
        userRoleInStore,
        membershipStatus,
        employees,
        pendingRequests,
        products,
        orders,
        fetchStoreData,
        createStore,
        requestJoinStore,
        selectExistingStore,
        cancelJoinRequest,
        approveMember,
        rejectMember,
        switchRole,
        addProduct,
        updateProduct,
        deleteProduct,
        createOrder,
        updateOrderStatus,
        resetStoreState,
        setInitialStoreData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);