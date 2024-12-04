// screens/DashboardScreen.js
import React from 'react';
import { View, Text, Image, Button, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';

export default function DashboardScreen({ navigation }) {
  return (
    <ImageBackground 
    source={require("../assets/bg4.jpg")}
    style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../assets/logo1.png')} style={styles.logo} />
        <Text style={styles.title}>Read Budy</Text>
      </View>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Reading')}>
          <Text style={styles.buttonTextIcon}>📖</Text>
          <Text style={styles.buttonText}>Reading</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Writing')}>
          <Text style={styles.buttonTextIcon}>✍️</Text>
          <Text style={styles.buttonText}>Writing</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Speech')}>
          <Text style={styles.buttonTextIcon}>🗣️</Text>
          <Text style={styles.buttonText}>Speech</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Focus')}>
          <Text style={styles.buttonTextIcon}>🎯</Text>
          <Text style={styles.buttonText}>Focus</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  logo: { width: 50, height: 50, marginRight: 10 },
  title: { fontSize: 48, fontWeight: 'bold', color:'#27ac1f' },
  buttonsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  button: {
    width: 150,
    height: 150,
    margin: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#27ac1f',
    borderRadius: 10,
  },
  buttonText: { color: '#12181e',fontWeight: 'bold',textAlign: 'center', fontSize: 28 },
  buttonTextIcon: { color: '#12181e', textAlign: 'center', fontSize: 40 },
});
