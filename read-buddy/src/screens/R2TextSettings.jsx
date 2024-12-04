import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Switch,
  TextInput,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Picker } from '@react-native-picker/picker';

export default function R2TextSettings({ navigation }) {
  const [letterSettings, setLetterSettings] = useState({});
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const colors = [
    'red',
    'orange',
    'yellow',
    'green',
    'blue',
    'indigo',
    'violet',
    'black',
  ];

  const updateLetterSetting = (letter, key, value) => {
    setLetterSettings((prev) => ({
      ...prev,
      [letter]: {
        ...prev[letter],
        [key]: value,
      },
    }));
  };

  const renderSentence = (sentence) => {
    return sentence.split('').map((char, index) => {
      const settings =
        letterSettings[char] || {
          fontSize: 16,
          color: 'black',
          bold: false,
        };
      return (
        <Text
          key={index}
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
    });
  };

  // Filter letters based on search query
  const filteredLetters = letters.filter(letter => 
    letter.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Function to find a letter's settings quickly
  const findLetterSettings = (letter) => {
    setSearchQuery(letter);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Text Settings</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.subHeader}>Enter your text:</Text>
        <TextInput
          style={styles.textInput}
          multiline
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type or paste your text here..."
        />
      </View>

      <View style={styles.sentenceContainer}>
        <View style={styles.sentence}>
          {renderSentence(inputText || 'THE QUICK BROWN FOX JUMPS OVER A LAZY DOG.')}
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Text style={styles.subHeader}>Search Letters:</Text>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search for letters..."
        />
      </View>

      <Text style={styles.subHeader}>Customize each letter as desired</Text>

      {filteredLetters.map((letter) => (
        <View key={letter} style={styles.letterSettings}>
          <TouchableOpacity 
            onPress={() => findLetterSettings(letter)}
            style={styles.letterTitleContainer}
          >
            <Text style={styles.letterTitle}>{letter}</Text>
            {letterSettings[letter] && (
              <View style={[styles.settingsIndicator, { backgroundColor: letterSettings[letter].color || 'black' }]} />
            )}
          </TouchableOpacity>

          <Text>Font Size (12-20):</Text>
          <Slider
            minimumValue={12}
            maximumValue={20}
            step={0.5}
            value={letterSettings[letter]?.fontSize || 16}
            onValueChange={(value) =>
              updateLetterSetting(letter, 'fontSize', value)
            }
            style={styles.slider}
          />

          <Text>Font Color:</Text>
          <Picker
            selectedValue={letterSettings[letter]?.color || 'black'}
            style={styles.picker}
            onValueChange={(value) =>
              updateLetterSetting(letter, 'color', value)
            }
          >
            {colors.map((color) => (
              <Picker.Item key={color} label={color} value={color} />
            ))}
          </Picker>

          <Text>Boldness:</Text>
          <Switch
            value={letterSettings[letter]?.bold || false}
            onValueChange={(value) =>
              updateLetterSetting(letter, 'bold', value)
            }
          />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  topButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  btnIcon: {
    width: 30,
    height: 30,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  inputContainer: {
    marginVertical: 10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  searchContainer: {
    marginVertical: 10,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  sentenceContainer: {
    marginVertical: 20,
  },
  sentence: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 5,
    padding: 5,
    margin: 5,
  },
  subHeader: {
    fontSize: 20,
    marginVertical: 10,
  },
  letterSettings: {
    marginVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 10,
  },
  letterTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  letterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  settingsIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  picker: {
    height: 50,
    width: '100%',
  },
});