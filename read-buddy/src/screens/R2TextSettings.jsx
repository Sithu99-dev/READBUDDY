import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Switch,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Picker } from '@react-native-picker/picker';

export default function R2TextSettings({ navigation }) {
  const [letterSettings, setLetterSettings] = useState({});

  const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const colors = [
    'red',
    'orange',
    'yellow',
    'green',
    'blue',
    'indigo',
    'violet',
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
      const lowerChar = char;
      const settings =
        letterSettings[lowerChar] || {
          fontSize: 16,
          color: 'black',
          bold: false,
        };
      return (
        <Text
          key={index}
          style={{
            fontFamily:'OpenDyslexic3-Regular',
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

  return (
    <ScrollView contentContainerStyle={styles.container}>

      <Text style={styles.header}>Text Settings</Text>

      <View style={styles.sentenceContainer}>
        <View style={styles.sentence}>
          {renderSentence('THE QUICK BROWN FOX JUMPS OVER A LAZY DOG.')}
        </View>

        <View style={styles.sentence}>
          {renderSentence('pack my box with five dozen liquor jugs.')}
        </View>
      </View>

      <Text style={styles.subHeader}>Let the child read the sentences above and personalize each letter as desired.</Text>

      {letters.map((letter) => (
        <View key={letter} style={styles.letterSettings}>
          <Text style={styles.letterTitle}>{letter}</Text>

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
  sentenceContainer: {
    marginVertical: 20,
  },
  sentence: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderWidth: 1, // Thickness of the border
    borderColor: 'black', // Color of the border
    borderRadius: 5, // Optional: rounded corners
    padding: 5, // Optional: spacing inside the border
    margin:5
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
  letterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
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
