import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, Alert, ActivityIndicator, SafeAreaView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { postService } from '../../services/api';
import { Colors } from '../../constants/colors';
import { useAuthStore } from '../../stores/authStore';

interface Post { id: string; body: string; title?: string; createdAt: string; author: { firstName: string; lastName: string; photo?: string; role: string }; comments: any[]; }

export default function PostsScreen() {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    try { const r = await postService.getAll(); setPosts(r.data.data); }
    catch {}
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function create() {
    if (!body.trim()) return;
    setSaving(true);
    try { await postService.create({ body }); setShowModal(false); setBody(''); load(); }
    catch (err: any) { Alert.alert('Error', err.message); }
    setSaving(false);
  }

  if (loading) return <View style={styles.center}><ActivityIndicator color={Colors.primary} /></View>;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Posts</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
          <Ionicons name="create-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={posts}
        keyExtractor={p => p.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              {item.author.photo
                ? <Image source={{ uri: item.author.photo }} style={styles.avatar} />
                : <View style={styles.avatarFallback}><Text style={styles.avatarInitials}>{item.author.firstName[0]}{item.author.lastName[0]}</Text></View>}
              <View>
                <Text style={styles.authorName}>{item.author.firstName} {item.author.lastName}</Text>
                <Text style={styles.role}>{item.author.role} · {new Date(item.createdAt).toDateString()}</Text>
              </View>
            </View>
            {item.title && <Text style={styles.postTitle}>{item.title}</Text>}
            <Text style={styles.postBody}>{item.body}</Text>
            <Text style={styles.commentCount}>{item.comments?.length ?? 0} comments</Text>
          </View>
        )}
        contentContainerStyle={{ padding: 16, gap: 12 }}
      />
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create Post</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}><Ionicons name="close" size={24} /></TouchableOpacity>
          </View>
          <TextInput style={[styles.input, { height: 160 }]} value={body} onChangeText={setBody} placeholder="What's on your mind?" multiline textAlignVertical="top" />
          <TouchableOpacity style={styles.saveBtn} onPress={create} disabled={saving}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Post</Text>}
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  title: { fontSize: 22, fontWeight: '800', color: Colors.text },
  addBtn: { backgroundColor: Colors.primary, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: Colors.card, borderRadius: 14, padding: 16 },
  cardTop: { flexDirection: 'row', gap: 10, marginBottom: 10, alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  avatarFallback: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { color: Colors.primary, fontWeight: '700' },
  authorName: { fontSize: 14, fontWeight: '700', color: Colors.text },
  role: { fontSize: 11, color: Colors.textSecondary },
  postTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 6 },
  postBody: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
  commentCount: { fontSize: 12, color: Colors.primary, marginTop: 8 },
  modal: { flex: 1, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: Colors.text },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: 10, padding: 13, fontSize: 15 },
  saveBtn: { backgroundColor: Colors.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 12 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
