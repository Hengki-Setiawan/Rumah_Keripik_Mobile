import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { colors, borderRadius } from '../../src/theme';
import { formatRupiah } from '../../src/lib/utils';
import * as api from '../../src/lib/api-client';
import type { OrderTrackResponse } from '../../src/lib/types';

export default function LacakScreen() {
  const [code, setCode] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<OrderTrackResponse | null>(null);

  async function handleTrack() {
    if (!code.trim()) {
      setError('Masukkan kode pesanan');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await api.trackOrder(code.trim(), phone.trim() || undefined);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Pesanan tidak ditemukan');
    } finally {
      setLoading(false);
    }
  }

  function statusColor(status: string) {
    switch (status) {
      case 'paid': case 'settlement': case 'completed': case 'shipping': return '#16a34a';
      case 'pending': case 'waiting_payment': case 'processing': return '#c55a2b';
      case 'cancelled': case 'expired': return '#dc2626';
      default: return colors.textSecondary;
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.searchCard}>
        <Text style={styles.title}>Lacak Pesanan</Text>
        <Text style={styles.subtitle}>
          Masukkan kode pesanan untuk melihat status terbaru.
        </Text>
        <TextInput
          style={styles.input}
          value={code}
          onChangeText={(t) => { setCode(t); setError(''); }}
          placeholder="Kode pesanan (contoh: RK-123)"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="characters"
        />
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="No. WhatsApp (opsional, untuk verifikasi)"
          keyboardType="phone-pad"
          placeholderTextColor={colors.textMuted}
        />
        <TouchableOpacity
          style={[styles.trackBtn, (!code.trim() || loading) && styles.btnDisabled]}
          onPress={handleTrack}
          disabled={!code.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={styles.trackBtnText}>Lacak</Text>
          )}
        </TouchableOpacity>
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>

      {result && (
        <View style={styles.resultCard}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderCode}>
              {result.order.kode_pesanan || result.order.id_transaksi}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColor(result.order.order_status) + '20' }]}>
              <Text style={[styles.statusText, { color: statusColor(result.order.order_status) }]}>
                {result.order.order_status}
              </Text>
            </View>
          </View>

          <View style={styles.detailSection}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Pembayaran</Text>
              <Text style={[styles.detailValue, { color: statusColor(result.order.payment_status) }]}>
                {result.order.payment_status}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Metode</Text>
              <Text style={styles.detailValue}>{result.order.payment_method || '-'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Total</Text>
              <Text style={[styles.detailValue, styles.totalAmount]}>
                {formatRupiah(result.order.total_bayar)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Penerima</Text>
              <Text style={styles.detailValue}>{result.order.nama_penerima || '-'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Alamat</Text>
              <Text style={[styles.detailValue, { flex: 1 }]}>{result.order.alamat_penerima || '-'}</Text>
            </View>
          </View>

          {result.items && result.items.length > 0 && (
            <View style={styles.itemsSection}>
              <Text style={styles.sectionTitle}>Pesanan</Text>
              {result.items.map((item, i) => (
                <View key={i} style={styles.itemRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName}>{item.nama_produk || 'Produk'}</Text>
                    <Text style={styles.itemQty}>{item.qty} x {formatRupiah(item.harga)}</Text>
                  </View>
                  <Text style={styles.itemSubtotal}>{formatRupiah(item.subtotal)}</Text>
                </View>
              ))}
            </View>
          )}

          {result.events && result.events.length > 0 && (
            <View style={styles.eventsSection}>
              <Text style={styles.sectionTitle}>Riwayat Status</Text>
              {result.events.map((event, i) => (
                <View key={event.id || i} style={styles.eventRow}>
                  <View style={styles.eventDot} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.eventType}>{event.event_type}</Text>
                    {event.event_data && (
                      <Text style={styles.eventData}>{event.event_data}</Text>
                    )}
                    <Text style={styles.eventDate}>
                      {new Date(event.created_at).toLocaleString('id-ID')}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  searchCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 20,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.text,
  },
  trackBtn: {
    borderRadius: 999,
    backgroundColor: colors.accent,
    paddingVertical: 14,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  btnDisabled: { opacity: 0.5 },
  trackBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  errorText: {
    fontSize: 13,
    color: colors.error,
    textAlign: 'center',
  },
  resultCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 20,
    gap: 16,
  },
  orderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderCode: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  detailSection: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    width: 90,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
    textAlign: 'right',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.accent,
  },
  itemsSection: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
  },
  itemQty: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  itemSubtotal: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  eventsSection: {
    gap: 8,
  },
  eventRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  eventDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
    marginTop: 6,
  },
  eventType: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
  },
  eventData: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  eventDate: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
});
