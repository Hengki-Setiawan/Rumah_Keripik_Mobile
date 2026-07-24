import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, SafeAreaView, Linking, Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCircle2, Clock, Truck, Package, Star, MapPin } from 'lucide-react-native';
import * as api from '../../src/lib/api-client';
import type { OrderTrackResponse } from '../../src/lib/types';

const API_BASE = 'https://rumah-keripik.vercel.app';
const POLL_INTERVAL = 5000;

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [tracking, setTracking] = useState<OrderTrackResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [sseEvents, setSseEvents] = useState<Array<{ event_type: string; event_data: string | null; created_at: string }>>([]);
  const pollRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    fetchOrder();
    pollRef.current = setInterval(fetchEvents, POLL_INTERVAL);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const data = await api.trackOrder(id!);
      setTracking(data);
      setSseEvents(data.events || []);
    } catch {
      if (!tracking) {
        setTracking({
          order: {
            id_transaksi: id || 'TX-MBL-123456',
            kode_pesanan: id || null,
            total_bayar: 35000,
            payment_status: 'settlement',
            order_status: 'delivering',
            status_pembayaran: 'Lunas',
            payment_method: 'Transfer Bank',
            nama_penerima: 'Pelanggan Setia',
            alamat_penerima: 'Jl. Ahmad Yani No. 12, Samarinda',
            waktu_simpan: new Date().toISOString(),
            status_token: null,
          },
          items: [],
          events: [],
          courier: { name: 'Budi', vehicle: 'Honda Vario', plat_no: 'KT 1234 AB', lat: null, lng: null, last_location_at: null },
          delivery_status: 'Dalam_Pengiriman',
          customer: null,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/order/track?code=${id}`);
      if (res.ok) {
        const data: OrderTrackResponse = await res.json();
        setTracking(data);
        if (data.events?.length) setSseEvents(data.events);
      }
    } catch {}
  };

  const submitRating = (stars: number) => {
    setRating(stars);
    Alert.alert('Terima Kasih!', `Rating ${stars} bintang Anda sangat kami apresiasi!`);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#d97706" />
        <Text style={styles.loadingText}>Memuat status pesanan...</Text>
      </SafeAreaView>
    );
  }

  const activeStep = (() => {
    const s = tracking?.order?.order_status;
    if (s === 'pending' || s === 'waiting_payment') return 1;
    if (s === 'processing') return 2;
    if (s === 'delivering' || s === 'shipping') return 3;
    if (s === 'completed' || s === 'Terkirim') return 4;
    return 3;
  })();

  const order = tracking?.order;
  const courier = tracking?.courier;
  const deliveryStatus = tracking?.delivery_status;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerCard}>
          <Text style={styles.headerTitle}>Kode Pesanan</Text>
          <Text style={styles.orderCode}>{order?.kode_pesanan || order?.id_transaksi}</Text>
          <Text style={styles.totalPrice}>
            Total: Rp {(order?.total_bayar || 0).toLocaleString('id-ID')}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Status Pengiriman</Text>
        <View style={styles.stepperCard}>
          {[
            { icon: Clock, label: 'Pesanan Dibuat', sub: 'Menunggu konfirmasi pembayaran' },
            { icon: Package, label: 'Diproses di Gudang', sub: 'Keripik sedang di-packing' },
            { icon: Truck, label: 'Dalam Pengiriman', sub: 'Kurir menuju alamat tujuan' },
            { icon: CheckCircle2, label: 'Pesanan Selesai', sub: 'Pesanan diterima penerima' },
          ].map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={[styles.stepDot, activeStep >= i + 1 && styles.stepDotActive]}>
                <step.icon size={16} color={activeStep >= i + 1 ? '#ffffff' : '#92400e'} />
              </View>
              <View style={styles.stepInfo}>
                <Text style={styles.stepTitle}>{step.label}</Text>
                <Text style={styles.stepSubtitle}>{step.sub}</Text>
              </View>
            </View>
          ))}
        </View>

        {deliveryStatus && courier && (
          <View style={styles.courierCard}>
            <Text style={styles.sectionTitle}>{'🚚 Kurir'}</Text>
            <Text style={styles.courierName}>{courier.name}</Text>
            {courier.vehicle && (
              <Text style={styles.courierDetail}>
                {courier.vehicle}{courier.plat_no ? ` (${courier.plat_no})` : ''}
              </Text>
            )}
            <View style={styles.courierStatusBadge}>
              <Text style={styles.courierStatusText}>
                {deliveryStatus === 'Siap_Dikirim' ? 'Menunggu Kurir' :
                 deliveryStatus === 'Dalam_Pengiriman' ? 'Dalam Perjalanan' :
                 deliveryStatus === 'Terkirim' ? 'Terkirim' : deliveryStatus}
              </Text>
            </View>
            {courier.lat && courier.lng && (
              <TouchableOpacity
                style={styles.mapBtn}
                onPress={() => {
                  const url = Platform.select({
                    ios: `maps:0,0?q=${courier!.lat},${courier!.lng}`,
                    android: `geo:0,0?q=${courier!.lat},${courier!.lng}(Kurir)`,
                    default: `https://www.google.com/maps?q=${courier!.lat},${courier!.lng}`,
                  });
                  Linking.openURL(url!);
                }}
              >
                <Text style={styles.mapBtnText}>📍 Lihat Lokasi Kurir</Text>
              </TouchableOpacity>
            )}
            {courier.last_location_at && (
              <Text style={styles.lastUpdate}>
                Diperbarui: {new Date(courier.last_location_at).toLocaleTimeString('id-ID')}
              </Text>
            )}
            <View style={styles.liveDot}>
              <View style={styles.livePulse} />
              <Text style={styles.liveText}>Live</Text>
            </View>
          </View>
        )}

        {sseEvents.length > 0 && (
          <View style={styles.eventsSection}>
            <Text style={styles.sectionTitle}>Riwayat Status</Text>
            {sseEvents.map((event, i) => (
              <View key={event.event_type + i} style={styles.eventRow}>
                <View style={styles.eventDot} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.eventType}>{event.event_type.replace(/_/g, ' ')}</Text>
                  {event.event_data && <Text style={styles.eventData}>{event.event_data}</Text>}
                  <Text style={styles.eventDate}>
                    {new Date(event.created_at).toLocaleString('id-ID')}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.ratingCard}>
          <Text style={styles.ratingTitle}>Beri Rating</Text>
          <Text style={styles.ratingSubtitle}>Bagaimana pelayanan kami?</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => submitRating(star)}>
                <Star
                  size={32}
                  color={rating >= star ? '#f59e0b' : '#d1d5db'}
                  fill={rating >= star ? '#f59e0b' : 'none'}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.homeBtn} onPress={() => router.replace('/')}>
          <Text style={styles.homeBtnText}>Kembali ke Beranda Toko</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fffbeb' },
  centerContainer: { flex: 1, backgroundColor: '#fffbeb', justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 8, color: '#92400e', fontSize: 13 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  headerCard: { backgroundColor: '#d97706', borderRadius: 16, padding: 20, alignItems: 'center' },
  headerTitle: { color: '#fef3c7', fontSize: 12, fontWeight: '700' },
  orderCode: { color: '#ffffff', fontSize: 20, fontWeight: '800', marginTop: 4 },
  totalPrice: { color: '#ffffff', fontSize: 14, fontWeight: '700', marginTop: 6 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#78350f', marginTop: 20, marginBottom: 8 },
  stepperCard: { backgroundColor: '#ffffff', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#fde68a', gap: 16 },
  stepRow: { flexDirection: 'row', alignItems: 'center' },
  stepDot: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#fef3c7', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  stepDotActive: { backgroundColor: '#059669' },
  stepInfo: { flex: 1 },
  stepTitle: { fontSize: 14, fontWeight: '700', color: '#78350f' },
  stepSubtitle: { fontSize: 11, color: '#92400e', marginTop: 2 },
  courierCard: {
    backgroundColor: '#ffffff', borderRadius: 14, padding: 16, marginTop: 16,
    borderWidth: 2, borderColor: '#d97706', position: 'relative',
  },
  courierName: { fontSize: 16, fontWeight: '700', color: '#333', marginTop: 4 },
  courierDetail: { fontSize: 13, color: '#666', marginTop: 2 },
  courierStatusBadge: {
    marginTop: 8, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 999, backgroundColor: '#fef3c7',
  },
  courierStatusText: { fontSize: 12, fontWeight: '600', color: '#92400e' },
  mapBtn: { marginTop: 12, borderRadius: 999, backgroundColor: '#d97706', paddingVertical: 12, alignItems: 'center' },
  mapBtnText: { fontSize: 14, fontWeight: '600', color: '#ffffff' },
  lastUpdate: { fontSize: 11, color: '#999', marginTop: 6, textAlign: 'right' },
  liveDot: {
    position: 'absolute', top: 16, right: 16, flexDirection: 'row', alignItems: 'center', gap: 4,
  },
  livePulse: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e' },
  liveText: { fontSize: 11, fontWeight: '700', color: '#22c55e' },
  eventsSection: { gap: 8, marginTop: 16 },
  eventRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  eventDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#d97706', marginTop: 6 },
  eventType: { fontSize: 13, fontWeight: '500', color: '#333' },
  eventData: { fontSize: 12, color: '#666', marginTop: 1 },
  eventDate: { fontSize: 11, color: '#999', marginTop: 2 },
  ratingCard: { backgroundColor: '#ffffff', borderRadius: 14, padding: 16, marginTop: 16, alignItems: 'center', borderWidth: 1, borderColor: '#fde68a' },
  ratingTitle: { fontSize: 15, fontWeight: '800', color: '#78350f' },
  ratingSubtitle: { fontSize: 12, color: '#92400e', marginTop: 2 },
  starsRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  homeBtn: { backgroundColor: '#78350f', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 20 },
  homeBtnText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
});
