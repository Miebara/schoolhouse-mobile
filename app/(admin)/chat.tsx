import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { chatService } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { Colors } from '../../constants/colors';

interface Chat { id: string; type: string; name?: string; members: any[]; messages: any[]; }

export default function ChatListScreen() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chatService.getMyChats().then(r => { setChats(r.data.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  function getChatName(chat: Chat) {
    if (chat.name) return chat.name;
    const other = chat.members?.find((m: any) => m.userId !== user?.id);
    if (other?.user) return `${other.user.firstName} ${other.user.lastName}`;
    return 'Chat';
  }

  if (loading) return <View style={styles.center}><ActivityIndicator color={Colors.primary} /></View>;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Messages</Text>
      {chats.length === 0 && <Text style={styles.empty}>No conversations yet</Text>}
      <FlatList
        data={chats}
        keyExtractor={c => c.id}
        renderItem={({ item }) => {
          const lastMsg = item.messages?.[0];
          return (
            <TouchableOpacity style={styles.chatItem} onPress={() => router.push({ pathname: '/(admin)/chat-room', params: { chatId: item.id, name: getChatName(item) } } as any)}>
              <View style={styles.chatAvatar}>
                <Text style={styles.chatAvatarText}>{getChatName(item)[0]}</Text>
              </View>
              <View style={styles.chatInfo}>
                <Text style={styles.chatName}>{getChatName(item)}</Text>
                {lastMsg && <Text style={styles.lastMsg} numberOfLines={1}>{lastMsg.body}</Text>}
              </View>
              {lastMsg && <Text style={styles.time}>{new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>}
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '800', color: Colors.text, padding: 20, paddingBottom: 12 },
  empty: { textAlign: 'center', color: Colors.textSecondary, marginTop: 60 },
  chatItem: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: Colors.card, borderBottomWidth: 1, borderBottomColor: Colors.border },
  chatAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  chatAvatarText: { color: Colors.primary, fontWeight: '700', fontSize: 18 },
  chatInfo: { flex: 1 },
  chatName: { fontSize: 15, fontWeight: '700', color: Colors.text },
  lastMsg: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  time: { fontSize: 11, color: Colors.textLight },
});
