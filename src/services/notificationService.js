import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configura o comportamento da notificação na tela
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return false;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Conexão Estoque',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2563EB',
      });
    }

    return true;
  } catch (error) {
    // Evita que o app quebre no Expo Go
    console.log('Aviso de Notificações no Expo Go:', error.message);
    return false;
  }
}

// Notificação local para alertas imediatos
export async function sendLocalNotification({ title, body }) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
      },
      trigger: null, // Dispara imediatamente
    });
  } catch (error) {
    console.log('Erro ao disparar notificação local:', error.message);
  }
}