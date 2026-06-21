import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../../constants/colors';
import { useRegistrationStore } from '../../../stores/registrationStore';

const NIGERIA_STATES = ['Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno','Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara'];

export default function AdminStep2() {
  const router = useRouter();
  const { setAdminData } = useRegistrationStore();
  const [form, setForm] = useState({ schoolName: '', schoolAddress: '', state: '', lga: '', schoolPhone: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!form.schoolName.trim()) e.schoolName = 'Required';
    if (!form.schoolAddress.trim()) e.schoolAddress = 'Required';
    if (!form.state.trim()) e.state = 'Required';
    if (!form.lga.trim()) e.lga = 'Required';
    if (!form.schoolPhone.trim()) e.schoolPhone = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (!validate()) return;
    setAdminData({ ...form });
    router.push('/(auth)/register/admin-step3');
  }

  const fields = [
    { key: 'schoolName', label: 'School Name *', placeholder: 'e.g. Greenfield Academy' },
    { key: 'schoolAddress', label: 'School Address *', placeholder: 'Street address' },
    { key: 'state', label: 'State *', placeholder: 'e.g. Lagos' },
    { key: 'lga', label: 'LGA *', placeholder: 'Local Government Area' },
    { key: 'schoolPhone', label: 'School Phone *', placeholder: '08012345678' },
  ] as const;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>← Back</Text></TouchableOpacity>
        <View style={styles.progress}>
          {[1,2,3].map(i => <View key={i} style={[styles.dot, i <= 2 && styles.dotActive]} />)}
        </View>
        <Text style={styles.title}>School Info</Text>
        <Text style={styles.subtitle}>Tell us about your school</Text>

        {fields.map(({ key, label, placeholder }) => (
          <View key={key} style={styles.field}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
              style={[styles.input, errors[key] && styles.inputError]}
              placeholder={placeholder}
              value={form[key]}
              onChangeText={(t) => setForm(f => ({ ...f, [key]: t }))}
              keyboardType={key === 'schoolPhone' ? 'phone-pad' : 'default'}
            />
            {errors[key] && <Text style={styles.error}>{errors[key]}</Text>}
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
