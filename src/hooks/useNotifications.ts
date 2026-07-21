import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
const API_BASE = 'https://rumah-keripik.vercel.app';
const COOKIE_KEY = 'rk_session_cookie';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export type PushTokenState = {
  token: string | null;
  registered: boolean;
  error: string | null;
};

async function registerTokenOnServer(token: string) {
  try {
    const storedCookie = await SecureStore.getItemAsync(COOKIE_KEY);
    const orderSessionId = storedCookie ? storedCookie.split('=')[1] || '' : '';
    await fetch(`${API_BASE}/api/public/push-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, platform: Platform.OS, orderSessionId }),
    });
  } catch {
    // silent fail - server registration is optional
  }
}

export function usePushNotifications() {
  const [state, setState] = useState<PushTokenState>({
    token: null,
    registered: false,
    error: null,
  });
  const notificationListener = useRef<{ remove: () => void }>();
  const responseListener = useRef<{ remove: () => void }>();

  useEffect(() => {
    async function register() {
      if (!Device.isDevice) return;

      try {
        const permResult = await Notifications.requestPermissionsAsync();
        const status = permResult?.status;
        if (status !== 'granted') return;

        const tokenData = await Notifications.getExpoPushTokenAsync();
        setState({ token: tokenData.data, registered: true, error: null });
        await registerTokenOnServer(tokenData.data);
      } catch {
        // silent fail
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Pesanan',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
        });
      }
    }

    register();

    notificationListener.current = Notifications.addNotificationReceivedListener(() => {});
    responseListener.current = Notifications.addNotificationResponseReceivedListener((res) => {
      const data = res.notification.request.content.data;
      if (data?.kodePesanan) {
        router.push(`/lacak?code=${data.kodePesanan}`);
      } else if (data?.orderId) {
        router.push('/saya');
      }
    });

    return () => {
      if (notificationListener.current) notificationListener.current.remove();
      if (responseListener.current) responseListener.current.remove();
    };
  }, []);

  return state;
}
