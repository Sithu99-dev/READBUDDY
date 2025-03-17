import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { AppContext } from '../App.tsx';

export default function TextInputScreen({ navigation, route }) {
  const [inputText, setInputText] = useState('');
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
      {/* Fixed Heading */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Write your text here</Text>
      </View>

      {/* Scrollable Input and Rendered Text */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        <TextInput
          style={styles.textInput}
          multiline
          placeholder="Type your text here..."
          value={inputText}
          onChangeText={setInputText}
        />
        {inputText ? (
          <View style={styles.textWrapper}>{renderLines(inputText)}</View>
        ) : null}
      </ScrollView>

      {/* Fixed Text Settings Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('Text Settings', { inputText, letterSettings })
          }
        >
          <Text style={styles.positiveBtn}>Text Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1,
    padding: 10,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  scrollView: {
    flex: 1,
    width: '100%',
    marginTop: 70,
    marginBottom: 60,
  },
  contentContainer: {
    padding: 10,
    paddingBottom: 20,
  },
  textInput: {
    width: '100%',
    minHeight: 100,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    fontSize: 18,
    color: '#000',
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  textWrapper: {
    alignItems: 'center',
  },
  lineContainer: {
    flexWrap: 'wrap',
    marginVertical: 5,
    textAlign: 'center',
  },
  word: {
    flexShrink: 0,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1,
    padding: 10,
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