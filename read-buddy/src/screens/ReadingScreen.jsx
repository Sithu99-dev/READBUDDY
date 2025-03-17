import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';

export default function ReadingScreen({ navigation }) { 

  return (
    <ImageBackground 
        source={require("../assets/bg8.jpg")}
        style={styles.container}>
          <View style={styles.header}>        
            <Text style={styles.title}>Let's Read</Text>
          </View>
          <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Text Input')}>
              {/* <Text style={styles.buttonTextIcon}>1</Text> */}
              <Text style={styles.buttonText}>Write & Read</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Text Reading')}>
              {/* <Text style={styles.buttonTextIcon}>1</Text> */}
              <Text style={styles.buttonText}>Text Reading</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Reading Challenge')}>
              {/* <Text style={styles.buttonTextIcon}>2</Text> */}
              <Text style={styles.buttonText}>Reading Challange</Text>
            </TouchableOpacity>
            
          </View>
        </ImageBackground>
      );
    }
    
    const styles = StyleSheet.create({
      container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
      header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
      logo: { width: 50, height: 50, marginRight: 10 },
      title: { fontSize: 48, fontWeight: 'bold', color:'#12181e' },
      buttonsContainer: { flexDirection: 'column', flexWrap: 'wrap', justifyContent: 'center' },
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
      buttonTextIcon: { 
        color: '#12181e', 
        textAlign: 'center', 
        fontSize: 28,
        fontWeight: 'bold',
        padding:5,
        backgroundColor: '#fff',
        borderRadius: 20,
        width:40,
        height:40
       },
    });