import { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Keyboard } from 'react-native';
import { colors, borderRadius } from '../../theme';

export function ChatComposer({
  disabled,
  onSend,
  stage,
  onNewOrder,
  idle,
}: {
  disabled?: boolean;
  onSend: (text: string) => void;
  stage?: string;
  onNewOrder?: () => void;
  idle?: boolean;
}) {
  const [text, setText] = useState('');

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
    Keyboard.dismiss();
  }

  if (idle) return null;

  if (stage === 'completed' || stage === 'cancelled') {
    return (
      <View style={styles.endedContainer}>
        <Text style={styles.endedText}>
          {stage === 'completed'
            ? 'Pesanan selesai diproses!'
            : 'Pesanan dibatalkan'}
        </Text>
        {onNewOrder && (
          <TouchableOpacity style={styles.newBtn} onPress={onNewOrder}>
            <Text style={styles.newBtnText}>Pesanan Baru</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Ketik pesan..."
          placeholderTextColor={colors.textMuted}
          multiline
          maxLength={1000}
          editable={!disabled}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!text.trim() || disabled) && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!text.trim() || disabled}
        >
          <Text style={styles.sendBtnText}>Kirim</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
    maxHeight: 120,
  },
  sendBtn: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.full,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginBottom: 2,
    marginRight: 2,
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  sendBtnText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  endedContainer: {
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  endedText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  newBtn: {
    backgroundColor: colors.green,
    borderRadius: borderRadius.full,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  newBtnText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
});
