import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Minus, Plus, Trash2, CreditCard, Banknote, MapPin, CheckCircle2, ExternalLink } from 'lucide-react-native';
import { useCart } from '../src/lib/cart-context';
import { apiFetch, getAccessToken } from '../src/lib/api-client';
import * as WebBrowser from 'expo-web-browser';

export default function CartScreen() {
  const router = useRouter();
  const { cart, updateQty, removeFromCart, clearCart, totalAmount } = useCart();

  const [namaPenerima, setNamaPenerima] = useState('');
  const [noHp, setNoHp] = useState('');
  const [alamat, setAlamat] = useState('');
  const [catatan, setCatatan] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'PM-COD' | 'PM-BCA-TRANSFER'>('PM-COD');
  const [submitting, setSubmitting] = useState(false);

  const handleCheckout = async () => {
    if (!namaPenerima.trim()) {
      Alert.alert('Form Belum Lengkap', 'Mohon isi nama penerima pesanan.');
      return;
    }
    if (!noHp.trim() || noHp.length < 8) {
      Alert.alert('Form Belum Lengkap', 'Mohon isi nomor HP/WhatsApp yang valid.');
      return;
    }
    if (!alamat.trim() || alamat.length < 5) {
      Alert.alert('Form Belum Lengkap', 'Mohon isi alamat lengkap pengiriman.');
      return;
    }

    const token = await getAccessToken();
    if (!token) {
      Alert.alert('Login Diperlukan', 'Silakan login terlebih dahulu untuk checkout.');
      router.push('/(auth)/login');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        source: 'web',
        customer: { name: namaPenerima, phone: noHp },
        address: { text: alamat, note: catatan || undefined },
        paymentMethodId: paymentMethod,
        items: cart.map((item) => ({
          id_produk: item.id_produk,
          qty: item.qty,
        })),
      };

      const res = await apiFetch<{ order: { idTransaksi: string; kodePesanan: string; checkoutUrl?: string | null } }>('/api/order/web', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        Alert.alert('Gagal', res.error || 'Terjadi kesalahan');
        return;
      }

      clearCart();
      const order = res.data!.order;

      if (order.checkoutUrl) {
        const result = await WebBrowser.openAuthSessionAsync(order.checkoutUrl, 'rumahkripik://payment');
        if (result.type === 'success') {
          Alert.alert('Pembayaran Diproses', 'Status pembayaran akan dikonfirmasi.', [
            { text: 'Lihat Status', onPress: () => router.push(`/lacak/${order.idTransaksi}`) },
          ]);
        } else {
          Alert.alert('Pembayaran Dibatalkan', `Kode: ${order.kodePesanan}\n\nSelesaikan pembayaran melalui menu Lacak.`, [
            { text: 'Lihat Status', onPress: () => router.push(`/lacak/${order.idTransaksi}`) },
          ]);
        }
      } else {
        Alert.alert(
          'Pesanan Berhasil!',
          `Kode: ${order.kodePesanan}\n\nAdmin akan segera memproses pesanan Anda.`,
          [
            { text: 'Lihat Status', onPress: () => router.push(`/lacak/${order.idTransaksi}`) },
          ]
        );
      }
    } catch {
      Alert.alert('Error', 'Terjadi kesalahan sistem saat memproses pesanan.');
    } finally {
      setSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Keranjang Belanja Kosong 🛒</Text>
        <Text style={styles.emptySubtitle}>Yuk pilih keripik renyah & gurih favoritmu!</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Lihat Katalog Produk</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Item List */}
        <Text style={styles.sectionTitle}>Item Pesanan ({cart.length})</Text>
        {cart.map((item) => (
          <View key={item.id_produk} style={styles.cartItem}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle}>{item.nama_produk}</Text>
              <Text style={styles.itemPrice}>
                Rp {item.harga_jual.toLocaleString('id-ID')} / pack
              </Text>
            </View>

            <View style={styles.qtyContainer}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => updateQty(item.id_produk, -1)}
              >
                <Minus size={14} color="#78350f" />
              </TouchableOpacity>
              <Text style={styles.qtyText}>{item.qty}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => updateQty(item.id_produk, 1)}
              >
                <Plus size={14} color="#78350f" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.trashBtn}
                onPress={() => removeFromCart(item.id_produk)}
              >
                <Trash2 size={16} color="#dc2626" />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Form Pengiriman */}
        <Text style={styles.sectionTitle}>Data Pengiriman 🚚</Text>
        <View style={styles.formCard}>
          <Text style={styles.inputLabel}>Nama Penerima</Text>
          <TextInput
            style={styles.input}
            placeholder="Contoh: Budi Santoso"
            placeholderTextColor="#a16207"
            value={namaPenerima}
            onChangeText={setNamaPenerima}
          />

          <Text style={styles.inputLabel}>Nomor WhatsApp / HP</Text>
          <TextInput
            style={styles.input}
            placeholder="Contoh: 08123456789"
            placeholderTextColor="#a16207"
            keyboardType="phone-pad"
            value={noHp}
            onChangeText={setNoHp}
          />

          <Text style={styles.inputLabel}>Alamat Lengkap Kirim</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Nama Jalan, RT/RW, Kecamatan, Patokan..."
            placeholderTextColor="#a16207"
            multiline
            numberOfLines={3}
            value={alamat}
            onChangeText={setAlamat}
          />

          <Text style={styles.inputLabel}>Catatan untuk Kurir (Opsional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Contoh: Titip di pos satpam jika tidak ada orang"
            placeholderTextColor="#a16207"
            value={catatan}
            onChangeText={setCatatan}
          />
        </View>

        {/* Metode Pembayaran */}
        <Text style={styles.sectionTitle}>Metode Pembayaran 💳</Text>
        <View style={styles.paymentContainer}>
          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === 'PM-COD' ? styles.paymentOptionActive : null,
            ]}
            onPress={() => setPaymentMethod('PM-COD')}
          >
            <Banknote size={20} color={paymentMethod === 'PM-COD' ? '#d97706' : '#78350f'} />
            <Text style={styles.paymentText}>COD (Bayar di Tempat)</Text>
            {paymentMethod === 'PM-COD' && <CheckCircle2 size={18} color="#d97706" />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === 'PM-BCA-TRANSFER' ? styles.paymentOptionActive : null,
            ]}
            onPress={() => setPaymentMethod('PM-BCA-TRANSFER')}
          >
            <CreditCard
              size={20}
              color={paymentMethod === 'PM-BCA-TRANSFER' ? '#d97706' : '#78350f'}
            />
            <Text style={styles.paymentText}>Transfer Bank (BCA/BNI/Mandiri)</Text>
            {paymentMethod === 'PM-BCA-TRANSFER' && <CheckCircle2 size={18} color="#d97706" />}
          </TouchableOpacity>
        </View>

        {/* Total Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal Belanja</Text>
            <Text style={styles.summaryValue}>Rp {totalAmount.toLocaleString('id-ID')}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Ongkos Kirim Flat</Text>
            <Text style={styles.summaryValue}>Rp 5.000</Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryRowTotal]}>
            <Text style={styles.totalLabel}>TOTAL BAYAR</Text>
            <Text style={styles.totalValue}>
              Rp {(totalAmount + 5000).toLocaleString('id-ID')}
            </Text>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleCheckout}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.submitBtnText}>Konfirmasi & Buat Pesanan</Text>
          )}
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
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#78350f',
    marginTop: 12,
    marginBottom: 8,
  },
  cartItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#78350f',
  },
  itemPrice: {
    fontSize: 13,
    color: '#d97706',
    fontWeight: '600',
    marginTop: 2,
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#78350f',
  },
  trashBtn: {
    marginLeft: 6,
    padding: 4,
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#78350f',
    marginTop: 8,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#fffbeb',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    fontSize: 13,
    color: '#78350f',
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  textArea: {
    height: 70,
    paddingTop: 8,
  },
  paymentContainer: {
    gap: 8,
  },
  paymentOption: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  paymentOptionActive: {
    borderColor: '#d97706',
    backgroundColor: '#fef3c7',
  },
  paymentText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#78350f',
    flex: 1,
    marginLeft: 10,
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#92400e',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#78350f',
  },
  summaryRowTotal: {
    borderTopWidth: 1,
    borderTopColor: '#fde68a',
    paddingTop: 10,
    marginTop: 6,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#78350f',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#d97706',
  },
  submitBtn: {
    backgroundColor: '#d97706',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#fffbeb',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#78350f',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#92400e',
    marginTop: 6,
  },
  backBtn: {
    backgroundColor: '#d97706',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
  },
  backBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
