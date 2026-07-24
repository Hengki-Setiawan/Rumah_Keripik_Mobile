import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Sparkles, Send, Flame, Package, Truck, Tag, Plus, Check, Mic, MicOff } from 'lucide-react-native';
import { sendChatMessage, ChatMessage } from '../lib/ai-api';
import { useCart } from '../lib/cart-context';

const STARTER_CHIPS = [
  { id: '1', label: '🔥 Produk Terlaris', query: 'Apa rekomendasi keripik paling enak & terlaris?' },
  { id: '2', label: '📦 Pesan 2 Pack Pedas', query: 'Saya mau pesan 2 pack keripik singkong pedas manis' },
  { id: '3', label: '🚚 Lacak Pesananku', query: 'Tolong cek status pesanan saya terbaru' },
  { id: '4', label: '📋 Lihat Katalog', query: 'Daftar menu keripik lengkap & harganya' },
];

export function AiChatWorkspace() {
  const { addToCart } = useCart();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text:
        'Halo Kak! Selamat datang di *AI Agent Rumah Keripik* 👋🍿\n\n' +
        'Saya asisten pintar yang siap bantu Kakak pilih keripik renyah, pesan otomatis, hingga lacak kurir real-time.\n\n' +
        'Ada yang bisa saya bantu hari ini?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const toggleVoiceRecording = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);
      setTimeout(() => {
        setInputText('Rekomendasi keripik pisang paling gurih');
        setIsRecording(false);
      }, 1500);
    }
  };

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputText;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInputText('');
    setLoading(true);

    try {
      const result = await sendChatMessage('628123456789', textToSend.trim());
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: result.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        productCard: result.productCard,
        orderSummary: result.orderSummary,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'Maaf kak, ada gangguan koneksi. Silakan coba lagi ya 🙏',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages, loading]);

  const renderMessageItem = ({ item }: { item: ChatMessage }) => {
    const isUser = item.sender === 'user';

    return (
      <View style={[styles.messageBubbleContainer, isUser ? styles.userBubbleAlign : styles.aiBubbleAlign]}>
        {!isUser && (
          <View style={styles.aiAvatar}>
            <Sparkles size={14} color="#ffffff" />
          </View>
        )}
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
          <Text style={[styles.messageText, isUser ? styles.userMessageText : styles.aiMessageText]}>
            {item.text}
          </Text>
          <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.aiTimestamp]}>
            {item.timestamp}
          </Text>

          {/* Embedded Product Card */}
          {item.productCard && (
            <View style={styles.embeddedCard}>
              <View style={styles.embeddedCardHeader}>
                <Tag size={16} color="#d97706" />
                <Text style={styles.embeddedCardTitle}>{item.productCard.nama_produk}</Text>
              </View>
              <Text style={styles.embeddedCardPrice}>
                Rp {item.productCard.harga_jual.toLocaleString('id-ID')}
              </Text>
              <TouchableOpacity
                style={styles.embeddedAddBtn}
                onPress={() =>
                  addToCart({
                    id_produk: item.productCard!.id_produk,
                    nama_produk: item.productCard!.nama_produk,
                    harga_jual: item.productCard!.harga_jual,
                    stok_gudang_utama: item.productCard!.stok,
                  })
                }
              >
                <Plus size={14} color="#ffffff" />
                <Text style={styles.embeddedAddBtnText}>Tambah ke Keranjang</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Embedded Order Card */}
          {item.orderSummary && (
            <View style={styles.embeddedCard}>
              <View style={styles.embeddedCardHeader}>
                <Truck size={16} color="#059669" />
                <Text style={styles.embeddedCardTitle}>Kode: {item.orderSummary.kode_pesanan}</Text>
              </View>
              <Text style={styles.embeddedCardStatus}>Status: {item.orderSummary.status}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Agent Workspace Top Bar */}
      <View style={styles.agentHeader}>
        <View style={styles.agentInfo}>
          <View style={styles.agentIconBadge}>
            <Sparkles size={16} color="#ffffff" />
          </View>
          <View>
            <Text style={styles.agentName}>AI Agent Workspace 🤖</Text>
            <Text style={styles.agentStatus}>Groq + Gemini RAG Engine (Active)</Text>
          </View>
        </View>
      </View>

      {/* Message Stream */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessageItem}
        contentContainerStyle={styles.chatListContent}
        ListFooterComponent={
          loading ? (
            <View style={styles.typingContainer}>
              <View style={styles.aiAvatar}>
                <Sparkles size={14} color="#ffffff" />
              </View>
              <View style={styles.typingBubble}>
                <ActivityIndicator size="small" color="#d97706" />
                <Text style={styles.typingText}>AI sedang merancang jawaban...</Text>
              </View>
            </View>
          ) : null
        }
      />

      {/* Starter Chips Bar */}
      <View style={styles.chipsContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={STARTER_CHIPS}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.chip} onPress={() => handleSend(item.query)}>
              <Text style={styles.chipText}>{item.label}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Input Box */}
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={[styles.micBtn, isRecording ? styles.micBtnActive : null]}
          onPress={toggleVoiceRecording}
        >
          {isRecording ? <MicOff size={18} color="#dc2626" /> : <Mic size={18} color="#78350f" />}
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder={isRecording ? 'Mendengarkan suara...' : "Tanyakan stok, rasa, atau ketik 'Pesan 2 pack'..."}
          placeholderTextColor={isRecording ? '#dc2626' : '#a16207'}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={() => handleSend()}
        />
        <TouchableOpacity
          style={[styles.sendBtn, !inputText.trim() ? styles.sendBtnDisabled : null]}
          onPress={() => handleSend()}
          disabled={!inputText.trim() || loading}
        >
          <Send size={18} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffbeb',
  },
  agentHeader: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#fde68a',
  },
  agentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  agentIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#d97706',
    justifyContent: 'center',
    alignItems: 'center',
  },
  agentName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#78350f',
  },
  agentStatus: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '600',
  },
  chatListContent: {
    padding: 14,
    paddingBottom: 20,
  },
  messageBubbleContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  userBubbleAlign: {
    justifyContent: 'flex-end',
  },
  aiBubbleAlign: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#d97706',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
    marginBottom: 2,
  },
  messageBubble: {
    maxWidth: '82%',
    borderRadius: 16,
    padding: 12,
    elevation: 1,
  },
  userBubble: {
    backgroundColor: '#d97706',
    borderBottomRightRadius: 2,
  },
  aiBubble: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#ffffff',
  },
  aiMessageText: {
    color: '#78350f',
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  userTimestamp: {
    color: '#fef3c7',
  },
  aiTimestamp: {
    color: '#a16207',
  },
  embeddedCard: {
    backgroundColor: '#fffbeb',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  embeddedCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  embeddedCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#78350f',
  },
  embeddedCardPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#d97706',
    marginTop: 4,
  },
  embeddedCardStatus: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '700',
    marginTop: 4,
  },
  embeddedAddBtn: {
    backgroundColor: '#d97706',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  embeddedAddBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  typingBubble: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  typingText: {
    fontSize: 12,
    color: '#92400e',
  },
  chipsContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fffbeb',
  },
  chip: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#78350f',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#fde68a',
  },
  input: {
    flex: 1,
    backgroundColor: '#fffbeb',
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 42,
    fontSize: 13,
    color: '#78350f',
    borderWidth: 1,
    borderColor: '#fde68a',
    marginRight: 8,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#d97706',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#fcd34d',
  },
  micBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  micBtnActive: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
  },
});
