/* eslint-disable no-shadow */
/* eslint-disable react-hooks/exhaustive-deps */

import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Svg, { Text as SvgText } from 'react-native-svg';
import firestore from '@react-native-firebase/firestore';
import { AppContext } from '../App.tsx';
import { Image } from 'react-native-animatable';

export default function R1Scanned({ navigation, route }) {
  const scannedText = route.params?.scannedText || 'No text scanned yet';
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
    // Initial load
    loadSettingsFromFirestore();

    // Reload settings when screen regains focus
    const unsubscribe = navigation.addListener('focus', () => {
      loadSettingsFromFirestore(); // Fetch latest settings from Firestore
    });

    return unsubscribe;
  }, [navigation, loggedInUser]);

  // SVG TEXT RENDERING METHOD (same as TextInputScreen)
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
    const maxWidth = Math.max(400, longestLine.length * 25);
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
    <View style={styles.outerContainer}>
      <TouchableOpacity
        style={styles.settingsButton}
        onPress={() => navigation.navigate('Text Settings', { scannedText, letterSettings })}
      >
        <Image
          source={require('../assets/settings.png')}
          style={styles.settingsIcon}
        />
      </TouchableOpacity>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.textWrapper}>
          {renderTextWithSVG(scannedText)}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#5ECCD9', // Turquoise background color matching the image
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
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(128, 128, 128, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 160,
    marginTop: -52,
    marginBottom: 4,
  },
  settingsText: {
    fontSize: 20,
    color: 'white',
  },
  settingsIcon: {
    width: 25,
    height: 25,
    tintColor: '#000',
    fontWeight: 'bold',
  },

  // SVG specific styles
  svgContainer: {
    flex: 1,
    backgroundColor: 'transparent',
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
