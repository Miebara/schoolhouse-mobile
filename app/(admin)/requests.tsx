import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Image, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { userService } from '../../services/api';
import { Colors } from '../../constants/colors';

interface PendingUser {
  id: string; firstName: string; middleName?: string; lastName: string;
  email: string; role: string; createdAt: string; photo?: string; metadata?: any;
}

export default function RequestsScreen() {
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const res = await userService.getPending();
      setUsers(res.data.data);
    } catch {}
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function approve(userId: string, name: string) {
    Alert.alert('Approve', `Approve ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Approve', onPress: async () => {
        await userService.approve(userId);
        load();
      }},
    ]);
  }

  async function reject(userId: string, name: string) {
    Alert.alert('Reject', `Reject and remove ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reject', style: 'destructive', onPress: async () => {
        await userService.reject(userId);
        load();
      }},
    ]);
  }

  if (loading) return <View style={styles.center}><ActivityIndicator color={Colors.primary} /></View>;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Pending Requests</Text>
      {users.length === 0 && <Text style={styles.empty}>No pending requests</Text>}
      <FlatList
        data={users}
        keyExtractor={u => u.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              {item.photo
                ? <Image source={{ uri: item.photo }} style={styles.avatar} />
                : <View style={[styles.avatarFallback, { backgroundColor: item.role === 'TEACHER' ? Colors.success : Colors.secondary }]}>
                    <Text style={styles.avatarText}>{item.firstName[0]}{item.lastName[0]}</Text>
                  </View>
              }
              <View style={styles.info}>
                <Text style={styles.name}>{item.firstName} {item.middleName} {item.lastName}</Text>
                <Text style={styles.email}>{item.email}</Text>
                <View style={[styles.roleBadge, { backgroundColor: item.role === 'TEACHER' ? Colors.successLight : Colors.secondaryLight }]}>
                  <Text style={[styles.roleText, { color: item.role === 'TEACHER' ? Colors.success : Colors.secondary }]}>
                    {item.role}
                  </Text>
                </View>
              </View>
            </View>
            {item.role === 'TEACHER' && item.metadata?.staffIdFileUrl && (
              <TouchableOpacity style={styles.viewId}>
                <Ionicons name="document" size={14} color={Colors.primary} />
                <Text style={styles.viewIdText}>View Staff ID</Text>
              </TouchableOpacity>
            )}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.rejectBtn} onPress={() => reject(item.id, `${item.firstName} ${item.lastName}`)}>
                <Text style={styles.rejectText}>✕ Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.approveBtn} onPress={() => approve(item.id, `${item.firstName} ${item.lastName}`)}>
                <Text style={styles.approveText}>✓ Approve</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={{ padding: 16, gap: 12 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '800', color: Colors.text, padding: 20, paddingBottom: 8 },
  empty: { textAlign: 'center', color: Colors.textSecondary, marginTop: 60 },
  card: { backgroundColor: Colors.card, borderRadius: 16, padding: 16 },
  cardTop: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  avatarFallback: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: Colors.text },
  email: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  roleBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginTop: 4 },
  roleText: { fontSize: 11, fontWeight: '700' },
  viewId: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 12 },
  viewIdText: { color: Colors.primary, fontSize: 13 },
  actions: { flexDirection: 'row', gap: 8 },
  rejectBtn: { flex: 1, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: Colors.error, alignItems: 'center' },
  rejectText: { color: Colors.error, fontWeight: '600' },
  approveBtn: { flex: 1, padding: 10, borderRadius: 10, backgroundColor: Colors.success, alignItems: 'center' },
  approveText: { color: '#fff', fontWeight: '600' },
});
