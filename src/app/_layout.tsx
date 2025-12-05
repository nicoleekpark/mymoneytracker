import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { HoHThemeProvider } from '@/theme/provider';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <ThemeProvider value={isDark? DarkTheme : DefaultTheme}>
      <HoHThemeProvider initialMode={isDark ? 'dark' : 'light'}>

        <Stack>
          <Stack.Screen name="index" options={{ title: 'Dashboard' }} />
          <Stack.Screen name="cashflow" options={{ title: 'Cashflow' }} />
          <Stack.Screen name="accounts" options={{ title: 'Accounts' }} />
          <Stack.Screen name="transactions" options={{ title: 'Transactions' }} />
          <Stack.Screen name="categories" options={{ title: 'Categories' }} />
          <Stack.Screen name="add" options={{ title: 'Add Transaction' }} />
          {/* <Stack.Screen name="investments" options={{ title: 'Investments' }} />
          <Stack.Screen name="assets" options={{ title: 'Assets' }} />
          <Stack.Screen name="budget" options={{ title: 'Budget' }} />
          <Stack.Screen name="reports" options={{ title: 'Reports' }} /> */}
        </Stack>

      </HoHThemeProvider>
    </ThemeProvider>
  );
}
