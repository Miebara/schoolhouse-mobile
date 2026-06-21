import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../../constants/colors';
import { useRegistrationStore } from '../../../stores/registrationStore';
import { classService, authService } from '../../../services/api';
import { useEffect } from 'react';

interface Class { id: string; name: string; }

export default function ParentStep3() {
  const router = useRouter();
  const { selectedSchool, parentData, setParentData, reset } = useRegistrationStore();
  const [classes, setClasses] = useState<Class[]>([]);
  const [form, setForm] = useState({ childFirstName: '', childMiddleName: '', childSurname: '', classId: '', age: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    classService.getAll().then(r => setClasses(r.data.data)).catch(() => {});
  }, []);

  function validate() {
    const e: Record<string, string> = {};
    if (!form.childFirstName.trim()) e.childFirstName = 'Required';
    if (!form.childSurname.trim()) e.childSurname = 'Required';
    if (!form.classId) e.classId = 'Select a class';
    if (!form.age || isNaN(Number(form.age))) e.age = 'Valid age required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (form.password.length < 8) e.password = 'Minimum 8 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit() {
    if (!validate()) return;
    setLoading(true);
    try {
      await authService.registerParent({
        ...parentData,
        childFirstName: form.childFirstName,
        childMiddleName: form.childMiddleName,
        childSurname: form.childSurname,
        classId: form.classId,
        age: form.age,
        schoolId: selectedSchool!.id,
        email: form.email.toLowerCase().trim(),
        password: form.password,
      });
      reset();
      Alert.alert('Account Created!', 'Please verify your email. Your account will need approval from the school admin.', [
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
        <Text style={styles.title}>Child & Account</Text>
        <Text style={styles.subtitle}>Add your child and create your account</Text>

        <Text style={styles.section}>Child Information</Text>
        {(['childFirstName', 'childMiddleName', 'childSurname', 'age'] as const).map(field => (
          <View key={field} style={styles.field}>
            <Text style={styles.label}>{field === 'childFirstName' ? "Child's First Name *" : field === 'childMiddleName' ? "Middle Name" : field === 'childSurname' ? "Surname *" : "Age *"}</Text>
            <TextInput style={[styles.input, errors[field] && styles.inputError]} value={form[field]} onChangeText={t => setForm(f => ({ ...f, [field]: t }))} keyboardType={field === 'age' ? 'numeric' : 'default'} />
            {errors[field] && <Text style={styles.error}>{errors[field]}</Text>}
          </View>
        ))}

        <View style={styles.field}>
          <Text style={styles.label}>Class *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.classRow}>
            {classes.map(c => (
              <TouchableOpacity key={c.id} style={[styles.classChip, form.classId === c.id && styles.classChipActive]} onPress={() => setForm(f => ({ ...f, classId: c.id }))}>
                <Text style={[styles.classChipText, form.classId === c.id && styles.classChipTextActive]}>{c.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {errors.classId && <Text style={styles.error}>{errors.classId}</Text>}
        </View>

        <Text style={styles.section}>Your Account</Text>
        {(['email', 'password', 'confirmPassword'] as const).map(field => (
          <View key={field} style={styles.field}>
            <Text style={styles.label}>{field === 'email' ? 'Email *' : field === 'password' ? 'Password *' : 'Confirm Password *'}</Text>
            <TextInput style={[styles.input, errors[field] && styles.inputError]} value={form[field]} onChangeText={t => setForm(f => ({ ...f, [field]: t }))} keyboardType={field === 'email' ? 'email-address' : 'default'} autoCapitalize={field === 'email' ? 'none' : 'sentences'} secureTextEntry={field !== 'email'} />
            {errors[field] && <Text style={styles.error}>{errors[field]}</Text>}
          </View>
        ))}

        <TouchableOpacity style={styles.btn} onPress={submit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Create Account</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.card },
  inner: { padding: 24 },
  back: { color: Colors.primary, fontSize: 16, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  subtitle: { fontSize: 14, color: Colors.textSecondary, marginBottom: 24 },
  section: { fontSize: 16, fontWeight: '700', color: Colors.text, marginTop: 8, marginBottom: 12, borderBottomWidth: 1, borderColor: Colors.border, paddingBottom: 6 },
  field: { marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.text, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: 10, padding: 13, fontSize: 15 },
  inputError: { borderColor: Colors.error },
  error: { color: Colors.error, fontSize: 12 },
  classRow: { marginTop: 4 },
  classChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: Colors.border, marginRight: 8 },
  classChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  classChipText: { color: Colors.textSecondary, fontSize: 13 },
  classChipTextActive: { color: '#fff', fontWeight: '600' },
  btn: { backgroundColor: Colors.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 16, marginBottom: 40 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
