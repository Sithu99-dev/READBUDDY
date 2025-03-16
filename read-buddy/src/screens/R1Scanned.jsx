import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { AppContext } from '../App.tsx';

export default function R1Scanned({ navigation, route }) {
  const scannedText = route.params?.scannedText || 'No text scanned yet';
  const [letterSettings, setLetterSettings] = useState({});
  const { loggedInUser } = useContext(AppContext);

  useEffect(() => {
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

    loadSettingsFromFirestore();

    const unsubscribe = navigation.addListener('focus', () => {
      const updatedSettings = route.params?.letterSettings;
      if (updatedSettings) {
        setLetterSettings(updatedSettings);
      }
    });
    return unsubscribe;
  }, [navigation, route.params, loggedInUser]);

  // Render a line with per-character styling, preserving whole words
  const renderLine = (line) => {
    const words = line.split(' ');
    return words.map((word, wordIndex) => (
      <Text key={wordIndex} style={styles.word}>
        {word.split('').map((char, charIndex) => {
          const lowerChar = char.toLowerCase();
          const settings = letterSettings[lowerChar] || {
            fontSize: 18,
            color: 'black',
            bold: false,
          };
          return (
            <Text
              key={charIndex}
              style={{
                fontFamily: 'OpenDyslexic3-Regular',
                fontSize: settings.fontSize,
                color: settings.color,
                fontWeight: settings.bold ? 'bold' : 'normal',
              }}
            >
              {char}
            </Text>
          );
        })}
        {wordIndex < words.length - 1 && <Text> </Text>}
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
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer} // Adjusted for centering
      >
        <View style={styles.textWrapper}>
          {renderLines(scannedText)}
        </View>
      </ScrollView>
      <TouchableOpacity
        onPress={() => navigation.navigate('Text Settings', { scannedText, letterSettings })}
      >
        <Text style={styles.positiveBtn}>Text Settings</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    justifyContent: 'center', // Center vertically within the screen
    alignItems: 'center', // Center horizontally within the screen
  },
  scrollView: {
    width: '100%',
    flexGrow: 1, // Allow ScrollView to grow within the container
  },
  contentContainer: {
    flexGrow: 1, // Ensure content can grow to fill ScrollView
    justifyContent: 'center', // Center content vertically within ScrollView
    alignItems: 'center', // Center content horizontally within ScrollView
    padding: 10,
  },
  textWrapper: {
    alignItems: 'center', // Center text horizontally within its wrapper
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
    padding: 10,
    margin: 5,
    backgroundColor: '#85fe78',
    borderRadius: 10,
  },
});