import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function TeacherStep1() {
  const router = useRouter();
  useEffect(() => {
    router.replace({ pathname: '/(auth)/register/school-select', params: { nextRoute: '/(auth)/register/teacher-step2' } });
  }, []);
  return null;
}
