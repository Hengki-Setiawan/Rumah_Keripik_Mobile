import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCircle2, Clock, Truck, Package, Star, MapPin } from 'lucide-react-native';

const API_BASE_URL = 'https://rumahkripik.com';

interface OrderDetail {
  id_transaksi: string;
  kode_pesanan: string;
  total_bayar: number;
  status_pembayaran: string;
  order_status: string;
  nama_penerima: string;
  alamat_penerima: string;
  waktu_simpan: string;
}

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/order/track?code=${id}`).catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        setOrder(data.order || data);
      } else {
        // Fallback demo status
        setOrder({
          id_transaksi: id || 'TX-MBL-123456',
          kode_pesanan: id || 'TX-MBL-123456',
          total_bayar: 35000,
          status_pembayaran: 'Lunas',
          order_status: 'delivering',
          nama_penerima: 'Pelanggan Setia',
          alamat_penerima: 'Jl. Ahmad Yani No. 12, Samarinda',
          waktu_simpan: new Date().toISOString(),
        });
      }
    } catch {
      // Fallback status
    } finally {
      setLoading(false);
    }
  };

  const submitRating = (stars: number) => {
    setRating(stars);
    Alert.alert('Terima Kasih! ⭐', `Rating ${stars} bintang Anda sangat kami apresiasi!`);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#d97706" />
        <Text style={styles.loadingText}>Memuat status pesanan...</Text>
      </SafeAreaView>
    );
  }

  const getStepActive = (status: string) => {
    switch (status) {
      case 'pending': return 1;
      case 'processing': return 2;
      case 'delivering': return 3;
      case 'completed': return 4;
      default: return 3;
    }
  };

  const activeStep = getStepActive(order?.order_status || 'delivering');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Order Header */}
        <View style={styles.headerCard}>
          <Text style={styles.headerTitle}>Kode Pesanan</Text>
          <Text style={styles.orderCode}>{order?.kode_pesanan || order?.id_transaksi}</Text>
          <Text style={styles.totalPrice}>
            Total: Rp {(order?.total_bayar || 0).toLocaleString('id-ID')}
          </Text>
        </View>

        {/* Status Stepper */}
        <Text style={styles.sectionTitle}>Status Pengiriman 📦</Text>
        <View style={styles.stepperCard}>
          <View style={styles.stepRow}>
            <View style={[styles.stepDot, activeStep >= 1 ? styles.stepDotActive : null]}>
              <Clock size={16} color={activeStep >= 1 ? '#ffffff' : '#92400e'} />
            </View>
            <View style={styles.stepInfo}>
              <Text style={styles.stepTitle}>Pesanan Dibuat</Text>
              <Text style={styles.stepSubtitle}>Menunggu konfirmasi pembayaran</Text>
            </View>
          </View>

          <View style={styles.stepRow}>
            <View style={[styles.stepDot, activeStep >= 2 ? styles.stepDotActive : null]}>
              <Package size={16} color={activeStep >= 2 ? '#ffffff' : '#92400e'} />
            </View>
            <View style={styles.stepInfo}>
              <Text style={styles.stepTitle}>Diproses di Gudang</Text>
              <Text style={styles.stepSubtitle}>Keripik sedang di-packing rapat</Text>
            </View>
          </View>

          <View style={styles.stepRow}>
            <View style={[styles.stepDot, activeStep >= 3 ? styles.stepDotActive : null]}>
              <Truck size={16} color={activeStep >= 3 ? '#ffffff' : '#92400e'} />
            </View>
            <View style={styles.stepInfo}>
              <Text style={styles.stepTitle}>Dalam Pengiriman Kurir</Text>
              <Text style={styles.stepSubtitle}>Kurir sedang menuju alamat pengiriman</Text>
            </View>
          </View>

          <View style={styles.stepRow}>
            <View style={[styles.stepDot, activeStep >= 4 ? styles.stepDotActive : null]}>
              <CheckCircle2 size={16} color={activeStep >= 4 ? '#ffffff' : '#92400e'} />
            </View>
            <View style={styles.stepInfo}>
              <Text style={styles.stepTitle}>Pesanan Selesai</Text>
              <Text style={styles.stepSubtitle}>Pesanan diterima oleh penerima</Text>
            </View>
          </View>
        </View>

        {/* Courier Map Live Card */}
        <View style={styles.mapCard}>
          <View style={styles.mapHeader}>
            <MapPin size={20} color="#d97706" />
            <Text style={styles.mapTitle}>Lokasi Kurir Real-Time</Text>
          </View>
          <Text style={styles.mapSubtitle}>
            Kurir Budi (Motor Honda Vario - KT 1234 AB) sedang berada 1.2 KM dari lokasi Anda.
          </Text>
        </View>

        {/* Rating Section */}
        <View style={styles.ratingCard}>
          <Text style={styles.ratingTitle}>Beri Rating Pesanan ⭐</Text>
          <Text style={styles.ratingSubtitle}>Bagaimana kualitas keripik dan pelayanan kami?</Text>
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

        {/* Back to Home Button */}
        <TouchableOpacity style={styles.homeBtn} onPress={() => router.replace('/')}>
          <Text style={styles.homeBtnText}>Kembali ke Beranda Toko</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffbeb',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#fffbeb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: '#92400e',
    fontSize: 13,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  headerCard: {
    backgroundColor: '#d97706',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fef3c7',
    fontSize: 12,
    fontWeight: '700',
  },
  orderCode: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 4,
  },
  totalPrice: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#78350f',
    marginTop: 20,
    marginBottom: 8,
  },
  stepperCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fde68a',
    gap: 16,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepDotActive: {
    backgroundColor: '#059669',
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#78350f',
  },
  stepSubtitle: {
    fontSize: 11,
    color: '#92400e',
    marginTop: 2,
  },
  mapCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  mapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mapTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#78350f',
  },
  mapSubtitle: {
    fontSize: 12,
    color: '#92400e',
    marginTop: 6,
    lineHeight: 18,
  },
  ratingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginTop: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  ratingTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#78350f',
  },
  ratingSubtitle: {
    fontSize: 12,
    color: '#92400e',
    marginTop: 2,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  homeBtn: {
    backgroundColor: '#78350f',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  homeBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
