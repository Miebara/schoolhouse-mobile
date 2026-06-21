import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, Alert, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Colors } from '../../../constants/colors';
import { useRegistrationStore } from '../../../stores/registrationStore';
import { authService } from '../../../services/api';

export default function TeacherStep2() {
  const router = useRouter();
  const { selectedSchool, teacherData, setTeacherData, reset } = useRegistrationStore();
  const [form, setForm] = useState({ firstName: '', middleName: '', lastName: '', address: '', phone: '', email: '', password: '', confirmPassword: '' });
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [staffIdFileName, setStaffIdFileName] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function pickPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!result.canceled) setPhotoUri(result.assets[0].uri);
  }

  async function pickStaffId() {
    const result = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'image/*'], copyToCacheDirectory: true });
    if (!result.canceled) setStaffIdFileName(result.assets[0].name);
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = 'Required';
    if (!form.lastName.trim()) e.lastName = 'Required';
    if (!form.address.trim()) e.address = 'Required';
    if (!form.phone.trim()) e.phone = 'Required';
    if (!photoUri) e.photo = 'Please upload your photo';
    if (!staffIdFileName) e.staffId = 'Please upload your staff ID';
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
      await authService.registerTeacher({
        ...form,
        email: form.email.toLowerCase().trim(),
        schoolId: selectedSchool!.id,
        photoUrl: photoUri,
        staffIdFileUrl: staffIdFileName,
      });
      reset();
      Alert.alert('Account Created!', 'Please verify your email. The school admin will review your application.', [
        { text: 'Login', onPress: () => router.replace('/(auth)/login') },
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
        <View style={styles.badge}><Text style={styles.badgeText}>📍 Joining: {selectedSchool?.name}</Text></View>
        <Text style={styles.title}>Staff Registration</Text>

        {(['firstName', 'middleName', 'lastName', 'address', 'phone'] as const).map(field => (
          <View key={field} style={styles.field}>
            <Text style={styles.label}>{field === 'firstName' ? 'First Name *' : field === 'middleName' ? 'Middle Name' : field === 'lastName' ? 'Last Name *' : field === 'address' ? 'Address *' : 'Phone *'}</Text>
            <TextInput style={[styles.input, errors[field] && styles.inputError]} value={form[field]} onChangeText={t => setForm(f => ({ ...f, [field]: t }))} keyboardType={field === 'phone' ? 'phone-pad' : 'default'} />
            {errors[field] && <Text style={styles.error}>{errors[field]}</Text>}
          </View>
        ))}

        <View style={styles.field}>
          <Text style={styles.label}>Your Photo *</Text>
          <TouchableOpacity style={styles.uploadBtn} onPress={pickPhoto}>
            {photoUri ? <Image source={{ uri: photoUri }} style={styles.photoPreview} /> : <Text style={styles.uploadText}>📷 Tap to upload photo</Text>}
          </TouchableOpacity>
          {errors.photo && <Text style={styles.error}>{errors.photo}</Text>}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Staff ID Document * (PDF or image, max 5MB)</Text>
          <TouchableOpacity style={styles.uploadBtn} onPress={pickStaffId}>
            <Text style={styles.uploadText}>{staffIdFileName ? `📄 ${staffIdFileName}` : '📎 Upload staff ID'}</Text>
          </TouchableOpacity>
          {errors.staffId && <Text style={styles.error}>{errors.staffId}</Text>}
        </View>

        <Text style={styles.section}>Account Details</Text>
        {(['email', 'password', 'confirmPassword'] as const).map(field => (
          <View key={field} style={styles.field}>
            <Text style={styles.label}>{field === 'email' ? 'Email *' : field === 'password' ? 'Password *' : 'Confirm Password *'}</Text>
            <TextInput style={[styles.input, errors[field] && styles.inputError]} value={form[field]} onChangeText={t => setForm(f => ({ ...f, [field]: t }))} keyboardType={field === 'email' ? 'email-address' : 'default'} autoCapitalize="none" secureTextEntry={field !== 'email'} />
            {errors[field] && <Text style={styles.error}>{errors[field]}</Text>}
          </View>
        ))}

        <TouchableOpacity style={styles.btn} onPress={submit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Submit Application</Text>}
        </TouchableOpacity>
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
  title: { fontSize: 24, fontWeight: '800', color: Colors.text, marginBottom: 24 },
  section: { fontSize: 16, fontWeight: '700', color: Colors.text, marginTop: 8, marginBottom: 12, borderBottomWidth: 1, borderColor: Colors.border, paddingBottom: 6 },
  field: { marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.text, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: 10, padding: 13, fontSize: 15 },
  inputError: { borderColor: Colors.error },
  error: { color: Colors.error, fontSize: 12 },
  uploadBtn: { borderWidth: 1.5, borderColor: Colors.border, borderRadius: 10, borderStyle: 'dashed', padding: 16, alignItems: 'center', justifyContent: 'center', minHeight: 60 },
  uploadText: { color: Colors.textSecondary, fontSize: 14 },
  photoPreview: { width: 80, height: 80, borderRadius: 40 },
  btn: { backgroundColor: Colors.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 16, marginBottom: 40 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
