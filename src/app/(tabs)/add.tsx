import { useHoHTheme } from '@/providers';
import { StyleSheet, Text, View } from 'react-native';

export default function AddScreen() {
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
        Add Transaction
      </Text>

      <View
        style={[
          styles.separator,
          { backgroundColor: theme.semantic.border }
        ]}
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
