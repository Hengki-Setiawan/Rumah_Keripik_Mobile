import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../src/theme';

export default function PesananSayaScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pesanan Saya</Text>
      <Text style={styles.subtitle}>
        Riwayat pemesanan akan muncul di sini.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
