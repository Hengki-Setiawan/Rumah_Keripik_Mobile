import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, borderRadius } from '../../../theme';
import type { LocationPickerComponent } from '../../../lib/types';

export function LocationPickerCard({
  component,
  onSend,
}: {
  component: LocationPickerComponent;
  onSend: (text: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  async function useCurrentLocation() {
    setLoading(true);
    onSend('Gunakan lokasi saya saat ini');
    setLoading(false);
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Pilih lokasi</Text>
      <View style={styles.optionRow}>
        <TouchableOpacity
          style={[styles.option, loading && styles.optionDisabled]}
          onPress={useCurrentLocation}
          disabled={loading}
        >
          <Text style={styles.optionIcon}>📍</Text>
          <Text style={styles.optionLabel}>Pakai lokasi saya</Text>
          <Text style={styles.optionDesc}>GPS otomatis</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.option}
          onPress={() => onSend('Input alamat manual')}
        >
          <Text style={styles.optionIcon}>✏️</Text>
          <Text style={styles.optionLabel}>Input manual</Text>
          <Text style={styles.optionDesc}>Ketik alamat</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,250,244,0.9)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginVertical: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  option: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ecd8bf',
    backgroundColor: colors.white,
    padding: 14,
    alignItems: 'center',
    gap: 4,
  },
  optionDisabled: { opacity: 0.5 },
  optionIcon: { fontSize: 24 },
  optionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  optionDesc: {
    fontSize: 11,
    color: colors.textSecondary,
  },
});
