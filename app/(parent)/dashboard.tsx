import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, RefreshControl, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/authStore';
import { noticeService } from '../../services/api';
import { Colors } from '../../constants/colors';

export default function ParentDashboard() {
  const { user } = useAuthStore();
  const [notices, setNotices] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    try { const r = await noticeService.getAll(); setNotices(r.data.data.slice(0, 3)); } catch {}
  }
  useEffect(() => { load(); }, []);
  async function onRefresh() { setRefreshing(true); await load(); setRefreshing(false); }

  const children = user?.children ?? [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View style={styles.header}>
          <View>
            <Text style={styles.welcome}>Hi, {user?.firstName} 👋</Text>
            <Text style={styles.school}>{user?.school?.name}</Text>
          </View>
          {user?.photo
            ? <Image source={{ uri: user.photo }} style={styles.avatar} />
            : <View style={[styles.avatarFallback, { backgroundColor: Colors.secondary }]}><Text style={styles.avatarText}>{user?.firstName?.[0]}{user?.lastName?.[0]}</Text></View>}
        </View>

        <Text style={styles.section}>My Children</Text>
        {(children as any[]).length === 0
          ? <Text style={styles.empty}>No children registered</Text>
          : (children as any[]).map((pc: any) => (
            <View key={pc.childId} style={styles.childCard}>
              {pc.child?.photo
                ? <Image source={{ uri: pc.child.photo }} style={styles.childAvatar} />
                : <View style={[styles.childAvatar, styles.childAvatarFallback]}><Text style={styles.childAvatarText}>{pc.child?.firstName?.[0]}</Text></View>}
              <View>
                <Text style={styles.childName}>{pc.child?.firstName} {pc.child?.surname}</Text>
                <Text style={styles.childClass}>Class: {pc.child?.class?.name}</Text>
              </View>
            </View>
          ))}

        <Text style={styles.section}>School Notices</Text>
        {notices.length === 0 && <Text style={styles.empty}>No notices</Text>}
        {notices.map(n => (
          <View key={n.id} style={styles.noticeCard}>
            <Text style={styles.noticeTitle}>{n.title}</Text>
            <Text style={styles.noticeBody} numberOfLines={2}>{n.body}</Text>
            <Text style={styles.noticeDate}>{new Date(n.createdAt).toDateString()}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  inner: { padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  welcome: { fontSize: 20, fontWeight: '800', color: Colors.text },
  school: { fontSize: 13, color: Colors.textSecondary },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  avatarFallback: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '700' },
  section: { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 10, marginTop: 8 },
  empty: { color: Colors.textSecondary, fontSize: 14, marginBottom: 12 },
  childCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: 12, padding: 14, marginBottom: 8, gap: 12 },
  childAvatar: { width: 48, height: 48, borderRadius: 24 },
  childAvatarFallback: { backgroundColor: Colors.secondaryLight, alignItems: 'center', justifyContent: 'center' },
  childAvatarText: { color: Colors.secondary, fontWeight: '700', fontSize: 18 },
  childName: { fontSize: 15, fontWeight: '700', color: Colors.text },
  childClass: { fontSize: 12, color: Colors.textSecondary },
  noticeCard: { backgroundColor: Colors.card, borderRadius: 12, padding: 14, marginBottom: 8 },
  noticeTitle: { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  noticeBody: { fontSize: 13, color: Colors.textSecondary },
  noticeDate: { fontSize: 11, color: Colors.textLight, marginTop: 4 },
});
