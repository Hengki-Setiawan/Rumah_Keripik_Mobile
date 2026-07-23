import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Sparkles, ShoppingBag, Search, Tag, User, Plus, Check, Truck, MessageSquare } from 'lucide-react-native';
import { useCart, CartProduct } from '../src/lib/cart-context';
import { AiChatWorkspace } from '../src/components/AiChatWorkspace';

const API_BASE_URL = 'https://rumahkripik.com';
const CATEGORIES = ['Semua', 'Pedas', 'Original', 'Balado', 'Manis'];

export default function HomeScreen() {
  const router = useRouter();
  const { cart, addToCart, totalCount } = useCart();

  // Tab State: 'ai_chat' | 'katalog' | 'pesanan' | 'profil'
  const [activeTab, setActiveTab] = useState<'ai_chat' | 'katalog' | 'pesanan' | 'profil'>('ai_chat');

  const [products, setProducts] = useState<CartProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/public/products`).catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        setProducts(data.products || data);
      } else {
        setProducts([
          {
            id_produk: 'P001',
            nama_produk: 'Keripik Singkong Pedas Manis',
            harga_jual: 15000,
            kategori: 'Pedas',
            stok_gudang_utama: 45,
            qty: 0,
          },
          {
            id_produk: 'P002',
            nama_produk: 'Keripik Pisang Original Gurih',
            harga_jual: 18000,
            kategori: 'Original',
            stok_gudang_utama: 30,
            qty: 0,
          },
          {
            id_produk: 'P003',
            nama_produk: 'Keripik Tempe Balado Renyah',
            harga_jual: 16000,
            kategori: 'Balado',
            stok_gudang_utama: 25,
            qty: 0,
          },
        ]);
      }
    } catch {
      // Keep demo products
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.nama_produk.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'Semua' ||
      (p.kategori && p.kategori.toLowerCase().includes(selectedCategory.toLowerCase())) ||
      p.nama_produk.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const renderProductItem = ({ item }: { item: CartProduct }) => {
    const inCart = cart.find((c) => c.id_produk === item.id_produk);

    return (
      <View style={styles.card}>
        <View style={styles.imagePlaceholder}>
          <Tag size={32} color="#d97706" />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.productTitle} numberOfLines={2}>
            {item.nama_produk}
          </Text>
          <Text style={styles.productPrice}>Rp {item.harga_jual.toLocaleString('id-ID')}</Text>
          <Text style={styles.stockBadge}>
            {item.stok_gudang_utama > 0 ? `Stok: ${item.stok_gudang_utama}` : 'Stok Habis'}
          </Text>

          <TouchableOpacity
            style={[styles.addButton, inCart ? styles.addButtonActive : null]}
            onPress={() => addToCart(item)}
            disabled={item.stok_gudang_utama <= 0}
          >
            {inCart ? (
              <View style={styles.addBtnInner}>
                <Check size={14} color="#ffffff" />
                <Text style={styles.addBtnText}>Ditambah ({inCart.qty})</Text>
              </View>
            ) : (
              <View style={styles.addBtnInner}>
                <Plus size={14} color="#ffffff" />
                <Text style={styles.addBtnText}>Beli Pack</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Main Active Tab Screen Content */}
      <View style={styles.mainScreenContainer}>
        {activeTab === 'ai_chat' && <AiChatWorkspace />}

        {activeTab === 'katalog' && (
          <View style={{ flex: 1 }}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Search size={18} color="#92400e" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Cari keripik favoritmu..."
                placeholderTextColor="#a16207"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Category Chips */}
            <View style={styles.categoryContainer}>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={CATEGORIES}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.categoryChip,
                      selectedCategory === item ? styles.categoryChipActive : null,
                    ]}
                    onPress={() => setSelectedCategory(item)}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        selectedCategory === item ? styles.categoryTextActive : null,
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>

            {/* Product Grid */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#d97706" />
                <Text style={styles.loadingText}>Memuat katalog keripik...</Text>
              </View>
            ) : (
              <FlatList
                data={filteredProducts}
                keyExtractor={(item) => item.id_produk}
                numColumns={2}
                contentContainerStyle={styles.listContent}
                renderItem={renderProductItem}
              />
            )}
          </View>
        )}

        {activeTab === 'pesanan' && (
          <View style={styles.placeholderScreen}>
            <Truck size={48} color="#d97706" />
            <Text style={styles.placeholderTitle}>Pelacakan Pesanan Real-Time</Text>
            <Text style={styles.placeholderSubtitle}>
              Ketik kode pesanan atau tanyakan ke AI Agent untuk cek lokasi kurirmu!
            </Text>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => router.push('/lacak/TX-MBL-882910')}
            >
              <Text style={styles.actionBtnText}>Contoh Lacak Pesanan TX-MBL-882910</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'profil' && (
          <View style={styles.placeholderScreen}>
            <User size={48} color="#d97706" />
            <Text style={styles.placeholderTitle}>Profil Pelanggan</Text>
            <Text style={styles.placeholderSubtitle}>
              Pengaturan Akun & Alamat Pengiriman tersimpan
            </Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/saya')}>
              <Text style={styles.actionBtnText}>Buka Halaman Pengaturan Saya</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Floating Cart Button (if items in cart) */}
      {totalCount > 0 && activeTab !== 'ai_chat' && (
        <TouchableOpacity style={styles.checkoutBar} onPress={() => router.push('/keranjang')}>
          <View>
            <Text style={styles.checkoutBarCount}>{totalCount} Item di Keranjang</Text>
            <Text style={styles.checkoutBarHint}>Klik untuk proses pembayaran ➔</Text>
          </View>
          <ShoppingBag size={24} color="#ffffff" />
        </TouchableOpacity>
      )}

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.navItem, activeTab === 'ai_chat' ? styles.navItemActive : null]}
          onPress={() => setActiveTab('ai_chat')}
        >
          <Sparkles size={20} color={activeTab === 'ai_chat' ? '#d97706' : '#92400e'} />
          <Text style={[styles.navText, activeTab === 'ai_chat' ? styles.navTextActive : null]}>
            AI Agent
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeTab === 'katalog' ? styles.navItemActive : null]}
          onPress={() => setActiveTab('katalog')}
        >
          <ShoppingBag size={20} color={activeTab === 'katalog' ? '#d97706' : '#92400e'} />
          <Text style={[styles.navText, activeTab === 'katalog' ? styles.navTextActive : null]}>
            Katalog
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeTab === 'pesanan' ? styles.navItemActive : null]}
          onPress={() => setActiveTab('pesanan')}
        >
          <Truck size={20} color={activeTab === 'pesanan' ? '#d97706' : '#92400e'} />
          <Text style={[styles.navText, activeTab === 'pesanan' ? styles.navTextActive : null]}>
            Pesananku
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeTab === 'profil' ? styles.navItemActive : null]}
          onPress={() => setActiveTab('profil')}
        >
          <User size={20} color={activeTab === 'profil' ? '#d97706' : '#92400e'} />
          <Text style={[styles.navText, activeTab === 'profil' ? styles.navTextActive : null]}>
            Profil
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffbeb',
  },
  mainScreenContainer: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#78350f',
  },
  categoryContainer: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: '#fef3c7',
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  categoryChipActive: {
    backgroundColor: '#d97706',
    borderColor: '#b45309',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#78350f',
  },
  categoryTextActive: {
    color: '#ffffff',
  },
  listContent: {
    paddingHorizontal: 10,
    paddingBottom: 80,
  },
  card: {
    flex: 1,
    backgroundColor: '#ffffff',
    margin: 6,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  imagePlaceholder: {
    height: 90,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: 10,
  },
  productTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#78350f',
    height: 36,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#d97706',
    marginTop: 4,
  },
  stockBadge: {
    fontSize: 10,
    color: '#92400e',
    marginTop: 2,
  },
  addButton: {
    backgroundColor: '#d97706',
    borderRadius: 8,
    paddingVertical: 6,
    marginTop: 8,
    alignItems: 'center',
  },
  addButtonActive: {
    backgroundColor: '#059669',
  },
  addBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: '#92400e',
    fontSize: 13,
  },
  placeholderScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#78350f',
    marginTop: 12,
  },
  placeholderSubtitle: {
    fontSize: 13,
    color: '#92400e',
    textAlign: 'center',
    marginTop: 6,
  },
  actionBtn: {
    backgroundColor: '#d97706',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  checkoutBar: {
    position: 'absolute',
    bottom: 64,
    left: 16,
    right: 16,
    backgroundColor: '#d97706',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 5,
  },
  checkoutBarCount: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  checkoutBarHint: {
    color: '#fef3c7',
    fontSize: 11,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#fde68a',
    paddingVertical: 8,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navItemActive: {},
  navText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#92400e',
    marginTop: 2,
  },
  navTextActive: {
    color: '#d97706',
    fontWeight: '800',
  },
});
