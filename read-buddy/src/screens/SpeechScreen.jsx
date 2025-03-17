import React from 'react';
import { View, Text, ImageBackground, TouchableOpacity, StyleSheet, SafeAreaView, Dimensions } from 'react-native';

export default function SpeechScreen({ navigation }) {
  return (
    <ImageBackground
      source={require('../assets/speakingbg.png')}
      style={styles.container}
      imageStyle={{opacity: 0.3}}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Say the{'\n'}Word!</Text>

          <View style={styles.levelsContainer}>
            <TouchableOpacity
              style={[styles.levelButton, styles.level1]}
              onPress={() => navigation.navigate('Say the word', { level: 1 })}
            >
              <Text style={styles.levelText}>Level 01</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.levelButton, styles.level2]}
              onPress={() => navigation.navigate('Say the word', { level: 2 })}
            >
              <Text style={styles.levelText}>Level 02</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.levelButton, styles.level3]}
              onPress={() => navigation.navigate('Say the word', { level: 3 })}
            >
              <Text style={styles.levelText}>Level 03</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.levelButton, styles.level4]}
              onPress={() => navigation.navigate('Say the word', { level: 4 })}
            >
              <Text style={styles.levelText}>Level 04</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const { width } = Dimensions.get('window');

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
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4A9FBA',
    marginBottom: 30,
    marginLeft: 30,
  },
  levelsContainer: {
    width: '70%',
    paddingLeft: 20,
  },
  levelButton: {
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: 10,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'white',
  },
  level1: {
    backgroundColor: 'rgba(153, 222, 186, 0.9)',
    width: '80%',
    height: 80,
    marginTop:70,
  },
  level2: {
    backgroundColor: 'rgba(244, 214, 176, 0.9)',
    width: '90%',
    height: 90,
  },
  level3: {
    backgroundColor: 'rgba(244, 182, 172, 0.9)',
    width: '100%',
    height: 100,
  },
  level4: {
    backgroundColor: 'rgba(239, 148, 148, 0.9)',
    width: '110%',
    height: 110,
  },
  levelText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center', // Center text
  },
});
