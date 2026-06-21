import { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Image, ActivityIndicator, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../../constants/colors';
import { useRegistrationStore } from '../../../stores/registrationStore';
import { authService } from '../../../services/api';

interface School { id: string; name: string; address: string; state: string; logo?: string; }

export default function SchoolSelectScreen() {
  const router = useRouter();
  const { nextRoute } = useLocalSearchParams<{ nextRoute: string }>();
  const { setSelectedSchool } = useRegistrationStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<School[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (q: string) => {
    setQuery(q);
    if (q.length < 2) return setResults([]);
    setLoading(true);
    try {
      const res = await authService.searchSchools(q);
      setResults(res.data.data);
    } catch {}
    setLoading(false);
  }, []);

  function select(school: School) {
    setSelectedSchool(school);
    router.push(nextRoute as any);
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}><Text style={styles.back}>← Back</Text></TouchableOpacity>
      <Text style={styles.title}>Find Your School</Text>
      <Text style={styles.subtitle}>Search for your school to join</Text>

      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Type school name or location..."
          value={query}
          onChangeText={search}
          autoFocus
        />
        {loading && <ActivityIndicator size="small" color={Colors.primary} />}
      </View>

      {results.length === 0 && query.length >= 2 && !loading && (
        <Text style={styles.empty}>No schools found for "{query}"</Text>
      )}

      <FlatList
        data={results}
        keyExtractor={i => i.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => select(item)}>
            <View style={styles.logoBox}>
              {item.logo
                ? <Image source={{ uri: item.logo }} style={styles.logo} />
                : <Text style={styles.logoFallback}>🏫</Text>}
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.addr}>{item.address}, {item.state}</Text>
            </View>
            <Text style={styles.joinBtn}>Join Us →</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.card, padding: 24 },
  backBtn: { marginBottom: 16 },
  back: { color: Colors.primary, fontSize: 16 },
  title: { fontSize: 24, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  subtitle: { fontSize: 14, color: Colors.textSecondary, marginBottom: 20 },
  searchBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 12, marginBottom: 16 },
  searchIcon: { fontSize: 18, marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 13, fontSize: 15 },
  empty: { textAlign: 'center', color: Colors.textSecondary, marginTop: 40 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, marginBottom: 10 },
  logoBox: { width: 48, height: 48, borderRadius: 10, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  logo: { width: 48, height: 48, borderRadius: 10 },
  logoFallback: { fontSize: 24 },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: Colors.text },
  addr: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  joinBtn: { color: Colors.primary, fontWeight: '600' },
});
