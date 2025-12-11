import { useHoHTheme } from '@/providers';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function ModalScreen() {
  const theme = useHoHTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.semantic.background }
      ]}
    >
      <Text
        style={[
          styles.title,
          { color: theme.semantic.text }
        ]}
      >
        Modal
      </Text>

      <View
        style={[
          styles.separator,
          { backgroundColor: theme.semantic.border }
        ]}
      />

      {/* Status Bar respects our theme */}
      <StatusBar
        style={theme.mode === 'dark' ? 'light' : 'dark'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%'
  }
});
