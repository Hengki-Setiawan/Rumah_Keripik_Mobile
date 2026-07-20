import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, borderRadius } from '../../../theme';

export function QuickReplies({
  options,
  onSend,
  onAction,
}: {
  options: Array<{ id: string; label: string; value: string; action: 'send_message' | 'tool_action' }>;
  onSend: (text: string) => void;
  onAction: (action: string, payload?: Record<string, unknown>) => void;
}) {
  return (
    <View style={styles.container}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.id}
          style={styles.chip}
          onPress={() => {
            if (opt.action === 'send_message') {
              onSend(opt.value);
            } else {
              onAction(opt.value);
            }
          }}
        >
          <Text style={styles.chipText}>{opt.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  chip: {
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});
