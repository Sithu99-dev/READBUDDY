// components/LevelSelection.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Colors } from "../styles/colors";

interface LevelSelectionProps {
  onLevelSelect: (level: number) => void;
}

const LevelSelection: React.FC<LevelSelectionProps> = ({ onLevelSelect }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Level</Text>
      {[1, 2, 3, 4, 5].map((level) => (
        <TouchableOpacity
          key={level}
          style={styles.button}
          onPress={() => onLevelSelect(level)}
        >
          <Text style={styles.buttonText}>Level {level}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    color: "#12181e",
    marginBottom: 20,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 15,
    marginVertical: 10,
    width: "80%",
    alignItems: "center",
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
  },
});

export default LevelSelection;
