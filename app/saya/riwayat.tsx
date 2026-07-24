import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Package, Clock, CheckCircle2, XCircle, RefreshCw } from 'lucide-react-native';
import { colors, spacing, borderRadius } from '../../src/theme';
import { formatRupiah } from '../../src/lib/utils';
import { apiFetch } from '../../src/lib/api-client';

interface OrderItem {
  idTransaksi: string;
  kodePesanan: string | null;
  totalBayar: number;
  statusPembayaran: string;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string | null;
  namaPenerima: string | null;
  waktuSimpan: string;
}

const FILTERS = [
  { key: 'all', label: 'Semua' },
  { key: 'active', label: 'Diproses' },
  { key: 'completed', label: 'Selesai' },
  { key: 'cancelled', label: 'Dibatalkan' },
];

function matchesFilter(order: OrderItem, filter: string): boolean {
  const status = (order.orderStatus || '').toLowerCase();
  switch (filter) {
    case 'active': return !['completed', 'cancelled', 'delivered', 'terkirim', 'gagal'].includes(status);
    case 'completed': return ['completed', 'delivered', 'terkirim'].includes(status);
    case 'cancelled': return ['cancelled', 'gagal', 'expired'].includes(status);
    default: return true;
  }
}

export default function RiwayatScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  const load = useCallback(async () => {
    const res = await apiFetch<{ orders: OrderItem[] }>('/api/mobile/orders');
    if (res.ok && res.data) setOrders(res.data.orders);
  }, []);

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const filtered = orders.filter((o) => matchesFilter(o, filter));

  function statusColor(status: string) {
    const s = (status || '').toLowerCase();
    if (['completed', 'delivered', 'terkirim', 'lunas'].includes(s)) return '#16a34a';
    if (['cancelled', 'gagal', 'expired', 'dibatalkan'].includes(s)) return '#dc2626';
    if (['shipping', 'dalam_pengiriman'].includes(s)) return '#c55a2b';
    return '#d97706';
  }

  function statusIcon(status: string) {
    const s = (status || '').toLowerCase();
    if (['completed', 'delivered', 'terkirim', 'lunas'].includes(s)) return <CheckCircle2 size={16} color="#16a34a" />;
    if (['cancelled', 'gagal', 'expired', 'dibatalkan'].includes(s)) return <XCircle size={16} color="#dc2626" />;
    return <Clock size={16} color="#d97706" />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity key={f.key} onPress={() => setFilter(f.key)}
            style={[styles.filterBtn, filter === f.key && styles.filterBtnActive]}>
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.idTransaksi}
          contentContainerStyle={{ padding: spacing.md, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.accent]} />}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 60 }}>
              <Package size={48} color="#ccc" />
              <Text style={{ color: '#999', marginTop: 12, fontSize: 14 }}>Belum ada pesanan</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card}
              onPress={() => router.push(`/lacak/${item.idTransaksi}`)}>
              <View style={styles.cardHeader}>
                <View style={styles.codeRow}>
                  {statusIcon(item.orderStatus)}
                  <Text style={styles.code}>{item.kodePesanan || item.idTransaksi}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: statusColor(item.orderStatus) + '20' }]}>
                  <Text style={[styles.badgeText, { color: statusColor(item.orderStatus) }]}>
                    {item.orderStatus || item.statusPembayaran}
                  </Text>
                </View>
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.total}>{formatRupiah(item.totalBayar)}</Text>
                <Text style={styles.date}>
                  {item.waktuSimpan ? new Date(item.waktuSimpan).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                </Text>
              </View>
              {item.paymentMethod && (
                <Text style={styles.paymentMethod}>{item.paymentMethod}</Text>
              )}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#faf6ef' },
  filterRow: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, gap: 8, backgroundColor: '#fff' },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#f0dfca' },
  filterBtnActive: { backgroundColor: '#c55a2b' },
  filterText: { fontSize: 12, fontWeight: '600', color: '#666' },
  filterTextActive: { color: '#fff' },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#e5dcc9' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  codeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  code: { fontSize: 13, fontWeight: '700', color: '#333' },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  badgeText: { fontSize: 10, fontWeight: '600' },
  cardBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  total: { fontSize: 16, fontWeight: '700', color: '#c55a2b' },
  date: { fontSize: 11, color: '#888' },
  paymentMethod: { fontSize: 11, color: '#999', marginTop: 4 },
});
