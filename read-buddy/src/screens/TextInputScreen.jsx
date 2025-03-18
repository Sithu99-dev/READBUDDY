import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Image,
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
      <React.Fragment key={wordIndex}>
        <Text style={styles.word}>
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
        </Text>
        {wordIndex < words.length - 1 && (
          <Text>
            {/* Convert 1 space to 4 spaces */}
            &nbsp;&nbsp;&nbsp;&nbsp;
          </Text>
        )}
      </React.Fragment>
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
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#5FC3C0" barStyle="dark-content" />
      
      {/* Header with back button and settings */}
      <View style={styles.header}>
        
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Text Settings', { inputText, letterSettings })}
        >
          <Image 
            source={require('../assets/settings.png')} 
            style={styles.settingsIcon}
            // Fallback if image isn't available
            // Use this with the fallback text below
          />
          {/* <Text style={styles.settingsText}>⚙️</Text> */}
        </TouchableOpacity>
      </View>

      {/* Main title */}
      <Text style={styles.title}>
        Enter the text you want to change
      </Text>

      {/* Input field */}
      <TextInput
        style={styles.textInput}
        placeholder="Input Value"
        placeholderTextColor="#AAAAAA"
        value={inputText}
        onChangeText={setInputText}
        multiline={false}
      />

      {/* Preview area for the formatted text */}
      <View style={styles.previewContainer}>
        <ScrollView contentContainerStyle={styles.previewContent}>
          {inputText ? (
            <View style={styles.textWrapper}>{renderLines(inputText)}</View>
          ) : null}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5FC3C0', // Teal background from image
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    marginBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 52,
    color: '#000',
    fontWeight: 'bold',
  },
  settingsIcon: {
    width: 24,
    height: 24,
    tintColor: '#000',
    fontWeight:'bold',

  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(128, 128, 128, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft:160,
    marginTop:-72,
    marginBottom:4,
  },
  settingsText: {
    fontSize: 20,
    color: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  textInput: {
    height: 50,
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#000',
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 25,
    marginHorizontal: 20,
    marginBottom: 20,
    overflow: 'hidden',
  },
  previewContent: {
    padding: 15,
    flexGrow: 1,
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
});