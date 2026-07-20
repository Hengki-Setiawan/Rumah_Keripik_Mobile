import { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet,
} from 'react-native';
import { colors, borderRadius } from '../../../theme';
import * as api from '../../../lib/api-client';
import type { OrderSummaryComponent, PaymentMethodDto, SavedAddressDto } from '../../../lib/types';

export function OrderSummaryCard({
  component: _component,
  onSend,
  onAction,
}: {
  component: OrderSummaryComponent;
  onSend?: (text: string) => void;
  onAction: (action: string, payload?: Record<string, unknown>) => void;
}) {
  const [step, setStep] = useState<'customer' | 'address' | 'payment' | 'review'>('customer');
  const [customer, setCustomer] = useState({ name: '', phone: '', pin: '' });
  const [address, setAddress] = useState({ text: '', note: '', lat: '', lng: '' });
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodDto[]>([]);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddressDto[]>([]);

  useEffect(() => {
    api.getPaymentMethods().then(setPaymentMethods).catch(() => {});
    api.getSavedAddresses().then(setSavedAddresses).catch(() => {});
    api.getProfile().then((data) => {
      if (data.profile) {
        setCustomer({
          name: data.profile.nama || '',
          phone: data.profile.phone || '',
          pin: '',
        });
        setStep('address');
      }
    }).catch(() => {});
  }, []);

  function canSubmit() {
    return (
      customer.name.trim().length >= 2 &&
      customer.phone.trim().length >= 8 &&
      customer.pin.length === 4 &&
      address.text.trim().length >= 8 &&
      paymentMethodId.trim().length > 0
    );
  }

  function submitOrder() {
    if (!canSubmit()) return;
    onAction('create_order', { customer, address, paymentMethodId, notes });
  }

  const steps = ['customer', 'address', 'payment', 'review'] as const;
  const stepLabels = ['Data', 'Alamat', 'Bayar', 'Review'];
  const stepIcons = ['👤', '📍', '💳', '✅'];

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Buat order dari chat</Text>
      <Text style={styles.subtitle}>
        Aku minta data bertahap supaya order bisa masuk dashboard.
      </Text>

      {/* Step indicator */}
      <View style={styles.stepRow}>
        {steps.map((s, i) => (
          <TouchableOpacity
            key={s}
            style={[styles.stepItem, step === s && styles.stepItemActive]}
            onPress={() => setStep(s)}
          >
            <Text style={styles.stepIcon}>{stepIcons[i]}</Text>
            <Text style={[styles.stepLabel, step === s && styles.stepLabelActive]}>
              {stepLabels[i]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {step === 'customer' && (
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            value={customer.name}
            onChangeText={(t) => setCustomer({ ...customer, name: t })}
            placeholder="Nama penerima"
            placeholderTextColor={colors.textMuted}
          />
          <TextInput
            style={styles.input}
            value={customer.phone}
            onChangeText={(t) => setCustomer({ ...customer, phone: t })}
            placeholder="No. WhatsApp"
            keyboardType="phone-pad"
            placeholderTextColor={colors.textMuted}
          />
          <TextInput
            style={styles.input}
            value={customer.pin}
            onChangeText={(t) => setCustomer({ ...customer, pin: t.replace(/\D/g, '').slice(0, 4) })}
            placeholder="PIN 4 digit (untuk restore data)"
            keyboardType="number-pad"
            maxLength={4}
            placeholderTextColor={colors.textMuted}
          />
          <TouchableOpacity
            style={[styles.nextBtn, (customer.name.length < 2 || customer.phone.length < 8 || customer.pin.length < 4) && styles.btnDisabled]}
            disabled={customer.name.length < 2 || customer.phone.length < 8 || customer.pin.length < 4}
            onPress={() => setStep('address')}
          >
            <Text style={styles.nextBtnText}>Lanjut alamat</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 'address' && (
        <View style={styles.form}>
          {savedAddresses.length > 0 && (
            <View style={styles.savedSection}>
              <Text style={styles.savedTitle}>Alamat tersimpan:</Text>
              <ScrollView style={{ maxHeight: 120 }} nestedScrollEnabled>
                {savedAddresses.map((addr) => (
                  <TouchableOpacity
                    key={addr.id}
                    style={styles.savedItem}
                    onPress={() => {
                      setAddress({
                        text: addr.addressText || '',
                        note: addr.courierNote || addr.landmark || '',
                        lat: addr.latitude || '',
                        lng: addr.longitude || '',
                      });
                    }}
                  >
                    <Text style={styles.savedName}>{addr.recipientName || 'Penerima'}</Text>
                    <Text style={styles.savedAddr} numberOfLines={1}>{addr.addressText}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
          <TextInput
            style={[styles.input, styles.textArea]}
            value={address.text}
            onChangeText={(t) => setAddress({ ...address, text: t })}
            placeholder="Alamat lengkap"
            multiline
            placeholderTextColor={colors.textMuted}
          />
          <TextInput
            style={styles.input}
            value={address.note}
            onChangeText={(t) => setAddress({ ...address, note: t })}
            placeholder="Patokan/catatan kurir"
            placeholderTextColor={colors.textMuted}
          />
          <TouchableOpacity
            style={[styles.nextBtn, address.text.length < 8 && styles.btnDisabled]}
            disabled={address.text.length < 8}
            onPress={() => setStep('payment')}
          >
            <Text style={styles.nextBtnText}>Lanjut pembayaran</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 'payment' && (
        <View style={styles.form}>
          <View style={styles.panel}>
            <Text style={styles.panelText}>Pilih metode pembayaran</Text>
          </View>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[styles.methodItem, paymentMethodId === method.id && styles.methodItemActive]}
              onPress={() => setPaymentMethodId(method.id)}
            >
              <Text style={styles.methodLabel}>{method.label}</Text>
              <Text style={styles.methodNote}>
                {method.note || (method.type === 'cod' ? 'Bayar saat diterima' : 'Bayar via QRIS')}
              </Text>
              {method.accountNumber && (
                <Text style={styles.methodAccount}>{method.bankName}: {method.accountNumber}</Text>
              )}
            </TouchableOpacity>
          ))}
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Catatan pesanan (opsional)"
            multiline
            placeholderTextColor={colors.textMuted}
          />
          <TouchableOpacity
            style={[styles.nextBtn, !paymentMethodId && styles.btnDisabled]}
            disabled={!paymentMethodId}
            onPress={() => setStep('review')}
          >
            <Text style={styles.nextBtnText}>Review order</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 'review' && (
        <View style={styles.form}>
          <View style={styles.panel}>
            <Text style={styles.panelBold}>Cek ulang sebelum order</Text>
            <Text style={styles.panelText}>Nama: {customer.name}</Text>
            <Text style={styles.panelText}>WA: {customer.phone}</Text>
            <Text style={styles.panelText}>Alamat: {address.text}</Text>
            <Text style={styles.panelText}>
              Bayar: {paymentMethods.find((m) => m.id === paymentMethodId)?.label || paymentMethodId}
            </Text>
            {notes ? <Text style={styles.panelText}>Catatan: {notes}</Text> : null}
          </View>
          <TouchableOpacity
            style={[styles.nextBtn, !canSubmit() && styles.btnDisabled]}
            disabled={!canSubmit()}
            onPress={submitOrder}
          >
            <Text style={styles.nextBtnText}>Konfirmasi & Buat Order</Text>
          </TouchableOpacity>
        </View>
      )}
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
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: 4,
    marginBottom: 12,
  },
  stepRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 12,
  },
  stepItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#f7eddf',
  },
  stepItemActive: {
    backgroundColor: colors.accent,
  },
  stepIcon: { fontSize: 16 },
  stepLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: 2,
  },
  stepLabelActive: { color: colors.white },
  form: { gap: 10 },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ecd8bf',
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.text,
  },
  textArea: { minHeight: 60 },
  nextBtn: {
    borderRadius: 999,
    backgroundColor: colors.accent,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  btnDisabled: { opacity: 0.5 },
  nextBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  panel: {
    backgroundColor: '#fbf2e7',
    borderRadius: 14,
    padding: 12,
    gap: 4,
  },
  panelText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  panelBold: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  savedSection: {
    marginBottom: 4,
  },
  savedTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  savedItem: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ecd8bf',
    backgroundColor: colors.white,
    padding: 10,
    marginBottom: 4,
  },
  savedName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  savedAddr: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  methodItem: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ecd8bf',
    backgroundColor: colors.white,
    padding: 14,
  },
  methodItemActive: {
    borderColor: colors.accent,
    backgroundColor: '#fff4ea',
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
  },
  methodAccount: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text,
    marginTop: 4,
  },
});
