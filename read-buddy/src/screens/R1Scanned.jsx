/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { AppContext } from '../App.tsx';
import { Image } from 'react-native-animatable';

export default function R1Scanned({ navigation, route }) {
  const scannedText = route.params?.scannedText || 'No text scanned yet';
  const [letterSettings, setLetterSettings] = useState({});
  const { loggedInUser } = useContext(AppContext);
  
  const loadSettingsFromFirestore = async () => {
    if (!loggedInUser) return;
    try {
      const userDoc = await firestore()
        .collection('snake_game_leadersboard')
        .doc(loggedInUser)
        .get();
      if (userDoc.exists) {
        const data = userDoc.data();
        if (data.textSettings) {
          setLetterSettings(data.textSettings);
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };
  
  useEffect(() => {
    // Initial load
    loadSettingsFromFirestore();
    
    // Reload settings when screen regains focus
    const unsubscribe = navigation.addListener('focus', () => {
      loadSettingsFromFirestore(); // Fetch latest settings from Firestore
    });
    
    return unsubscribe;
  }, [navigation, loggedInUser]);
  
  // Render a line with per-character styling, preserving whole words
  const renderLine = (line) => {
    const words = line.split(' ');
    return words.map((word, wordIndex) => (
      <Text key={wordIndex} style={styles.word}>
        {word.split('').map((char, charIndex) => {
          const settings = letterSettings[char] || {
            fontSize: 16,
            color: 'black',
            bold: false,
          };
          return (
            <Text
              key={charIndex}
              style={{
                fontFamily: 'OpenDyslexic3-Regular',
                fontSize: settings.fontSize + 14,
                color: settings.color,
                fontWeight: settings.bold ? 'bold' : 'normal',
              }}
            >
              {char}
            </Text>
          );
        })}
        {wordIndex < words.length - 1 && <Text>    </Text>}
      </Text>
    ));
  };
  
  // Render text line by line
  const renderLines = (text) => {
    const lines = text.split('\n');
    return lines.map((line, lineIndex) => (
      <Text key={lineIndex} style={styles.lineContainer}>
        {renderLine(line)}
      </Text>
    ));
  };
  
  return (
    <View style={styles.outerContainer}>
              <TouchableOpacity 
                style={styles.settingsButton}
                onPress={() => navigation.navigate('Text Settings', { scannedText: '', letterSettings: {} })}
              >
                <Image
                  source={require('../assets/settings.png')} 
                  style={styles.settingsIcon}
                  // If you don't have a settings icon, use this fallback:
                  // For fallback text icon: <Text style={styles.settingsText}>⚙️</Text>
                />
              </TouchableOpacity>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.textWrapper}>{renderLines(scannedText)}</View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#5ECCD9', // Turquoise background color matching the image
  },
  bottomButtonContainer: {
    width: '100%',
    paddingVertical: 10,
    alignItems: 'center',
  },
  scrollView: {
    width: '100%',
    flexGrow: 1,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  textWrapper: {
    backgroundColor: 'white',
    borderRadius: 30,
    width: '90%',
    minHeight: '80%',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  lineContainer: {
    flexWrap: 'wrap',
    marginVertical: 5,
    textAlign: 'center',
  },
  word: {
    flexShrink: 0,
  },
  positiveBtn: {
    fontSize: 15,
    fontWeight: '600',
    color: '#12181e',
    padding: 12,
    marginBottom: 20,
    marginTop: 10,
    backgroundColor: '#85fe78',
    borderRadius: 10,
    alignSelf: 'center',
    textAlign: 'center',
    minWidth: 120,
  },
   settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(128, 128, 128, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft:160,
    marginTop:-52,
    marginBottom:4,
  },

  settingsText: {
    fontSize: 20,
    color: 'white',
  },
  settingsIcon: {
    width: 25,
    height: 25,
    tintColor: '#000',
    fontWeight:'bold',
  },
});