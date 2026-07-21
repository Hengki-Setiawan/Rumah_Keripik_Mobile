import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { usePushNotifications } from '../src/hooks/useNotifications';
import { OfflineBanner } from '../src/components/OfflineBanner';

function PushRegistrar() {
  usePushNotifications();
  return null;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <OfflineBanner />
      <PushRegistrar />
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
