import React, { createContext, useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { registerForPushNotificationsAsync, triggerDeviceNotification } from '../services/notifications';

const NotificationContext = createContext({});

export function NotificationProvider({ children }) {
  const [banner, setBanner] = useState(null);
  const slideAnim = useState(new Animated.Value(-100))[0];

  useEffect(() => {
    // Solicita permissão ao carregar o app
    registerForPushNotificationsAsync();
  }, []);

  const showNotification = async ({ title, body, isUrgent = false }) => {
    // 1. Notificação nativa na barra de status do celular
    try {
      await triggerDeviceNotification({ title, body, isUrgent });
    } catch (err) {
      console.log('Erro ao disparar notificação nativa:', err.message);
    }

    // 2. Banner animado interno (in-app)
    setBanner({ title, body, isUrgent });
    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.delay(3500),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => setBanner(null));
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {banner && (
        <Animated.View
          style={[
            styles.bannerContainer,
            { transform: [{ translateY: slideAnim }] },
            banner.isUrgent ? styles.urgentBanner : styles.normalBanner,
          ]}
        >
          <Text style={styles.bannerTitle}>{banner.title}</Text>
          <Text style={styles.bannerBody} numberOfLines={2}>{banner.body}</Text>
        </Animated.View>
      )}
    </NotificationContext.Provider>
  );
}

export const useAppNotification = () => useContext(NotificationContext);

const styles = StyleSheet.create({
  bannerContainer: {
    position: 'absolute',
    top: 40,
    left: 16,
    right: 16,
    padding: 14,
    borderRadius: 14,
    elevation: 8,
    zIndex: 9999,
  },
  normalBanner: { backgroundColor: '#1E293B' },
  urgentBanner: { backgroundColor: '#DC2626' },
  bannerTitle: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  bannerBody: { color: '#E2E8F0', fontSize: 12, marginTop: 2 },
});