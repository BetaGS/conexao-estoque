import React, { createContext, useContext, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const NotificationContext = createContext({});

export function NotificationProvider({ children }) {
  const [notification, setNotification] = useState(null);
  const translateY = useRef(new Animated.Value(-120)).current;
  const insets = useSafeAreaInsets();

  const showNotification = ({ title, body, isUrgent = false }) => {
    setNotification({ title, body, isUrgent });

    Animated.sequence([
      Animated.spring(translateY, {
        toValue: insets.top + 8,
        useNativeDriver: true,
        bounciness: 8,
      }),
      Animated.delay(3500),
      Animated.timing(translateY, {
        toValue: -120,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setNotification(null));
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notification && (
        <Animated.View
          style={[
            styles.bannerContainer,
            {
              transform: [{ translateY }],
              backgroundColor: notification.isUrgent ? '#DC2626' : '#0F172A',
            },
          ]}
        >
          <View style={styles.content}>
            <Text style={styles.title}>{notification.title}</Text>
            <Text style={styles.body}>{notification.body}</Text>
          </View>
        </Animated.View>
      )}
    </NotificationContext.Provider>
  );
}

export const useAppNotification = () => useContext(NotificationContext);

const styles = StyleSheet.create({
  bannerContainer: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    zIndex: 9999,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  content: { flexDirection: 'column' },
  title: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  body: { color: '#F1F5F9', fontSize: 12, marginTop: 3 },
});