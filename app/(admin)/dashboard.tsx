import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList, RefreshControl, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/authStore';
import { schoolService, noticeService } from '../../services/api';
import { Colors } from '../../constants/colors';

interface Stats { teachers: number; parents: number; students: number; classes: number; requests: number; }
interface Notice { id: string; title: string; body: string; createdAt: string; }

const TILES = [
  { key: 'teachers', label: 'Teachers', icon: 'person', colors: Colors.teachers, route: '/(admin)/users?role=TEACHER' },
  { key: 'parents', label: 'Parents', icon: 'shield', colors: Colors.parents, route: '/(admin)/users?role=PARENT' },
  { key: 'students', label: 'Students', icon: 'school', colors: Colors.students, route: '/(admin)/students' },
  { key: 'classes', label: 'Classes', icon: 'business', colors: Colors.classes, route: '/(admin)/classes' },
  { key: 'requests', label: 'Requests', icon: 'chatbubble-ellipses', colors: Colors.requests, route: '/(admin)/requests' },
  { key: 'revenue', label: 'Revenue', icon: 'cash', colors: Colors.revenue, route: '/(admin)/revenue' },
] as const;

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({ teachers: 0, parents: 0, students: 0, classes: 0, requests: 0 });
  const [notices, setNotices] = useState<Notice[]>([]);
  const [noticeIdx, setNoticeIdx] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    try {
      const [statsRes, noticeRes] = await Promise.all([schoolService.getStats(), noticeService.getAll()]);
      setStats(statsRes.data.data);
      setNotices(noticeRes.data.data.slice(0, 5));
    } catch {}
  }

  useEffect(() => { load(); }, []);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  const notice = notices[noticeIdx];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.inner}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcome}>Welcome, {user?.firstName}</Text>
            <Text style={styles.school}>{user?.school?.name}</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/(admin)/requests')}>
              <Ionicons name="notifications-outline" size={24} color={Colors.text} />
              {stats.requests > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{stats.requests}</Text></View>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(admin)/profile')}>
              {user?.photo
                ? <Image source={{ uri: user.photo }} style={styles.avatar} />
                : <View style={styles.avatarFallback}><Text style={styles.avatarText}>{user?.firstName?.[0]}{user?.lastName?.[0]}</Text></View>}
            </TouchableOpacity>
          </View>
        </View>

        {/* Notice Board */}
        {notices.length > 0 && (
          <View style={styles.noticeSection}>
            <View style={styles.noticeTitleRow}>
              <Text style={styles.sectionTitle}>NOTICE BOARD</Text>
              <TouchableOpacity onPress={() => router.push('/(admin)/notices')}>
                <Ionicons name="add" size={24} color={Colors.primary} />
              </TouchableOpacity>
            </View>
            <View style={styles.noticeCard}>
              <Text style={styles.noticeTitle}>{notice.title}</Text>
              <Text style={styles.noticeBody} numberOfLines={2}>{notice.body}</Text>
              <Text style={styles.noticeDate}>Posted: {new Date(notice.createdAt).toDateString()}</Text>
              <TouchableOpacity onPress={() => router.push(`/(admin)/notices`)}>
                <Text style={styles.readMore}>Read More</Text>
              </TouchableOpacity>
            </View>
            {notices.length > 1 && (
              <View style={styles.dots}>
                {notices.map((_, i) => (
                  <TouchableOpacity key={i} onPress={() => setNoticeIdx(i)}>
                    <View style={[styles.dot, i === noticeIdx && styles.dotActive]} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Dashboard Grid */}
        <Text style={styles.sectionTitle}>DASHBOARD</Text>
        <View style={styles.grid}>
          {TILES.map(tile => (
            <TouchableOpacity
              key={tile.key}
              style={[styles.tile, { backgroundColor: tile.colors.bg }]}
              onPress={() => router.push(tile.route as any)}
            >
              <Ionicons name={tile.icon as any} size={32} color={tile.colors.icon} />
              <Text style={[styles.tileCount, { color: tile.colors.icon }]}>
                {stats[tile.key as keyof Stats] ?? '—'}
              </Text>
              <Text style={styles.tileLabel}>{tile.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  inner: { padding: 20, paddingBottom: 32 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  welcome: { fontSize: 22, fontWeight: '800', color: Colors.text },
  school: { fontSize: 14, color: Colors.textSecondary, marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBtn: { position: 'relative' },
  badge: { position: 'absolute', top: -4, right: -4, backgroundColor: Colors.error, borderRadius: 8, width: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  avatarFallback: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  noticeSection: { marginBottom: 28 },
  noticeTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '800', letterSpacing: 1, color: Colors.text, marginBottom: 12 },
  noticeCard: { backgroundColor: '#2D2D2D', borderRadius: 18, padding: 24, alignItems: 'center' },
  noticeTitle: { fontSize: 20, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: 8 },
  noticeBody: { fontSize: 14, color: '#ccc', textAlign: 'center', marginBottom: 12 },
  noticeDate: { fontSize: 12, color: '#999', marginBottom: 12 },
  readMore: { color: Colors.primary, fontWeight: '700', fontSize: 15 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 12 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.border },
  dotActive: { backgroundColor: Colors.primary, width: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: { width: '30%', aspectRatio: 1, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 4, flexGrow: 1 },
  tileCount: { fontSize: 20, fontWeight: '800' },
  tileLabel: { fontSize: 12, fontWeight: '600', color: Colors.text },
});
