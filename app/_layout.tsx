import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="saya/index" options={{ headerShown: true, title: 'Pesanan Saya' }} />
        <Stack.Screen name="lacak/index" options={{ headerShown: true, title: 'Lacak Pesanan' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
