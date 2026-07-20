import { View, Text, StyleSheet } from 'react-native';
import type { ChatMessageDto, ChatCartDto } from '../../lib/types';
import { colors, borderRadius } from '../../theme';
import { QuickReplies } from './components/QuickReplies';

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
  const isAssistant = message.role === 'assistant';

  return (
    <View style={[styles.container, isUser && styles.containerUser]}>
      {isAssistant && (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>RK</Text>
        </View>
      )}
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
        {message.content ? (
          <Text style={[styles.text, isUser && styles.textUser]}>
            {message.content}
          </Text>
        ) : null}
        {message.components?.map((comp, i) => {
          if (comp.type === 'quick_replies') {
            return (
              <QuickReplies
                key={`qr-${i}`}
                options={comp.options}
                onSend={onSend}
                onAction={onAction}
              />
            );
          }
          return null;
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  containerUser: {
    justifyContent: 'flex-end',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.accentLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 4,
  },
  avatarText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.accent,
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: borderRadius.lg,
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
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
  },
  textUser: {
    color: colors.text,
  },
});
