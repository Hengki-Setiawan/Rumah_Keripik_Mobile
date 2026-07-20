import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { colors, borderRadius } from '../../src/theme';
import { formatRupiah } from '../../src/lib/utils';
import * as api from '../../src/lib/api-client';
import type { CustomerProfileDto, SavedAddressDto, OrderDto } from '../../src/lib/types';

export default function PesananSayaScreen() {
  const [data, setData] = useState<{
    profile: CustomerProfileDto | null;
    addresses: SavedAddressDto[];
    orders: OrderDto[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [profileForm, setProfileForm] = useState({ nama: '', phone: '', email: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');

  async function loadData() {
    try {
      const result = await api.getProfile();
      setData(result);
      setProfileForm({
        nama: result.profile?.nama || '',
        phone: result.profile?.phone || '',
        email: result.profile?.email || '',
      });
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useFocusEffect(useCallback(() => {
    setLoading(true);
    loadData();
  }, []));

  async function onRefresh() {
    setRefreshing(true);
    await loadData();
  }

  async function handleSaveProfile() {
    setSavingProfile(true);
    try {
      await api.saveProfile(profileForm);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan');
    } finally {
      setSavingProfile(false);
    }
  }

  function statusColor(status: string) {
    switch (status) {
      case 'paid': case 'settlement': case 'completed': return '#16a34a';
      case 'pending': case 'waiting_payment': return '#c55a2b';
      case 'cancelled': case 'expired': return '#dc2626';
      default: return colors.textSecondary;
    }
  }

  if (loading && !data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (error && !data) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={loadData}>
          <Text style={styles.retryBtnText}>Coba lagi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Tab bar */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'orders' && styles.tabActive]}
          onPress={() => setActiveTab('orders')}
        >
          <Text style={[styles.tabText, activeTab === 'orders' && styles.tabTextActive]}>
            Pesanan ({data?.orders?.length || 0})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'profile' && styles.tabActive]}
          onPress={() => setActiveTab('profile')}
        >
          <Text style={[styles.tabText, activeTab === 'profile' && styles.tabTextActive]}>
            Profil
          </Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{error}</Text>
        </View>
      )}

      <ScrollView
        style={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {activeTab === 'orders' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Riwayat Pesanan</Text>
            {(!data?.orders || data.orders.length === 0) ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>Belum ada pesanan</Text>
                <Text style={styles.emptySub}>Pesan keripik lewat chat untuk mulai.</Text>
              </View>
            ) : (
              data.orders.map((order) => (
                <View key={order.idTransaksi} style={styles.orderCard}>
                  <View style={styles.orderHeader}>
                    <Text style={styles.orderCode}>
                      {order.kodePesanan || order.idTransaksi}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor(order.orderStatus) + '20' }]}>
                      <Text style={[styles.statusText, { color: statusColor(order.orderStatus) }]}>
                        {order.orderStatus}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.orderDetail}>
                    <Text style={styles.orderInfo}>
                      {order.namaPenerima || '-'} | {order.phonePenerima || '-'}
                    </Text>
                    <Text style={styles.orderTotal}>{formatRupiah(order.totalBayar)}</Text>
                    <Text style={styles.orderDate}>
                      {new Date(order.waktuSimpan).toLocaleDateString('id-ID')}
                    </Text>
                  </View>
                  <View style={styles.orderFooter}>
                    {order.statusToken && (
                      <TouchableOpacity
                        style={styles.trackBtn}
                        onPress={() => {
                          // Navigate to lacak with code
                        }}
                      >
                        <Text style={styles.trackBtnText}>Lacak</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'profile' && (
          <View style={styles.section}>
            <View style={styles.profileCard}>
              <Text style={styles.sectionTitle}>Data Diri</Text>
              <TextInput
                style={styles.input}
                value={profileForm.nama}
                onChangeText={(t) => setProfileForm({ ...profileForm, nama: t })}
                placeholder="Nama"
                placeholderTextColor={colors.textMuted}
              />
              <TextInput
                style={styles.input}
                value={profileForm.phone}
                onChangeText={(t) => setProfileForm({ ...profileForm, phone: t })}
                placeholder="No. WhatsApp"
                keyboardType="phone-pad"
                placeholderTextColor={colors.textMuted}
              />
              <TextInput
                style={styles.input}
                value={profileForm.email}
                onChangeText={(t) => setProfileForm({ ...profileForm, email: t })}
                placeholder="Email (opsional)"
                keyboardType="email-address"
                placeholderTextColor={colors.textMuted}
              />
              <TouchableOpacity
                style={[styles.saveBtn, savingProfile && styles.btnDisabled]}
                onPress={handleSaveProfile}
                disabled={savingProfile}
              >
                <Text style={styles.saveBtnText}>
                  {savingProfile ? 'Menyimpan...' : 'Simpan'}
                </Text>
              </TouchableOpacity>
            </View>

            {data?.addresses && data.addresses.length > 0 && (
              <View style={styles.profileCard}>
                <Text style={styles.sectionTitle}>
                  Alamat Tersimpan ({data.addresses.length})
                </Text>
                {data.addresses.map((addr) => (
                  <View key={addr.id} style={styles.addressItem}>
                    <View style={styles.addressHeader}>
                      <Text style={styles.addressLabel}>{addr.label || 'Alamat'}</Text>
                      {addr.isDefault ? (
                        <Text style={styles.defaultBadge}>Utama</Text>
                      ) : null}
                    </View>
                    <Text style={styles.addressName}>
                      {addr.recipientName} | {addr.phone}
                    </Text>
                    <Text style={styles.addressText}>{addr.addressText}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  retryBtn: {
    borderRadius: 999,
    backgroundColor: colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryBtnText: {
    color: colors.white,
    fontWeight: '600',
  },
  tabRow: {
    flexDirection: 'row',
    margin: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.surfaceDark,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.accent,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  errorBanner: {
    backgroundColor: colors.errorBg,
    borderWidth: 1,
    borderColor: colors.errorBorder,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  errorBannerText: {
    fontSize: 13,
    color: colors.error,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    gap: 12,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  emptyCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 24,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  emptySub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  orderCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 16,
    gap: 8,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderCode: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  orderDetail: {
    gap: 2,
  },
  orderInfo: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.accent,
    marginTop: 4,
  },
  orderDate: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  orderFooter: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  trackBtn: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  trackBtnText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  profileCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 16,
    gap: 10,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.text,
  },
  saveBtn: {
    borderRadius: 999,
    backgroundColor: colors.accent,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  btnDisabled: { opacity: 0.5 },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  addressItem: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: 12,
    gap: 4,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addressLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  defaultBadge: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.green,
    backgroundColor: colors.greenLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    overflow: 'hidden',
  },
  addressName: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  addressText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
