import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../../constants/colors';
import { useRegistrationStore } from '../../../stores/registrationStore';
import { authService } from '../../../services/api';

export default function AdminStep3() {
  const router = useRouter();
  const { adminData, reset } = useRegistrationStore();
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const e: Record<string, string> = {};
    if (!form.email.trim()) e.email = 'Required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Required';
    else if (form.password.length < 8) e.password = 'Minimum 8 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit() {
    if (!validate()) return;
    setLoading(true);
    try {
      await authService.registerAdmin({ ...adminData, email: form.email.toLowerCase().trim(), password: form.password });
      reset();
      Alert.alert('Account Created!', 'Please check your email to verify your account.', [
        { text: 'Go to Login', onPress: () => router.replace('/(auth)/login') },
      ]);
    } catch (err: any) {
      Alert.alert('Registration Failed', err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>← Back</Text></TouchableOpacity>
        <View style={styles.progress}>
          {[1,2,3].map(i => <View key={i} style={[styles.dot, styles.dotActive]} />)}
        </View>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Set your email and password</Text>

        <View style={styles.field}>
          <Text style={styles.label}>School Email *</Text>
          <TextInput style={[styles.input, errors.email && styles.inputError]} placeholder="admin@school.ng" value={form.email} onChangeText={t => setForm(f => ({ ...f, email: t }))} keyboardType="email-address" autoCapitalize="none" />
          {errors.email && <Text style={styles.error}>{errors.email}</Text>}
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Password *</Text>
          <TextInput style={[styles.input, errors.password && styles.inputError]} placeholder="Min 8 characters" value={form.password} onChangeText={t => setForm(f => ({ ...f, password: t }))} secureTextEntry />
          {errors.password && <Text style={styles.error}>{errors.password}</Text>}
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Confirm Password *</Text>
          <TextInput style={[styles.input, errors.confirmPassword && styles.inputError]} placeholder="Repeat password" value={form.confirmPassword} onChangeText={t => setForm(f => ({ ...f, confirmPassword: t }))} secureTextEntry />
          {errors.confirmPassword && <Text style={styles.error}>{errors.confirmPassword}</Text>}
        </View>

        <TouchableOpacity style={styles.btn} onPress={submit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Create School Account</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.card },
  inner: { padding: 24 },
  back: { color: Colors.primary, fontSize: 16, marginBottom: 16 },
  progress: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.border },
  dotActive: { backgroundColor: Colors.primary, width: 24 },
  title: { fontSize: 24, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  subtitle: { fontSize: 14, color: Colors.textSecondary, marginBottom: 24 },
  field: { marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.text, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: 10, padding: 13, fontSize: 15 },
  inputError: { borderColor: Colors.error },
  error: { color: Colors.error, fontSize: 12, marginTop: 2 },
  btn: { backgroundColor: Colors.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 16 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
