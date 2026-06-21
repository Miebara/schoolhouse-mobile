import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, RefreshControl, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/authStore';
import { noticeService, classService } from '../../services/api';
import { Colors } from '../../constants/colors';

export default function TeacherDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [notices, setNotices] = useState<any[]>([]);
  const [myClasses, setMyClasses] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    const [nr, cr] = await Promise.allSettled([noticeService.getAll(), classService.getAll()]);
    if (nr.status === 'fulfilled') setNotices(nr.value.data.data.slice(0, 3));
    if (cr.status === 'fulfilled') {
      const all: any[] = cr.value.data.data;
      setMyClasses(all.filter((c: any) => c.teachers.some((t: any) => t.userId === user?.id)));
    }
  }

  useEffect(() => { load(); }, []);
  async function onRefresh() { setRefreshing(true); await load(); setRefreshing(false); }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View style={styles.header}>
          <View>
            <Text style={styles.welcome}>Welcome, {user?.firstName} 👋</Text>
            <Text style={styles.school}>{user?.school?.name}</Text>
          </View>
          {user?.photo
            ? <Image source={{ uri: user.photo }} style={styles.avatar} />
            : <View style={styles.avatarFallback}><Text style={styles.avatarText}>{user?.firstName?.[0]}{user?.lastName?.[0]}</Text></View>}
        </View>

        <Text style={styles.section}>My Classes</Text>
        {myClasses.length === 0
          ? <Text style={styles.empty}>No classes assigned yet</Text>
          : myClasses.map(c => (
            <TouchableOpacity key={c.id} style={styles.classCard}>
              <Ionicons name="book" size={24} color={Colors.success} />
              <View style={styles.classInfo}>
                <Text style={styles.className}>{c.name}</Text>
                <Text style={styles.classCount}>{c._count?.children ?? 0} students</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
            </TouchableOpacity>
          ))}

        <Text style={styles.section}>Latest Notices</Text>
        {notices.map(n => (
          <View key={n.id} style={styles.noticeCard}>
            <Text style={styles.noticeTitle}>{n.title}</Text>
            <Text style={styles.noticeBody} numberOfLines={2}>{n.body}</Text>
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
  avatarFallback: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.success, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '700' },
  section: { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 10, marginTop: 8 },
  empty: { color: Colors.textSecondary, fontSize: 14, marginBottom: 16 },
  classCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: 12, padding: 14, marginBottom: 8, gap: 12 },
  classInfo: { flex: 1 },
  className: { fontSize: 15, fontWeight: '700', color: Colors.text },
  classCount: { fontSize: 12, color: Colors.textSecondary },
  noticeCard: { backgroundColor: Colors.card, borderRadius: 12, padding: 14, marginBottom: 8 },
  noticeTitle: { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  noticeBody: { fontSize: 13, color: Colors.textSecondary },
});
