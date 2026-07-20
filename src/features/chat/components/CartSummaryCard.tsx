import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { colors, borderRadius } from '../../../theme';
import { formatRupiah } from '../../../lib/utils';
import type { ChatCartDto, CartSummaryComponent } from '../../../lib/types';

export function CartSummaryCard({
  component: _component,
  cart,
  onAction,
}: {
  component: CartSummaryComponent;
  cart?: ChatCartDto | null;
  onAction: (action: string, payload?: Record<string, unknown>) => void;
}) {
  if (!cart || cart.itemCount === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.emptyText}>Keranjang masih kosong.</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.headerIcon}>🛒</Text>
        <Text style={styles.headerTitle}>Keranjang</Text>
      </View>

      <ScrollView style={styles.itemsList} nestedScrollEnabled>
        {cart.items.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={1}>{item.productName}</Text>
              {item.variantName && (
                <Text style={styles.itemVariant}>{item.variantName}</Text>
              )}
              <Text style={styles.itemPrice}>{item.quantity} x {formatRupiah(item.unitPrice)}</Text>
            </View>
            <View style={styles.itemControls}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => onAction('update_cart_item', { itemId: item.id, quantity: item.quantity - 1 })}
              >
                <Text style={styles.qtyBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.qtyValue}>{item.quantity}</Text>
              <TouchableOpacity
                style={[styles.qtyBtn, styles.qtyBtnPrimary]}
                onPress={() => onAction('update_cart_item', { itemId: item.id, quantity: item.quantity + 1 })}
              >
                <Text style={[styles.qtyBtnText, styles.qtyBtnTextPrimary]}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.totalBox}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total item</Text>
          <Text style={styles.totalValue}>{cart.itemCount}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>{formatRupiah(cart.total)}</Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => onAction('request_location')}
        >
          <Text style={styles.secondaryBtnText}>Isi alamat</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => onAction('show_payment_methods')}
        >
          <Text style={styles.primaryBtnText}>Pilih bayar</Text>
        </TouchableOpacity>
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
  emptyText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  headerIcon: { fontSize: 18 },
  headerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  itemsList: {
    maxHeight: 200,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fbf2e7',
    borderRadius: 14,
    padding: 10,
    marginBottom: 6,
  },
  itemInfo: { flex: 1, marginRight: 8 },
  itemName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  itemVariant: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  itemPrice: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  itemControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ecd8bf',
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnPrimary: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  qtyBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  qtyBtnTextPrimary: { color: colors.white },
  qtyValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    minWidth: 20,
    textAlign: 'center',
  },
  totalBox: {
    backgroundColor: colors.accent,
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    gap: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  totalValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.white,
  },
  totalAmount: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.white,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
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
});
