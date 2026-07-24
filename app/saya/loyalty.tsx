import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Share, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Gift, Share2, ChevronRight, Star, TrendingUp } from 'lucide-react-native';
import { getLoyaltyInfo, getTierProgress, redeemPoints, type LoyaltyAccount, type PointsHistoryEntry } from '../src/lib/loyalty';
import { getAccessToken } from '../src/lib/api-client';

export default function LoyaltyScreen() {
  const router = useRouter();
  const [account, setAccount] = useState<LoyaltyAccount | null>(null);
  const [history, setHistory] = useState<PointsHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeemPoints, setRedeemPointsState] = useState('');

  useEffect(() => { loadLoyalty(); }, []);

  async function loadLoyalty() {
    setLoading(true);
    try {
      const res = await fetch('https://rumah-keripik.vercel.app/api/loyalty/balance?customerId=me', {
        headers: { Authorization: `Bearer ${await getAccessToken()}` },
      });
      const data = await res.json();
      if (data.ok) {
        setAccount(data.account);
        setHistory(data.pointsHistory || []);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleRedeem() {
    const points = parseInt(redeemPoints);
    if (isNaN(points) || points < 10000) {
      Alert.alert('Minimal', 'Minimal redeem 10.000 poin');
      return;
    }
    const res = await redeemPoints('me', points);
    if (res.ok) {
      Alert.alert('Sukses', `Berhasil redeem ${res.data?.pointsUsed} poin = Rp ${res.data?.reward}`);
      loadLoyalty();
      setRedeemPointsState('');
    } else {
      Alert.alert('Gagal', res.error || 'Coba lagi');
    }
  }

  async function handleShare() {
    const token = await getAccessToken();
    if (!token) return;
    const codeRes = await fetch('https://rumah-keripik.vercel.app/api/loyalty/referral/code', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const codeData = await codeRes.json();
    if (codeData.code) {
      await Share.share({ message: `Ajak teman pakai kode referral ${codeData.code} dan dapatkan bonus!` });
    }
  }

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#c55a2b" /></View>;
  }

  const tier = account?.tier || 'bronze';
  const balance = account?.pointsBalance || 0;
  const progress = getTierProgress(balance, tier);
  const tierColors: Record<string, string> = { bronze: '#cd7f32', silver: '#9e9e9e', gold: '#ffd700' };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={[styles.tierCard, { borderColor: tierColors[tier] }]}>
        <Text style={[styles.tierBadge, { backgroundColor: tierColors[tier] }]}>{tier.toUpperCase()}</Text>
        <Text style={styles.balance}>{balance.toLocaleString('id-ID')}</Text>
        <Text style={styles.balanceLabel}>Poin</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress.percent}%`, backgroundColor: tierColors[tier] }]} />
        </View>
        <Text style={styles.progressText}>{progress.percent}% menuju {progress.nextTier}</Text>
      </View>

      {balance >= 10000 && (
        <View style={styles.redeemCard}>
          <Text style={styles.redeemTitle}>Tukar Poin</Text>
          <Text style={styles.redeemNote}>1 poin = Rp 1, minimal 10.000 poin</Text>
          <View style={styles.redeemRow}>
            <TouchableOpacity style={styles.redeemBtn} onPress={handleRedeem}>
              <Text style={styles.redeemBtnText}>Tukarkan</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.referralCard} onPress={handleShare}>
        <Share2 size={20} color="#c55a2b" />
        <View style={styles.referralText}>
          <Text style={styles.referralTitle}>Ajak Teman</Text>
          <Text style={styles.referralDesc}>Dapatkan bonus 5.000 poin untuk setiap teman yang bergabung</Text>
        </View>
        <ChevronRight size={20} color="#999" />
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Riwayat Poin</Text>
      {history.map((item) => (
        <View key={item.id} style={styles.historyItem}>
          <View style={styles.historyLeft}>
            <Text style={[styles.historyDelta, { color: item.delta > 0 ? '#2e7d32' : '#c62828' }]}>
              {item.delta > 0 ? '+' : ''}{item.delta}
            </Text>
            <Text style={styles.historyReason}>{item.reason}</Text>
          </View>
          <Text style={styles.historyDate}>{new Date(item.createdAt).toLocaleDateString('id-ID')}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#faf6ef' },
  content: { padding: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#faf6ef' },
  tierCard: {
    backgroundColor: '#fff', borderRadius: 16, borderWidth: 2, padding: 24, alignItems: 'center', marginBottom: 16,
  },
  tierBadge: { color: '#fff', fontSize: 12, fontWeight: '700', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, overflow: 'hidden', marginBottom: 12 },
  balance: { fontSize: 36, fontWeight: '700', color: '#333' },
  balanceLabel: { fontSize: 14, color: '#666', marginBottom: 12 },
  progressBar: { height: 6, backgroundColor: '#e0e0e0', borderRadius: 3, width: '100%', marginBottom: 6 },
  progressFill: { height: 6, borderRadius: 3 },
  progressText: { fontSize: 12, color: '#999' },
  redeemCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12 },
  redeemTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 4 },
  redeemNote: { fontSize: 12, color: '#999', marginBottom: 12 },
  redeemRow: { flexDirection: 'row', gap: 8 },
  redeemBtn: { backgroundColor: '#c55a2b', borderRadius: 8, padding: 12, flex: 1, alignItems: 'center' },
  redeemBtnText: { color: '#fff', fontWeight: '600' },
  referralCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 16,
  },
  referralText: { flex: 1, marginLeft: 12 },
  referralTitle: { fontSize: 14, fontWeight: '600', color: '#333' },
  referralDesc: { fontSize: 12, color: '#999', marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 12 },
  historyItem: {
    backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between',
  },
  historyLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  historyDelta: { fontSize: 16, fontWeight: '700' },
  historyReason: { fontSize: 13, color: '#666' },
  historyDate: { fontSize: 11, color: '#999' },
});
