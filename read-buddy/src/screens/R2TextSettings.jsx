import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Picker } from '@react-native-picker/picker';
import firestore from '@react-native-firebase/firestore';
import { AppContext } from '../App.tsx';

export default function R2TextSettings({ navigation, route }) {
  const { scannedText, letterSettings: initialSettings } = route.params || {};
  const [letterSettings, setLetterSettings] = useState(initialSettings || {});
  const { loggedInUser } = useContext(AppContext);

  const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const colors = ['black', 'red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];

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
          if (data.textSettings && Object.keys(initialSettings || {}).length === 0) {
            setLetterSettings(data.textSettings); // Load saved settings if no initialSettings from route
          }
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSettingsFromFirestore();
  }, [loggedInUser, initialSettings]);

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
      const lowerChar = char.toLowerCase();
      const settings =
        letterSettings[lowerChar] || {
          fontSize: 18,
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

  const saveSettingsToFirestore = async () => {
    if (!loggedInUser) {
      alert('Error: User not logged in');
      return;
    }
    try {
      await firestore()
        .collection('snake_game_leadersboard')
        .doc(loggedInUser)
        .set({ textSettings: letterSettings }, { merge: true }); // Use set with merge to avoid overwriting other fields
      navigation.navigate('Scanned Text', { scannedText, letterSettings });
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    }
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.sentenceContainer}>
          <View style={styles.sentence}>
            {renderSentence('THE QUICK BROWN FOX JUMPS OVER A LAZY DOG.')}
          </View>
          <View style={styles.sentence}>
            {renderSentence('pack my box with five dozen liquor jugs.')}
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Text Settings</Text>

        <Text style={styles.subHeader}>Customize each letter below:</Text>

        {letters.map((letter) => (
          <View key={letter} style={styles.letterSettings}>
            <Text style={styles.letterTitle}>{letter}</Text>

            <Text>Font Size (12-20):</Text>
            <Slider
              minimumValue={12}
              maximumValue={20}
              step={0.5}
              value={letterSettings[letter]?.fontSize || 18}
              onValueChange={(value) => updateLetterSetting(letter, 'fontSize', value)}
              style={styles.slider}
            />

            <Text>Font Color:</Text>
            <Picker
              selectedValue={letterSettings[letter]?.color || 'black'}
              style={styles.picker}
              onValueChange={(value) => updateLetterSetting(letter, 'color', value)}
            >
              {colors.map((color) => (
                <Picker.Item key={color} label={color} value={color} />
              ))}
            </Picker>

            <Text>Boldness:</Text>
            <Switch
              value={letterSettings[letter]?.bold || false}
              onValueChange={(value) => updateLetterSetting(letter, 'bold', value)}
            />
          </View>
        ))}
      </ScrollView>

      <View style={styles.container}>
        <TouchableOpacity onPress={saveSettingsToFirestore}>
          <Text style={styles.positiveBtn}>Apply Settings</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
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
    color: '#000',
  },
  positiveBtn: {
    fontSize: 20,
    fontWeight: '600',
    color: '#12181e',
    padding: 10,
    margin: 5,
    backgroundColor: '#85fe78',
    borderRadius: 10,
    textAlign: 'center',
  },
});