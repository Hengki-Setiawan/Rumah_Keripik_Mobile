// @ts-nocheck
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export type PushTokenState = {
  token: string | null;
  registered: boolean;
  error: string | null;
};

export function usePushNotifications() {
  const [state, setState] = useState<PushTokenState>({
    token: null,
    registered: false,
    error: null,
  });
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    async function register() {
      if (!Device.isDevice) return;

      try {
        const permResult = await Notifications.requestPermissionsAsync();
        const status = permResult?.status;
        if (status !== 'granted') return;

        const tokenData = await Notifications.getExpoPushTokenAsync();
        setState({ token: tokenData.data, registered: true, error: null });
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
    responseListener.current = Notifications.addNotificationResponseReceivedListener(() => {});

    return () => {
      if (notificationListener.current) notificationListener.current.remove();
      if (responseListener.current) responseListener.current.remove();
    };
  }, []);

  return state;
}
