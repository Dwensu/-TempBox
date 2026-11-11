
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import { FilesProvider } from '@/context/FilesContext';
import { SettingsProvider } from '@/context/SettingsContext';

function ProtectedNavigation() {
  const { isLoggedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const onLoginPage = segments[0] === 'login';

    if (!isLoggedIn && !onLoginPage) {
      router.replace('/login');
    }

    if (isLoggedIn && onLoginPage) {
      router.replace('/');
    }
  }, [isLoggedIn, segments, router]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="login" />
      <Stack.Screen name="add-file" />
      <Stack.Screen name="cleanup-confirm" />
      <Stack.Screen name="cleanup-success" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SettingsProvider>
      <FilesProvider>
        <AuthProvider>
          <ProtectedNavigation />
        </AuthProvider>
      </FilesProvider>
    </SettingsProvider>
  );
}
