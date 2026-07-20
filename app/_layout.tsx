import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { usePushNotifications } from '../src/hooks/useNotifications';

function NotificationRegistrar() {
  const { token, registered } = usePushNotifications();

  useEffect(() => {
    if (registered && token) {
      // Token siap dikirim ke server untuk push notification
      // TODO: Send token to API when we have the endpoint
    }
  }, [registered, token]);

  return null;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <NotificationRegistrar />
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen
          name="saya/index"
          options={{
            headerShown: true,
            title: 'Pesanan Saya',
            headerStyle: { backgroundColor: '#faf6ef' },
            headerTintColor: '#2f241c',
          }}
        />
        <Stack.Screen
          name="lacak/index"
          options={{
            headerShown: true,
            title: 'Lacak Pesanan',
            headerStyle: { backgroundColor: '#faf6ef' },
            headerTintColor: '#2f241c',
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
