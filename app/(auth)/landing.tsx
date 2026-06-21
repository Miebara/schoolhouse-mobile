import { View, Text, TouchableOpacity, StyleSheet, Image, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';

export default function LandingScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>🏫</Text>
        </View>
        <Text style={styles.title}>SchoolHouse</Text>
        <Text style={styles.subtitle}>Connecting schools, teachers, and parents</Text>
      </View>

      <View style={styles.actions}>
        <Text style={styles.prompt}>I am a...</Text>

        <TouchableOpacity
          style={[styles.roleBtn, { borderColor: Colors.primary }]}
          onPress={() => router.push('/(auth)/register/admin-step1')}
        >
          <Text style={styles.roleIcon}>🏫</Text>
          <View>
            <Text style={[styles.roleName, { color: Colors.primary }]}>School Admin</Text>
            <Text style={styles.roleDesc}>Create & manage your school</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleBtn, { borderColor: Colors.secondary }]}
          onPress={() => router.push('/(auth)/register/parent-step1')}
        >
          <Text style={styles.roleIcon}>👨‍👩‍👧</Text>
          <View>
            <Text style={[styles.roleName, { color: Colors.secondary }]}>Parent</Text>
            <Text style={styles.roleDesc}>Track your child's progress</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleBtn, { borderColor: Colors.success }]}
          onPress={() => router.push('/(auth)/register/teacher-step1')}
        >
          <Text style={styles.roleIcon}>👩‍🏫</Text>
          <View>
            <Text style={[styles.roleName, { color: Colors.success }]}>Teacher</Text>
            <Text style={styles.roleDesc}>Manage your class & students</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.loginText}>Already have an account? <Text style={{ color: Colors.primary }}>Login</Text></Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.card },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  logoBox: { width: 90, height: 90, borderRadius: 22, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  logoText: { fontSize: 44 },
  title: { fontSize: 32, fontWeight: '800', color: Colors.text, marginBottom: 8 },
  subtitle: { fontSize: 16, color: Colors.textSecondary, textAlign: 'center' },
  actions: { paddingHorizontal: 24, paddingBottom: 40, gap: 12 },
  prompt: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  roleBtn: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16, borderRadius: 14, borderWidth: 1.5, backgroundColor: Colors.card },
  roleIcon: { fontSize: 28 },
  roleName: { fontSize: 16, fontWeight: '700' },
  roleDesc: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  loginBtn: { alignItems: 'center', marginTop: 8 },
  loginText: { fontSize: 14, color: Colors.textSecondary },
});
