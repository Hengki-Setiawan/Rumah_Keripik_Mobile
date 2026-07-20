import { useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ListRenderItemInfo,
  ActivityIndicator,
} from 'react-native';
import type { ChatMessageDto, ChatCartDto } from '../../lib/types';
import { colors } from '../../theme';
import { ChatMessage } from './ChatMessage';
import { ChatComposer } from './ChatComposer';

const starterPrompts = [
  { label: 'Lihat produk', value: 'Lihat produk' },
  { label: 'Rekomendasi pedas', value: 'Rekomendasi pedas' },
  { label: 'Cek pesanan', value: 'Cek pesanan' },
];

export function ChatWindow({
  messages,
  cart,
  loading,
  idle,
  stage,
  onSend,
  onAction,
  onNewOrder,
}: {
  messages: ChatMessageDto[];
  cart?: ChatCartDto | null;
  loading?: boolean;
  idle?: boolean;
  stage?: string;
  onSend: (text: string) => void;
  onAction: (action: string, payload?: Record<string, unknown>) => void;
  onNewOrder?: () => void;
}) {
  const listRef = useRef<FlatList<ChatMessageDto>>(null);

  const scrollToEnd = useCallback(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  useEffect(() => {
    scrollToEnd();
  }, [messages.length, loading]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ChatMessageDto>) => (
      <ChatMessage
        message={item}
        cart={cart}
        onSend={onSend}
        onAction={onAction}
      />
    ),
    [cart, onSend, onAction],
  );

  const keyExtractor = useCallback((item: ChatMessageDto) => item.id, []);

  if (idle) {
    return (
      <View style={styles.idleContainer}>
        <Text style={styles.idleTitle}>
          Mau pesan keripik apa{'\n'}hari ini?
        </Text>
        <Text style={styles.idleSubtitle}>
          Pilih rasa, atur jumlah, dan checkout lewat percakapan.
        </Text>
        <View style={styles.starterRow}>
          {starterPrompts.map((item) => (
            <View key={item.label} style={styles.starterChip}>
              <Text
                style={styles.starterChipText}
                onPress={() => onSend(item.value)}
              >
                {item.label}
              </Text>
            </View>
          ))}
        </View>
        <View style={styles.idleComposer}>
          <ChatComposer idle onSend={onSend} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={scrollToEnd}
      />
      {loading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={colors.accent} />
          <Text style={styles.loadingText}>Menjawab...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  idleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  idleTitle: {
    fontSize: 32,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 12,
  },
  idleSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  starterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  starterChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,250,244,0.88)',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  starterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  idleComposer: {
    width: '100%',
    maxWidth: 400,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  loadingText: {
    fontSize: 13,
    color: colors.textMuted,
  },
});
