// import React from 'react';
// import { View, Text, Button, TouchableOpacity, StyleSheet } from 'react-native';
// import "react-native-gesture-handler";
// import { GestureHandlerRootView } from "react-native-gesture-handler";
// import Game from "../components/Game";

// export default function FocusScreen({ navigation }) {
//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//       <Game />
//     </GestureHandlerRootView>
//   );

// }
// const styles = StyleSheet.create({
//   topButtons: {
//       flexDirection: 'row-reverse',
//       justifyContent: 'space-between',
//       gap: 200,
//       position: 'absolute',
//       top:20,    
//       }
// })

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';

export default function FocusScreen({ navigation }) {
  return (
    <ImageBackground 
            source={require("../assets/bg9.jpg")}
            style={styles.container}>
    {/* <View style={styles.container}> */}
      <Text style={styles.title}>Check Your Focus</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Game')}
      >
        <Text style={styles.buttonText}>Start Game</Text>
      </TouchableOpacity>
    {/* </View> */}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    width: 200,
    height: 100,
    margin: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap:12,
    backgroundColor: '#85fe78',
    borderRadius: 10,
  },
  buttonText: { color: '#12181e', textAlign: 'center', fontSize: 32 },
  topButtons: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    gap: 200,
    position: 'absolute',
    top: 20,
  },
});