import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configura como a notificação deve se comportar quando o app estiver em primeiro plano
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Solicita permissão do sistema operacional (Android 13+ exige permissão explícita)
export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Pedidos e Estoque',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2563EB',
      sound: 'default',
    });

    await Notifications.setNotificationChannelAsync('urgent', {
      name: 'Pedidos Urgentes',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 500, 200, 500],
      lightColor: '#EF4444',
      sound: 'default',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Permissão para notificações não foi concedida.');
      return null;
    }

    try {
      token = (await Notifications.getExpoPushTokenAsync()).data;
    } catch (e) {
      console.log('Não foi possível obter push token:', e.message);
    }
  }

  return token;
}

// Dispara uma notificação nativa imediata no topo do celular
export async function triggerDeviceNotification({ title, body, isUrgent = false }) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: 'default',
      priority: isUrgent
        ? Notifications.AndroidNotificationPriority.MAX
        : Notifications.AndroidNotificationPriority.HIGH,
      channelId: isUrgent ? 'urgent' : 'default',
    },
    trigger: null, // dispara imediatamente
  });
}