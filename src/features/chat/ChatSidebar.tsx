import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import type { ChatSessionSummary } from '../../lib/types';
import { colors, borderRadius, spacing } from '../../theme';

export function ChatSidebar({
  sessions,
  activeId,
  cartCount,
  onNewOrder,
  onSelectSession,
  onDeleteSession,
  onClearSessions,
}: {
  sessions: ChatSessionSummary[];
  activeId?: string;
  cartCount: number;
  onNewOrder?: () => void;
  onSelectSession?: (id: string) => void;
  onDeleteSession?: (id: string) => void;
  onClearSessions?: () => void;
}) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.newOrderBtn} onPress={onNewOrder}>
        <Text style={styles.newOrderIcon}>+</Text>
      </TouchableOpacity>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {sessions.length === 0 ? (
          <Text style={styles.emptyText}>Belum ada riwayat</Text>
        ) : (
          sessions.map((session) => (
            <TouchableOpacity
              key={session.id}
              style={[
                styles.sessionItem,
                activeId === session.id && styles.sessionItemActive,
              ]}
              onPress={() => onSelectSession?.(session.id)}
              onLongPress={() => onDeleteSession?.(session.id)}
            >
              <Text style={styles.sessionTitle} numberOfLines={1}>
                {session.title || 'Pesanan Baru'}
              </Text>
              <Text style={styles.sessionStatus}>
                {statusLabel(session.status)}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {cartCount > 0 && (
        <View style={styles.cartBadge}>
          <Text style={styles.cartBadgeText}>{cartCount}</Text>
        </View>
      )}

      {sessions.length > 0 && onClearSessions && (
        <TouchableOpacity style={styles.clearBtn} onPress={onClearSessions}>
          <Text style={styles.clearBtnText}>Hapus semua</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function statusLabel(status: string) {
  switch (status) {
    case 'needs_admin': return 'Perlu admin';
    case 'closed': return 'Selesai';
    case 'archived': return 'Arsip';
    default: return 'Aktif';
  }
}

const styles = StyleSheet.create({
  container: {
    width: 72,
    backgroundColor: colors.surfaceDark,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  newOrderBtn: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  newOrderIcon: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 26,
  },
  list: { flex: 1, width: '100%', paddingHorizontal: 8 },
  emptyText: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  sessionItem: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.md,
    marginBottom: 4,
    alignItems: 'center',
  },
  sessionItemActive: {
    backgroundColor: colors.accentLight,
  },
  sessionTitle: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  sessionStatus: {
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 2,
  },
  cartBadge: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.full,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cartBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  clearBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  clearBtnText: {
    fontSize: 10,
    color: colors.accent,
    fontWeight: '500',
  },
});
