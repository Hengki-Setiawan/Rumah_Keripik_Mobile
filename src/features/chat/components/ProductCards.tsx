import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, borderRadius } from '../../../theme';
import { formatRupiah } from '../../../lib/utils';
import * as api from '../../../lib/api-client';
import type { ProductCardsComponent, ProductDto } from '../../../lib/types';

export function ProductCards({
  component,
  onAction,
}: {
  component: ProductCardsComponent;
  onAction: (action: string, payload?: Record<string, unknown>) => void;
}) {
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api.getProducts().then((all) => {
      if (cancelled) return;
      const ids = new Set(component.productIds);
      setProducts((all as ProductDto[]).filter((p) => ids.has(p.id)));
      setLoading(false);
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [component.productIds]);

  if (loading) {
    return (
      <View style={styles.card}>
        <ActivityIndicator size="small" color={colors.accent} />
      </View>
    );
  }

  if (products.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.emptyText}>Produk belum tersedia.</Text>
      </View>
    );
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      {products.map((product) => {
        const variant = product.variants.find((v) => v.stock > 0) || product.variants[0];
        const stock = variant?.stock ?? product.stock;
        const price = variant?.price ?? product.price;
        const imageUrl = variant?.imageUrl || product.imageUrl;

        return (
          <View key={product.id} style={styles.productCard}>
            <Image
              source={{ uri: imageUrl || undefined }}
              style={styles.productImage}
              resizeMode="cover"
            />
            <View style={styles.productInfo}>
              <View style={styles.productHeader}>
                <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
                {product.categoryName && (
                  <Text style={styles.categoryBadge}>{product.categoryName}</Text>
                )}
              </View>
              <Text style={styles.productDesc} numberOfLines={2}>
                {product.description || ''}
              </Text>
              <Text style={styles.productPrice}>{formatRupiah(price)}</Text>
              <Text style={[styles.stockText, stock > 0 ? styles.inStock : styles.outStock]}>
                {stock > 0 ? `Stok ${stock}` : 'Stok habis'}
              </Text>
              <TouchableOpacity
                style={[styles.addBtn, stock <= 0 && styles.addBtnDisabled]}
                disabled={stock <= 0}
                onPress={() => onAction('add_to_cart', { productId: product.id, variantId: variant?.id, quantity: 1 })}
              >
                <Text style={styles.addBtnText}>{stock > 0 ? 'Tambah' : 'Habis'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,250,244,0.88)',
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
  scroll: {
    paddingVertical: 4,
    gap: 12,
  },
  productCard: {
    width: 200,
    backgroundColor: 'rgba(255,250,244,0.9)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 120,
    backgroundColor: colors.surfaceDark,
  },
  productInfo: {
    padding: 12,
    gap: 4,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  categoryBadge: {
    fontSize: 9,
    color: colors.accent,
    backgroundColor: colors.accentLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    overflow: 'hidden',
    marginLeft: 4,
  },
  productDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.accent,
  },
  stockText: {
    fontSize: 11,
    fontWeight: '500',
  },
  inStock: { color: colors.green },
  outStock: { color: '#dc2626' },
  addBtn: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  addBtnDisabled: {
    backgroundColor: '#d7c8ba',
  },
  addBtnText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 13,
  },
});
