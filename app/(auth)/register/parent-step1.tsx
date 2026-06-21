import { useRouter } from 'expo-router';
import { useEffect } from 'react';

// Parent flow starts with school selection
export default function ParentStep1() {
  const router = useRouter();
  useEffect(() => {
    router.replace({ pathname: '/(auth)/register/school-select', params: { nextRoute: '/(auth)/register/parent-step2' } });
  }, []);
  return null;
}
