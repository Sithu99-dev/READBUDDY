// components/Header.tsx
import { TouchableOpacity, StyleSheet, View, Text } from "react-native";
import { Colors } from "../styles/colors";

interface HeaderProps {
  reloadGame: () => void;
  pauseGame: () => void;
  children: JSX.Element;
  isPaused: boolean;
  rightFruitEmoji?: string;
}

export default function Header({
  children,
  reloadGame,
  pauseGame,
  isPaused,
  rightFruitEmoji,
}: HeaderProps): JSX.Element {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={reloadGame}>
        <Text style={styles.buttonTextIcon}> 🔄</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={pauseGame}>
        <Text style={styles.buttonTextIcon}>{isPaused ? "▶️" : "⏸️"}</Text>
      </TouchableOpacity>

      {children}

      {rightFruitEmoji && (
        <Text style={styles.fruitEmoji}>{rightFruitEmoji}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 0.05,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderColor: Colors.primary,
    borderWidth: 12,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomWidth: 0,
    padding: 15,
    backgroundColor: Colors.background,
  },
  buttonTextIcon: {
    color: "#12181e",
    textAlign: "center",
    fontSize: 20,
  },
  fruitEmoji: {
    fontSize: 25,
    marginLeft: 10,
  },
});
