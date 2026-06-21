import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../stores/authStore';

export default function Index() {
  const { isLoggedIn, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace('/(auth)/landing');
      return;
    }
    if (user?.role === 'SCHOOL_ADMIN' || user?.role === 'SUPER_ADMIN') {
      router.replace('/(admin)/dashboard');
    } else if (user?.role === 'TEACHER') {
      router.replace('/(teacher)/dashboard');
    } else if (user?.role === 'PARENT') {
      router.replace('/(parent)/dashboard');
    }
  }, [isLoggedIn, user]);

  return null;
}
