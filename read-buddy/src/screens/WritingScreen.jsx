import React from 'react';
import { View, Text, ImageBackground, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';

export default function WritingScreen({ navigation }) {
  return (
    <ImageBackground 
      source={require("../assets/writingmain.png")}
      style={styles.container}
      imageStyle={{opacity: 0.9}}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.contentContainer}>
          <View style={styles.instructionBox}>
            <Text style={styles.instructionText}>
              Select "Write Numbers" or "Write Words" to begin.
            </Text>
            <Text style={styles.instructionText}>
              If a letter or number is incorrect, the correct one will be shown.
            </Text>
            <Text style={styles.instructionText}>
              Fix mistakes and keep practicing until you get it right!
            </Text>
          </View>
          
          <View style={styles.buttonsContainer}>
            <TouchableOpacity 
              style={styles.button} 
              onPress={() => navigation.navigate('Words')}>
              <Text style={styles.buttonText}>Word Challenge</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.button} 
              onPress={() => navigation.navigate('Writing Numbers')}>
              <Text style={styles.buttonText}>Number{'\n'}Challenge</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  safeArea: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  instructionBox: {
    backgroundColor: 'rgba(145, 189, 239, 0.3)',
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
    marginTop:-110,
    width: '105%',
  },
  instructionText: {
    fontSize: 24,
    color: '#000',
    marginBottom: 10,
    fontWeight: '600',
  },
  buttonsContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  button: {
    width: 220,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2E93B8',
    borderRadius: 30,
    marginTop:30,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
  },
});