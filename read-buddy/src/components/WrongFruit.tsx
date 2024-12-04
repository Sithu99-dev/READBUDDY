// components/WrongFruit.tsx
import React from "react";
import { StyleSheet, Text } from "react-native";
import { Coordinate } from "../types/types";

function getRandomWrongFruitEmoji(): string {
  const wrongFruitEmojis = ["🍄", "🌶️", "🥕", "🥔", "🥦", "🌽"];
  const randomIndex = Math.floor(Math.random() * wrongFruitEmojis.length);
  return wrongFruitEmojis[randomIndex];
}

export default function WrongFruit({ x, y }: Coordinate): JSX.Element {
  const emoji = getRandomWrongFruitEmoji();
  return (
    <Text style={[{ top: y * 10, left: x * 10 }, styles.wrongFruit]}>
      {emoji}
    </Text>
  );
}

const styles = StyleSheet.create({
  wrongFruit: {
    width: 30,
    height: 30,
    fontSize: 25,
    position: "absolute",
  },
});
