/* eslint-disable no-shadow */
/* eslint-disable react-hooks/exhaustive-deps */
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
import Svg, { Text as SvgText } from 'react-native-svg';
import firestore from '@react-native-firebase/firestore';
import { AppContext } from '../App.tsx';

export default function TextInputScreen({ navigation, route }) {
  const [inputText, setInputText] = useState('');
  const [letterSettings, setLetterSettings] = useState({});
  const { loggedInUser } = useContext(AppContext);

  const loadSettingsFromFirestore = async () => {
    if (!loggedInUser) {return;}
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
    loadSettingsFromFirestore();
    const unsubscribe = navigation.addListener('focus', () => {
      loadSettingsFromFirestore();
    });
    return unsubscribe;
  }, [navigation, loggedInUser]);

  // SVG TEXT RENDERING METHOD
  const renderLineWithSVG = (line, lineIndex) => {
    let xOffset = 10; // Start padding
    const yOffset = lineIndex * 70 + 50; // Line spacing and top margin
    const svgElements = [];

    line.split('').forEach((char, charIndex) => {
      if (char === ' ') {
        xOffset += 25; // Space width
        return;
      }

      const settings = letterSettings[char];
      const fontSize = (settings?.fontSize || 16) + 14;

      // Validate and fix color values
      let color = settings?.color || '#000';

      // Check if color is a valid color format
      const isValidColor = (colorStr) => {
        if (!colorStr) {return false;}
        // Check for hex colors (#000, #ffffff, etc.)
        if (colorStr.startsWith('#')) {return true;}
        // Check for your specific color values
        const validColors = ['#E53935', '#43A047', '#1E88E5', '#FDD835', '#8E24AA', '#FB8C00', '#3949AB', '#000000'];
        if (validColors.includes(colorStr)) {return true;}
        // Check for named colors
        const namedColors = ['red', 'green', 'blue', 'yellow', 'purple', 'orange', 'indigo', 'black'];
        return namedColors.includes(colorStr.toLowerCase());
      };

      // If color is invalid (like "10.0"), use black
      if (!isValidColor(color)) {
        console.log(`Invalid color "${color}" for character "${char}", using black instead`);
        color = '#000';
      }

      const bold = settings?.bold || false;

      svgElements.push(
        <SvgText
          key={`${lineIndex}-${charIndex}`}
          x={xOffset}
          y={yOffset}
          fontSize={fontSize}
          fill={color || '#000000'}
          stroke="none"
          fontFamily="OpenDyslexic3-Regular"
          fontWeight={bold ? 'bold' : 'normal'}
          textAnchor="start"
        >
          {char}
        </SvgText>
      );

      // Better character width calculation with inter-character spacing
      const getCharacterWidth = (char, fontSize, nextChar) => {
        let baseWidth;

        // Wide characters
        if ('mwMW'.includes(char)) {baseWidth = fontSize * 0.9;}
        // Narrow characters
        else if ('ijItf1'.includes(char)) {baseWidth = fontSize * 0.4;}
        else if (char === 'l') {baseWidth = fontSize * 0.5;}
        // Capital letters
        else if ('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.includes(char)) {baseWidth = fontSize * 0.7;}
        // Medium characters
        else if ('abcdefghknopqrsuvxyz'.includes(char)) {baseWidth = fontSize * 0.6;}
        // Numbers
        else if ('023456789'.includes(char)) {baseWidth = fontSize * 0.6;}
        // Default
        else {baseWidth = fontSize * 0.6;}

        // Add extra spacing between capital and lowercase letters
        if (nextChar &&
            'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.includes(char) &&
            'abcdefghijklmnopqrstuvwxyz'.includes(nextChar)) {
          baseWidth += fontSize * 0.1; // Add extra space
        }

        return baseWidth;
      };

      const nextChar = charIndex < line.length - 1 ? line[charIndex + 1] : null;
      const charWidth = getCharacterWidth(char, fontSize, nextChar);
      xOffset += charWidth;
    });

    return svgElements;
  };

  const renderTextWithSVG = (text) => {
    const lines = text.split('\n');
    const allElements = [];

    // Process each line
    lines.forEach((line, lineIndex) => {
      const lineElements = renderLineWithSVG(line, lineIndex);
      allElements.push(...lineElements);
    });

    // Calculate SVG dimensions dynamically
    const longestLine = lines.reduce((max, line) => line.length > max.length ? line : max, '');
    const maxWidth = Math.max(400, longestLine.length * 25); // Increased multiplier
    const maxHeight = Math.max(120, lines.length * 70 + 60);

    return (
      <View style={styles.svgContainer}>
        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.svgScrollContainer}
        >
          <ScrollView
            vertical={true}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.svgVerticalContainer}
          >
            <Svg
              height={maxHeight}
              width={maxWidth}
              viewBox={`0 0 ${maxWidth} ${maxHeight}`}
            >
              {allElements}
            </Svg>
          </ScrollView>
        </ScrollView>
      </View>
    );
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
          />
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
        multiline={true}
      />

      {/* Preview area for the formatted text */}
      <View style={styles.previewContainer}>
        {inputText ? (
          <View style={styles.textWrapper}>
            {renderTextWithSVG(inputText)}
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>
              Type something to see the preview
            </Text>
          </View>
        )}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  textInput: {
    minHeight: 50,
    maxHeight: 120,
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 15,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    color: '#000',
    textAlignVertical: 'top',
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 25,
    marginHorizontal: 20,
    marginBottom: 20,
    overflow: 'hidden',
  },
  textWrapper: {
    flex: 1,
    padding: 10,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderText: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
  },

  // SVG specific styles
  svgContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  svgScrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
  },
  svgVerticalContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 20,
  },
});
