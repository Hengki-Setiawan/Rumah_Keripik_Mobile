import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Alert,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Award, Share2, Gift, ArrowUpRight, ArrowDownLeft, Copy, Sparkles, CheckCircle2 } from 'lucide-react-native';

const API_BASE_URL = 'https://rumahkripik.com';

interface LoyaltyData {
  ok: boolean;
  account: {
    pointsBalance: number;
    tier: 'bronze' | 'silver' | 'gold';
    referralCode: string;
  };
  ledger: Array<{
    id: string;
    delta: number;
    reason: string;
    createdAt: string;
    note?: string;
  }>;
}

export default function LoyaltyScreen() {
  const router = useRouter();
  const [data, setData] = useState<LoyaltyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchLoyaltyData();
  }, []);

  const fetchLoyaltyData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/loyalty/balance?customerId=CUST-001`).catch(() => null);
      if (res && res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        // Fallback demo data
        setData({
          ok: true,
          account: {
            pointsBalance: 12500,
            tier: 'silver',
            referralCode: 'KERIPIK-BUDI88',
          },
          ledger: [
            { id: '1', delta: 5000, reason: 'referral_bonus', createdAt: new Date().toISOString(), note: 'Bonus Referral Pelanggan Baru' },
            { id: '2', delta: 7500, reason: 'order_completed', createdAt: new Date(Date.now() - 86400000).toISOString(), note: 'Point Transaksi TX-20260723-005' },
          ],
        });
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const handleShareReferral = async () => {
    const code = data?.account.referralCode || 'KERIPIK-BUDI88';
    try {
      await Share.share({
        message: `Yuk beli keripik renyah & gurih di Rumah Keripik! Pakai kode referral saya '${code}' untuk dapat bonus poin 2.500 langsung! 🍿✨\nDownload app: https://rumahkripik.com/pesan`,
      });
    } catch {
      Alert.alert('Error', 'Gagal membagikan kode referral.');
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'gold': return '#f59e0b';
      case 'silver': return '#9ca3af';
      default: return '#d97706';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#d97706" />
        <Text style={styles.loadingText}>Memuat Poin & Program Loyalitas...</Text>
      </SafeAreaView>
    );
  }

  const account = data?.account || { pointsBalance: 12500, tier: 'silver', referralCode: 'KERIPIK-BUDI88' };
  const ledger = data?.ledger || [];

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Poin & Loyalitas Saya',
          headerShown: true,
          headerStyle: { backgroundColor: '#fffbeb' },
          headerTintColor: '#78350f',
        }}
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Tier Card */}
        <View style={[styles.tierCard, { borderColor: getTierColor(account.tier) }]}>
          <View style={styles.tierHeader}>
            <View style={styles.tierBadge}>
              <Award size={20} color={getTierColor(account.tier)} />
              <Text style={[styles.tierText, { color: getTierColor(account.tier) }]}>
                TIER {account.tier.toUpperCase()}
              </Text>
            </View>
            <Sparkles size={20} color="#f59e0b" />
          </View>

          <Text style={styles.pointsBalanceLabel}>Total Saldo Poin Saya</Text>
          <Text style={styles.pointsBalanceValue}>
            {account.pointsBalance.toLocaleString('id-ID')} <Text style={styles.ptsUnit}>Pts</Text>
          </Text>
          <Text style={styles.pointsEquivalent}>
            Setara dengan Rp {account.pointsBalance.toLocaleString('id-ID')} diskon checkout!
          </Text>
        </View>

        {/* Referral Card */}
        <Text style={styles.sectionTitle}>Program Referral 🎁</Text>
        <View style={styles.referralCard}>
          <Text style={styles.referralTitle}>Bagikan Kode & Dapatkan 5.000 Poin!</Text>
          <Text style={styles.referralSubtitle}>
            Ajak temanmu memesan keripik. Kamu dapat 5.000 poin dan temanmu dapat 2.500 poin!
          </Text>

          <View style={styles.codeContainer}>
            <Text style={styles.codeText}>{account.referralCode}</Text>
            <TouchableOpacity style={styles.shareBtn} onPress={handleShareReferral}>
              <Share2 size={16} color="#ffffff" />
              <Text style={styles.shareBtnText}>Bagikan</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Ledger History */}
        <Text style={styles.sectionTitle}>Riwayat Transaksi Poin 📜</Text>
        <View style={styles.ledgerCard}>
          {ledger.length === 0 ? (
            <Text style={styles.emptyText}>Belum ada riwayat perolehan poin.</Text>
          ) : (
            ledger.map((item) => (
              <View key={item.id} style={styles.ledgerRow}>
                <View style={styles.ledgerIconContainer}>
                  {item.delta > 0 ? (
                    <ArrowDownLeft size={20} color="#059669" />
                  ) : (
                    <ArrowUpRight size={20} color="#dc2626" />
                  )}
                </View>
                <View style={styles.ledgerInfo}>
                  <Text style={styles.ledgerReason}>
                    {item.note || (item.reason === 'referral_bonus' ? 'Bonus Referral' : 'Bonus Pesanan')}
                  </Text>
                  <Text style={styles.ledgerDate}>
                    {new Date(item.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
                <Text style={[styles.ledgerDelta, item.delta > 0 ? styles.deltaPlus : styles.deltaMinus]}>
                  {item.delta > 0 ? `+${item.delta}` : item.delta} Pts
                </Text>
              </View>
            ))
          )}
        </View>
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
  tierCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    elevation: 3,
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tierText: {
    fontSize: 12,
    fontWeight: '800',
  },
  pointsBalanceLabel: {
    fontSize: 12,
    color: '#92400e',
    marginTop: 16,
    fontWeight: '600',
  },
  pointsBalanceValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#78350f',
    marginTop: 2,
  },
  ptsUnit: {
    fontSize: 18,
    fontWeight: '600',
    color: '#d97706',
  },
  pointsEquivalent: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '700',
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#78350f',
    marginTop: 20,
    marginBottom: 8,
  },
  referralCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  referralTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#78350f',
  },
  referralSubtitle: {
    fontSize: 12,
    color: '#92400e',
    marginTop: 4,
    lineHeight: 18,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  codeText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#d97706',
    letterSpacing: 1,
  },
  shareBtn: {
    backgroundColor: '#d97706',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  shareBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  ledgerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  ledgerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#fef3c7',
  },
  ledgerIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  ledgerInfo: {
    flex: 1,
  },
  ledgerReason: {
    fontSize: 13,
    fontWeight: '700',
    color: '#78350f',
  },
  ledgerDate: {
    fontSize: 11,
    color: '#a16207',
    marginTop: 2,
  },
  ledgerDelta: {
    fontSize: 14,
    fontWeight: '800',
  },
  deltaPlus: {
    color: '#059669',
  },
  deltaMinus: {
    color: '#dc2626',
  },
  emptyText: {
    fontSize: 13,
    color: '#92400e',
    textAlign: 'center',
    paddingVertical: 16,
  },
});
