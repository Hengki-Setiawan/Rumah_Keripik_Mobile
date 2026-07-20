import { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { colors, borderRadius } from '../../../theme';
import { formatRupiah } from '../../../lib/utils';
import * as api from '../../../lib/api-client';
import type { PaymentUploadComponent } from '../../../lib/types';

export function PaymentUploadCard({
  component,
  onAction,
}: {
  component: PaymentUploadComponent;
  onAction: (action: string, payload?: Record<string, unknown>) => void;
}) {
  const [verified, setVerified] = useState(false);
  const [polling, setPolling] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    if (!component.qrCodeUrl || !component.orderId) return;

    const startDelay = setTimeout(() => {
      setPolling(true);
      api.checkPaymentStatus(component.orderId).then((data) => {
        if (data.isPaid || data.paymentStatus === 'verified') {
          setVerified(true);
        }
      }).catch(() => {});

      pollingRef.current = setInterval(() => {
        api.checkPaymentStatus(component.orderId).then((data) => {
          if (data.isPaid || data.paymentStatus === 'verified') {
            setVerified(true);
            if (pollingRef.current) clearInterval(pollingRef.current);
          }
        }).catch(() => {});
      }, 8000);
    }, 10000);

    return () => {
      clearTimeout(startDelay);
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [component.qrCodeUrl, component.orderId]);

  if (verified) {
    return (
      <View style={styles.card}>
        <Text style={styles.verifiedTitle}>Pembayaran Diterima!</Text>
        <Text style={styles.verifiedSub}>
          Terima kasih! Pesanan kamu sudah masuk dan sedang diproses.
        </Text>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => onAction('refresh_chat')}
        >
          <Text style={styles.primaryBtnText}>Refresh Chat</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (component.qrCodeUrl) {
    return (
      <View style={styles.card}>
        <View style={styles.qrHeader}>
          <Text style={styles.qrTitle}>Scan QRIS untuk Bayar</Text>
          {polling && (
            <View style={styles.pollingBadge}>
              <View style={styles.pollingDot} />
              <Text style={styles.pollingText}>Menunggu...</Text>
            </View>
          )}
        </View>

        <View style={styles.qrImageContainer}>
          <Image
            source={{ uri: component.qrCodeUrl }}
            style={styles.qrImage}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.qrInfo}>
          Total: {formatRupiah(component.amount || 0)}. Scan dengan GoPay, DANA, OVO, ShopeePay, atau Mobile Banking.
        </Text>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => onAction('refresh_chat')}
        >
          <Text style={styles.primaryBtnText}>Saya Sudah Bayar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.qrTitle}>Lanjutkan pembayaran</Text>
      <Text style={styles.qrInfo}>
        QRIS belum berhasil dimuat. Coba refresh atau buka Pesanan Saya.
      </Text>
      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={() => onAction('refresh_chat')}
      >
        <Text style={styles.primaryBtnText}>Coba Refresh</Text>
      </TouchableOpacity>
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
  verifiedTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#16a34a',
    marginBottom: 8,
  },
  verifiedSub: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  qrHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  qrTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  pollingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#eef6dd',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  pollingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#56721f',
  },
  pollingText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#56721f',
  },
  qrImageContainer: {
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ecd8bf',
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  qrImage: {
    width: 200,
    height: 200,
  },
  qrInfo: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  primaryBtn: {
    borderRadius: 999,
    backgroundColor: colors.accent,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
});
