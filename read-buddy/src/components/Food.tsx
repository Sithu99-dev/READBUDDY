// components/Food.tsx
import { StyleSheet, Text } from "react-native";
import { Coordinate } from "../types/types";

interface FoodProps extends Coordinate {
  emoji: string;
}

export default function Food({ x, y, emoji }: FoodProps): JSX.Element {
  return (
    <Text style={[{ top: y * 10, left: x * 10 }, styles.food]}>
      {emoji}
    </Text>
  );
}

const styles = StyleSheet.create({
  food: {
    width: 30,
    height: 30,
    fontSize: 25,
    position: "absolute",
  },
});
