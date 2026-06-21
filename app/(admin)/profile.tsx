import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/authStore';
import { Colors } from '../../constants/colors';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  function handleLogout() {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => { await logout(); router.replace('/'); } },
    ]);
  }

  const menuItems = [
    { icon: 'school-outline', label: 'School Settings', onPress: () => {} },
    { icon: 'people-outline', label: 'Manage Teachers', onPress: () => router.push('/(admin)/users' as any) },
    { icon: 'book-outline', label: 'Classes', onPress: () => router.push('/(admin)/classes' as any) },
    { icon: 'notifications-outline', label: 'Notices', onPress: () => router.push('/(admin)/notices') },
    { icon: 'wallet-outline', label: 'Revenue', onPress: () => {} },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.card}>
          {user?.photo
            ? <Image source={{ uri: user.photo }} style={styles.avatar} />
            : <View style={styles.avatarFallback}><Text style={styles.avatarText}>{user?.firstName?.[0]}{user?.lastName?.[0]}</Text></View>}
          <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.roleBadge}><Text style={styles.roleText}>School Admin</Text></View>
          <Text style={styles.schoolName}>{user?.school?.name}</Text>
        </View>

        <View style={styles.menu}>
          {menuItems.map((item, i) => (
            <TouchableOpacity key={i} style={styles.menuItem} onPress={item.onPress}>
              <View style={styles.menuIcon}><Ionicons name={item.icon as any} size={20} color={Colors.primary} /></View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={Colors.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  card: { backgroundColor: Colors.card, margin: 16, padding: 24, borderRadius: 20, alignItems: 'center' },
  avatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 12 },
  avatarFallback: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 28 },
  name: { fontSize: 20, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  email: { fontSize: 14, color: Colors.textSecondary, marginBottom: 8 },
  roleBadge: { backgroundColor: Colors.primaryLight, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginBottom: 6 },
  roleText: { color: Colors.primary, fontWeight: '700', fontSize: 12 },
  schoolName: { fontSize: 14, color: Colors.textSecondary },
  menu: { backgroundColor: Colors.card, margin: 16, borderRadius: 16, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  menuIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  menuLabel: { flex: 1, fontSize: 15, color: Colors.text, fontWeight: '500' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', margin: 16, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: Colors.error, gap: 8 },
  logoutText: { color: Colors.error, fontWeight: '600', fontSize: 15 },
});
