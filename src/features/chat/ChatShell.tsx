import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ChatSidebar } from './ChatSidebar';
import { ChatWindow } from './ChatWindow';
import { ChatComposer } from './ChatComposer';
import { useChat } from '../../hooks/useChat';

export function ChatShell() {
  const chat = useChat();

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <ChatSidebar
            sessions={chat.sessions}
            activeId={chat.chatSessionId}
            cartCount={chat.cart?.itemCount ?? 0}
            onNewOrder={chat.startNewOrder}
            onSelectSession={chat.openSession}
            onDeleteSession={chat.deleteSession}
            onClearSessions={chat.clearAllSessions}
          />
          <View style={styles.main}>
            <ChatWindow
              messages={chat.messages}
              cart={chat.cart}
              loading={chat.loading || chat.sending}
              idle={chat.isIdle}
              stage={chat.stage}
            />
            {!chat.isIdle && (
              <View style={styles.composerWrapper}>
                <ChatComposer
                  disabled={chat.sending || !chat.chatSessionId}
                  onSend={chat.sendMessage}
                  stage={chat.stage}
                  onNewOrder={chat.startNewOrder}
                />
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1, backgroundColor: '#faf6ef' },
  container: { flex: 1, flexDirection: 'row' },
  main: { flex: 1, flexDirection: 'column' },
  composerWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#faf6ef',
  },
});
