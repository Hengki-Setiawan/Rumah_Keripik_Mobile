import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { colors, borderRadius } from '../../../theme';
import { formatRupiah } from '../../../lib/utils';
import type {
  CustomerConfirmComponent,
  AddressConfirmComponent,
  OrderStatusComponent,
  AdminHandoffComponent,
} from '../../../lib/types';

const cardStyle = {
  backgroundColor: 'rgba(255,250,244,0.9)',
  borderRadius: 20,
  borderWidth: 1,
  borderColor: colors.border,
  padding: 16,
  marginVertical: 4,
};

export function CustomerConfirmCard({
  component,
  onAction,
}: {
  component: CustomerConfirmComponent;
  onAction?: (action: string, payload?: Record<string, unknown>) => void;
}) {
  const customer = component.customer;
  return (
    <View style={cardStyle}>
      <Text style={styles.title}>Data customer tersimpan</Text>
      <View style={styles.panel}>
        <Text style={styles.panelText}>
          Nama: <Text style={styles.panelBold}>{customer?.name || 'Customer tersimpan'}</Text>
        </Text>
        <Text style={styles.panelText}>
          No WA: <Text style={styles.panelBold}>{customer?.phoneMasked || '********'}</Text>
        </Text>
      </View>
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => onAction?.('use_saved_customer', { customerId: component.customerId || customer?.id })}
        >
          <Text style={styles.primaryBtnText}>Pakai data ini</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => onAction?.('edit_customer_data')}
        >
          <Text style={styles.secondaryBtnText}>Ubah</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function AddressConfirmCard({
  component,
  onAction,
}: {
  component: AddressConfirmComponent;
  onAction?: (action: string, payload?: Record<string, unknown>) => void;
}) {
  const address = component.address;
  return (
    <View style={cardStyle}>
      <Text style={styles.title}>Konfirmasi alamat</Text>
      <View style={styles.panel}>
        <Text style={styles.panelBold}>{address?.label || 'Alamat tersimpan'}</Text>
        <Text style={styles.panelText}>Penerima: {address?.recipientName || '-'}</Text>
        <Text style={styles.panelText}>WA: {address?.phoneMasked || '-'}</Text>
        <Text style={[styles.panelText, { marginTop: 6 }]}>{address?.addressSummary || ''}</Text>
        {(address?.latitude && address?.longitude) && (
          <Text style={[styles.panelText, { color: '#16a34a', marginTop: 4 }]}>
            Koordinat tersedia
          </Text>
        )}
      </View>
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => onAction?.('use_saved_address', { addressId: component.addressId || address?.id })}
        >
          <Text style={styles.primaryBtnText}>Pakai alamat</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => onAction?.('edit_address')}
        >
          <Text style={styles.secondaryBtnText}>Ubah</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function OrderStatusCard({
  component,
}: {
  component: OrderStatusComponent;
}) {
  return (
    <View style={cardStyle}>
      <Text style={styles.title}>Status pesanan</Text>
      <View style={{ gap: 4, marginTop: 8 }}>
        <Text style={styles.panelText}>
          Order: {component.orderCode || component.orderId}
        </Text>
        {component.status && (
          <Text style={styles.panelText}>Status: {component.status}</Text>
        )}
        {component.paymentStatus && (
          <Text style={styles.panelText}>Pembayaran: {component.paymentStatus}</Text>
        )}
        {component.totalAmount != null && (
          <Text style={[styles.panelBold, { marginTop: 4 }]}>
            Total: {formatRupiah(component.totalAmount)}
          </Text>
        )}
      </View>
    </View>
  );
}

export function AdminHandoffCard({
  component,
  onSend,
}: {
  component: AdminHandoffComponent;
  onSend?: (message: string) => void;
}) {
  return (
    <View style={[cardStyle, { borderColor: '#f3d2bf', backgroundColor: '#fff3ea' }]}>
      <Text style={[styles.title, { color: '#7b3111' }]}>Butuh admin</Text>
      <Text style={[styles.panelText, { color: '#8b4c31', marginTop: 8, lineHeight: 20 }]}>
        {component.reason || 'Chat ini diteruskan ke admin.'}
      </Text>
      <TouchableOpacity
        style={styles.secondaryBtn}
        onPress={() => onSend?.('lihat produk')}
      >
        <Text style={styles.secondaryBtnText}>Lihat katalog</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  panel: {
    backgroundColor: '#fbf2e7',
    borderRadius: 14,
    padding: 12,
    marginTop: 8,
    gap: 2,
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
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  primaryBtn: {
    flex: 1,
    borderRadius: 999,
    backgroundColor: colors.accent,
    paddingVertical: 10,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.white,
  },
  secondaryBtn: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#ecd8bf',
    backgroundColor: colors.white,
    paddingVertical: 10,
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
  },
});
