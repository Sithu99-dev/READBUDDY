import React from 'react';
import { View, Text, Button, TouchableOpacity, StyleSheet } from 'react-native';
import "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Game from "../components/Game";

export default function FocusScreen({ navigation }) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Game />
    </GestureHandlerRootView>
  );

}
const styles = StyleSheet.create({
  topButtons: {
      flexDirection: 'row-reverse',
      justifyContent: 'space-between',
      gap: 200,
      position: 'absolute',
      top:20,    
      }
})
