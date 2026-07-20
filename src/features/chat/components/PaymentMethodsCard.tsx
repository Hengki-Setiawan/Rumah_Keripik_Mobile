import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, borderRadius } from '../../../theme';
import * as api from '../../../lib/api-client';
import type { PaymentMethodsComponent, PaymentMethodDto } from '../../../lib/types';

export function PaymentMethodsCard({
  component,
  onAction,
}: {
  component: PaymentMethodsComponent;
  onAction: (action: string, payload?: Record<string, unknown>) => void;
}) {
  const [methods, setMethods] = useState<PaymentMethodDto[]>([]);

  useEffect(() => {
    api.getPaymentMethods().then(setMethods).catch(() => {});
  }, []);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Pilih metode bayar</Text>
      {methods.length === 0 && (
        <Text style={styles.loading}>Memuat metode pembayaran...</Text>
      )}
      <View style={styles.grid}>
        {methods
          .filter((m) => component.methodIds.includes(m.id))
          .map((method) => (
            <TouchableOpacity
              key={method.id}
              style={styles.methodCard}
              onPress={() => onAction('select_payment_method', { methodId: method.id })}
            >
              <Text style={styles.methodLabel}>{method.label}</Text>
              <Text style={styles.methodNote}>
                {method.note || (method.type === 'cod' ? 'Bayar saat diterima' : 'Bayar via QRIS')}
              </Text>
              {method.accountNumber && (
                <Text style={styles.methodAccount}>
                  {method.bankName}: {method.accountNumber}
                </Text>
              )}
            </TouchableOpacity>
          ))}
      </View>
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
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  loading: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  grid: {
    gap: 8,
  },
  methodCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ecd8bf',
    backgroundColor: colors.white,
    padding: 14,
  },
  methodLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  methodNote: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  methodAccount: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text,
    marginTop: 6,
  },
});
