import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Share } from 'react-native';
import type { ChatMessageDto, ChatCartDto } from '../../lib/types';
import { colors, borderRadius } from '../../theme';
import { ChatComponentRenderer } from './ChatComponentRenderer';

export function ChatMessage({
  message,
  cart,
  onSend,
  onAction,
}: {
  message: ChatMessageDto;
  cart?: ChatCartDto | null;
  onSend: (text: string) => void;
  onAction: (action: string, payload?: Record<string, unknown>) => void;
}) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  const hasText = Boolean(message.content?.trim());
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'helpful' | 'not_helpful' | null>(null);

  async function copyMessage() {
    if (!message.content) return;
    await Share.share({ message: message.content });
  }

  function submitFeedback(type: 'helpful' | 'not_helpful') {
    if (feedback) return;
    const rating = type === 'helpful' ? 5 : 2;
    onAction('message_feedback', { messageId: message.id, rating, label: type });
    setFeedback(type);
  }

  const hasComponents = message.components && message.components.length > 0;

  return (
    <View style={[styles.container, isUser && styles.containerUser]}>
      {!isUser && (
        <View style={[styles.avatar, isSystem && styles.avatarSystem]}>
          <Text style={styles.avatarText}>{isSystem ? 'S' : 'RK'}</Text>
        </View>
      )}

      <View style={[styles.bubble, isUser ? styles.bubbleUser : isSystem ? styles.bubbleSystem : styles.bubbleAssistant]}>
        {hasText && (
          <Text style={[styles.text, isUser && styles.textUser, isSystem && styles.textSystem]}>
            {message.content}
          </Text>
        )}

        {!isUser && !isSystem && hasText && (
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={copyMessage}>
              <Text style={styles.actionText}>{copied ? 'Tersalin' : 'Salin'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => onSend('Jelaskan lagi dengan lebih ringkas')}
            >
              <Text style={styles.actionText}>Ulang</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, feedback === 'helpful' && styles.actionActive]}
              onPress={() => submitFeedback('helpful')}
            >
              <Text style={styles.actionText}>👍</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, feedback === 'not_helpful' && styles.actionActive]}
              onPress={() => submitFeedback('not_helpful')}
            >
              <Text style={styles.actionText}>👎</Text>
            </TouchableOpacity>
          </View>
        )}

        {hasComponents && (
          <ChatComponentRenderer
            components={message.components}
            cart={cart}
            onSend={onSend}
            onAction={onAction}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  containerUser: {
    justifyContent: 'flex-end',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.accentLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  avatarSystem: {
    borderWidth: 1,
    borderColor: '#e7dccb',
    backgroundColor: '#fffaf3',
  },
  avatarText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.accent,
  },
  bubble: {
    maxWidth: '85%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleUser: {
    backgroundColor: colors.accentLight,
    borderBottomRightRadius: 4,
  },
  bubbleAssistant: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  bubbleSystem: {
    backgroundColor: '#f7efe1',
    borderWidth: 1,
    borderColor: '#e7dccb',
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
  },
  textUser: {
    color: colors.text,
  },
  textSystem: {
    color: '#665444',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  actionBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#f8efe2',
  },
  actionActive: {
    backgroundColor: '#eef6dd',
  },
  actionText: {
    fontSize: 11,
    color: '#8a7562',
    fontWeight: '500',
  },
});
