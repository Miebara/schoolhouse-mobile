import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { noticeService } from '../../services/api';
import { Colors } from '../../constants/colors';

interface Notice { id: string; title: string; body: string; createdAt: string; author: { firstName: string; lastName: string }; comments: any[]; }

export default function NoticesScreen() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', body: '' });
  const [saving, setSaving] = useState(false);

  async function load() {
    try { const r = await noticeService.getAll(); setNotices(r.data.data); }
    catch {}
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function create() {
    if (!form.title || !form.body) return Alert.alert('Error', 'Title and content required');
    setSaving(true);
    try {
      await noticeService.create(form);
      setShowModal(false);
      setForm({ title: '', body: '' });
      load();
    } catch (err: any) { Alert.alert('Error', err.message); }
    setSaving(false);
  }

  async function deleteNotice(id: string) {
    Alert.alert('Delete', 'Delete this notice?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await noticeService.delete(id); load(); } },
    ]);
  }

  if (loading) return <View style={styles.center}><ActivityIndicator color={Colors.primary} /></View>;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notice Board</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
          <Ionicons name="add" size={20} color="#fff" /><Text style={styles.addText}>New</Text>
        </TouchableOpacity>
      </View>

      {notices.length === 0 && <Text style={styles.empty}>No notices yet</Text>}
      <FlatList
        data={notices}
        keyExtractor={n => n.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.noticeTitle}>{item.title}</Text>
              <TouchableOpacity onPress={() => deleteNotice(item.id)}><Ionicons name="trash-outline" size={18} color={Colors.error} /></TouchableOpacity>
            </View>
            <Text style={styles.body}>{item.body}</Text>
            <View style={styles.meta}>
              <Text style={styles.author}>by {item.author.firstName} {item.author.lastName}</Text>
              <Text style={styles.date}>{new Date(item.createdAt).toDateString()}</Text>
            </View>
            <Text style={styles.comments}>{item.comments?.length ?? 0} comment{item.comments?.length !== 1 ? 's' : ''}</Text>
          </View>
        )}
        contentContainerStyle={{ padding: 16, gap: 12 }}
      />

      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>New Notice</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}><Ionicons name="close" size={24} color={Colors.text} /></TouchableOpacity>
          </View>
          <Text style={styles.label}>Title</Text>
          <TextInput style={styles.input} value={form.title} onChangeText={t => setForm(f => ({ ...f, title: t }))} placeholder="Notice title" />
          <Text style={styles.label}>Content</Text>
          <TextInput style={[styles.input, styles.textarea]} value={form.body} onChangeText={t => setForm(f => ({ ...f, body: t }))} placeholder="Write your notice..." multiline numberOfLines={6} textAlignVertical="top" />
          <TouchableOpacity style={styles.saveBtn} onPress={create} disabled={saving}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Post Notice</Text>}
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
  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, gap: 4 },
  addText: { color: '#fff', fontWeight: '600' },
  empty: { textAlign: 'center', color: Colors.textSecondary, marginTop: 60 },
  card: { backgroundColor: Colors.card, borderRadius: 14, padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  noticeTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, flex: 1, marginRight: 8 },
  body: { fontSize: 14, color: Colors.textSecondary, marginBottom: 10, lineHeight: 20 },
  meta: { flexDirection: 'row', justifyContent: 'space-between' },
  author: { fontSize: 12, color: Colors.textSecondary },
  date: { fontSize: 12, color: Colors.textSecondary },
  comments: { fontSize: 12, color: Colors.primary, marginTop: 6 },
  modal: { flex: 1, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: Colors.text },
  label: { fontSize: 13, fontWeight: '600', color: Colors.text, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: 10, padding: 13, fontSize: 15, marginBottom: 16 },
  textarea: { height: 140 },
  saveBtn: { backgroundColor: Colors.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
