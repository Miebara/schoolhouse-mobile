import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../../constants/colors';
import { useRegistrationStore } from '../../../stores/registrationStore';

export default function AdminStep1() {
  const router = useRouter();
  const { setAdminData } = useRegistrationStore();
  const [form, setForm] = useState({ firstName: '', middleName: '', lastName: '', phone: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = 'Required';
    if (!form.lastName.trim()) e.lastName = 'Required';
    if (!form.phone.trim()) e.phone = 'Required';
    if (form.phone && !/^(\+234|0)[789][01]\d{8}$/.test(form.phone.replace(/\s/g, '')))
      e.phone = 'Enter a valid Nigerian phone number';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (!validate()) return;
    setAdminData({ ...form });
    router.push('/(auth)/register/admin-step2');
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>← Back</Text></TouchableOpacity>
        <View style={styles.progress}>
          {[1,2,3].map(i => <View key={i} style={[styles.dot, i === 1 && styles.dotActive]} />)}
        </View>
        <Text style={styles.title}>Personal Info</Text>
        <Text style={styles.subtitle}>Tell us about yourself</Text>

        {(['firstName', 'middleName', 'lastName', 'phone'] as const).map((field) => (
          <View key={field} style={styles.field}>
            <Text style={styles.label}>
              {field === 'firstName' ? 'First Name *' : field === 'middleName' ? 'Middle Name' : field === 'lastName' ? 'Last Name *' : 'Phone *'}
            </Text>
            <TextInput
              style={[styles.input, errors[field] && styles.inputError]}
              placeholder={field === 'phone' ? '08012345678' : ''}
              value={form[field]}
              onChangeText={(t) => setForm(f => ({ ...f, [field]: t }))}
              keyboardType={field === 'phone' ? 'phone-pad' : 'default'}
            />
            {errors[field] && <Text style={styles.error}>{errors[field]}</Text>}
          </View>
        ))}

        <TouchableOpacity style={styles.btn} onPress={next}>
          <Text style={styles.btnText}>Continue →</Text>
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
  btn: { backgroundColor: Colors.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
