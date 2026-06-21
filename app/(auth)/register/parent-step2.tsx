import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../../constants/colors';
import { useRegistrationStore } from '../../../stores/registrationStore';

export default function ParentStep2() {
  const router = useRouter();
  const { selectedSchool, setParentData } = useRegistrationStore();
  const [form, setForm] = useState({ firstName: '', middleName: '', lastName: '', address: '', phone: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = 'Required';
    if (!form.lastName.trim()) e.lastName = 'Required';
    if (!form.address.trim()) e.address = 'Required';
    if (!form.phone.trim()) e.phone = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (!validate()) return;
    setParentData({ ...form });
    router.push('/(auth)/register/parent-step3');
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>← Back</Text></TouchableOpacity>
        <View style={styles.badge}><Text style={styles.badgeText}>📍 Joining: {selectedSchool?.name}</Text></View>

        <Text style={styles.title}>Your Info</Text>
        <Text style={styles.subtitle}>Tell us about yourself</Text>

        {(['firstName', 'middleName', 'lastName', 'address', 'phone'] as const).map(field => (
          <View key={field} style={styles.field}>
            <Text style={styles.label}>
              {field === 'firstName' ? 'First Name *' : field === 'middleName' ? 'Middle Name' : field === 'lastName' ? 'Last Name *' : field === 'address' ? 'Address *' : 'Phone *'}
            </Text>
            <TextInput
              style={[styles.input, errors[field] && styles.inputError]}
              value={form[field]}
              onChangeText={t => setForm(f => ({ ...f, [field]: t }))}
              keyboardType={field === 'phone' ? 'phone-pad' : 'default'}
            />
            {errors[field] && <Text style={styles.error}>{errors[field]}</Text>}
          </View>
        ))}

        <TouchableOpacity style={styles.btn} onPress={next}><Text style={styles.btnText}>Continue →</Text></TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.card },
  inner: { padding: 24 },
  back: { color: Colors.primary, fontSize: 16, marginBottom: 12 },
  badge: { backgroundColor: Colors.primaryLight, padding: 10, borderRadius: 8, marginBottom: 20 },
  badgeText: { color: Colors.primary, fontWeight: '600', fontSize: 13 },
  title: { fontSize: 24, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  subtitle: { fontSize: 14, color: Colors.textSecondary, marginBottom: 24 },
  field: { marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.text, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: 10, padding: 13, fontSize: 15 },
  inputError: { borderColor: Colors.error },
  error: { color: Colors.error, fontSize: 12 },
  btn: { backgroundColor: Colors.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
