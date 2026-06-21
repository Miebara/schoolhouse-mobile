import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useAuthStore } from '../stores/authStore';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { loadFromStorage, isLoading } = useAuthStore();

  useEffect(() => {
    loadFromStorage().then(() => SplashScreen.hideAsync());
  }, []);

  if (isLoading) return null;

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(admin)" />
        <Stack.Screen name="(teacher)" />
        <Stack.Screen name="(parent)" />
      </Stack>
    </>
  );
}
