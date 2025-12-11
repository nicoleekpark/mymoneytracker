import { useHoHTheme } from '@/providers';
import { useMemo } from 'react';
import { Text, TextStyle, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  const theme = useHoHTheme();
  const styles = useMemo(() => {
    return {
      container: {
        flex: 1,
        backgroundColor: theme.semantic.background
      } as ViewStyle,
      title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.semantic.text,
        marginTop: 20,
        marginBottom: 20
      } as TextStyle
    }
  }, [theme]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
    </SafeAreaView>
  );
}
