import React, { createContext, useState, useContext } from 'react';
import { useAppNotification } from './NotificationContext';

const StoreContext = createContext({});

export function StoreProvider({ children }) {
  const { showNotification } = useAppNotification();

  const [store, setStore] = useState({ name: 'Conexão Matriz', code: 'LOJA-7731', allowedSizes: ['P', 'M', 'G'] });
  const [userRoleInStore, setUserRoleInStore] = useState('Gerente');
  const [membershipStatus, setMembershipStatus] = useState('approved');
  const [employees, setEmployees] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);

  const [products, setProducts] = useState([
    {
      id: 'demo_1',
      title: 'Camiseta Premium Oversized',
      sizes: ['P', 'M', 'G', 'GG'],
      variants: [
        { id: 'v1', colorName: 'Preto', imageUri: null },
        { id: 'v2', colorName: 'Branco', imageUri: null },
      ],
    },
  ]);

  const [orders, setOrders] = useState([]);

  const createStore = ({ name, allowedSizes }) => {
    const randomCode = `LOJA-${Math.floor(1000 + Math.random() * 9000)}`;
    setStore({
      id: String(Date.now()),
      name,
      code: randomCode,
      allowedSizes: allowedSizes || [],
    });
    setUserRoleInStore('Gerente');
    setMembershipStatus('approved');
  };

  const requestJoinStore = (code, user, requestedRole = 'Vendedor') => {
    setStore({
      id: 'store_matriz',
      name: 'Loja Conectada',
      code: code.trim().toUpperCase(),
      allowedSizes: ['P', 'M', 'G'],
    });
    setUserRoleInStore(requestedRole);
    setMembershipStatus('pending');
  };

  const cancelJoinRequest = () => {
    setStore(null);
    setUserRoleInStore(null);
    setMembershipStatus(null);
  };

  const switchRole = (newRole) => {
    setUserRoleInStore(newRole);
    setMembershipStatus('approved');
  };

  const addProduct = (productData) => {
    setProducts((prev) => [{ id: String(Date.now()), ...productData }, ...prev]);
  };

  const updateProduct = (id, updatedData) => {
    setProducts((prev) => prev.map((item) => (item.id === id ? { ...item, ...updatedData } : item)));
  };

  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((item) => item.id !== id));
  };

  const createOrder = ({ product, color, size, quantity, isUrgent, requestedBy }) => {
    const newOrder = {
      id: `PED-${Date.now().toString().slice(-4)}`,
      productId: product.id,
      productTitle: product.title,
      color,
      size,
      quantity: Number(quantity),
      isUrgent: Boolean(isUrgent),
      requestedBy,
      status: 'Pendente',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setOrders((prev) => [newOrder, ...prev]);

    showNotification({
      title: isUrgent ? '🚨 NOVO PEDIDO URGENTE!' : '📦 Novo Pedido Recebido',
      body: `${quantity}x ${product.title} (${color} - ${size}) solicitado por ${requestedBy?.name || 'Vendedor'}.`,
      isUrgent: Boolean(isUrgent),
    });
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          if (newStatus === 'Pronto') {
            showNotification({
              title: '✨ Peça Pronta para Retirada!',
              body: `O pedido #${order.id} (${order.productTitle}) foi separado e está no balcão.`,
            });
          }
          return { ...order, status: newStatus };
        }
        return order;
      })
    );
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
        createStore,
        requestJoinStore,
        cancelJoinRequest,
        switchRole,
        addProduct,
        updateProduct,
        deleteProduct,
        createOrder,
        updateOrderStatus,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);