import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { usePushNotifications } from '../src/hooks/useNotifications';
import { OfflineBanner } from '../src/components/OfflineBanner';
import { CartProvider } from '../src/lib/cart-context';

function PushRegistrar() {
  usePushNotifications();
  return null;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <CartProvider>
        <OfflineBanner />
        <PushRegistrar />
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen
            name="keranjang"
            options={{
              headerShown: true,
              title: 'Keranjang Belanja',
              headerStyle: { backgroundColor: '#fffbeb' },
              headerTintColor: '#92400e',
            }}
          />
          <Stack.Screen
            name="saya/index"
            options={{
              headerShown: true,
              title: 'Akun & Pesanan Saya',
              headerStyle: { backgroundColor: '#fffbeb' },
              headerTintColor: '#92400e',
            }}
          />
          <Stack.Screen
            name="lacak/index"
            options={{
              headerShown: true,
              title: 'Lacak Pesanan',
              headerStyle: { backgroundColor: '#fffbeb' },
              headerTintColor: '#92400e',
            }}
          />
          <Stack.Screen
            name="lacak/[id]"
            options={{
              headerShown: true,
              title: 'Detail Status Pesanan',
              headerStyle: { backgroundColor: '#fffbeb' },
              headerTintColor: '#92400e',
            }}
          />
        </Stack>
      </CartProvider>
    </SafeAreaProvider>
  );
}
