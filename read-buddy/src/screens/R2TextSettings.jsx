import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  TextInput,
  Modal,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import Slider from '@react-native-community/slider';
import firestore from '@react-native-firebase/firestore';
import { AppContext } from '../App.tsx';
import LinearGradient from 'react-native-linear-gradient'; // Import LinearGradient

export default function R2TextSettings({ navigation, route }) {
  const { scannedText, inputText, letterSettings: initialSettings } = route.params || {};
  const [letterSettings, setLetterSettings] = useState(initialSettings || {});
  const [searchQuery, setSearchQuery] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState(null);
  const { loggedInUser } = useContext(AppContext);

  const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const colors = [
    { name: 'Red', value: '#E53935' },
    { name: 'Green', value: '#43A047' },
    { name: 'Blue', value: '#1E88E5' },
    { name: 'Yellow', value: '#FDD835' },
    { name: 'Purple', value: '#8E24AA' },
    { name: 'Orange', value: '#FB8C00' },
    { name: 'Indigo', value: '#3949AB' },
    { name: 'Black', value: '#000000' },
  ];

  // Filter letters based on search query
  const filteredLetters = letters.filter(letter => 
    letter.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const renderLetterPreview = () => {
    return 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((char, index) => {
      const settings =
        letterSettings[char] || {
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
            color: settings.color || 'black',
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
      Alert.alert('Error', 'User not logged in');
      return;
    }
    try {
      await firestore()
        .collection('snake_game_leadersboard')
        .doc(loggedInUser)
        .set({ textSettings: letterSettings }, { merge: true });
      Alert.alert('Success', 'Settings Applied');
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const getColorName = (colorValue) => {
    const color = colors.find(c => c.value === colorValue);
    return color ? color.name : 'Select color';
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#5FC3C0" barStyle="dark-content" />
      
      {/* Header with back button and title */}
      <View style={styles.header}>

        <Text style={styles.headerTitle}>Text Settings</Text>
      </View>
      
      {/* Preview sections */}
      <View style={styles.previewContainer}>
        <View style={styles.previewText}>
          {renderLetterPreview('THE QUICK BROWN FOX JUMPS OVER A LAZY DOG.')}
        </View>
      </View>
      
      {/* Search bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search letter"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.searchIcon}>
          <Text>🔍</Text>
        </TouchableOpacity>
      </View>
      
      {/* Scrollable settings */}
      <ScrollView style={styles.scrollView}>
        {filteredLetters.map((letter) => (
          <View key={letter} style={styles.letterSettings}>
            <Text style={styles.letterTitle}>Letter - {letter}</Text>
            
            <View style={styles.settingsCard}>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Font Size (18 - 34)</Text>
                <Slider
                  minimumValue={12}
                  maximumValue={24}
                  step={1}
                  value={letterSettings[letter]?.fontSize || 18}
                  onValueChange={(value) => updateLetterSetting(letter, 'fontSize', value)}
                  style={styles.slider}
                  minimumTrackTintColor="#5F4B8B"
                  thumbTintColor="#5F4B8B"
                />
              </View>
              
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Font Color</Text>
                <TouchableOpacity 
                  style={styles.colorSelector}
                  onPress={() => {
                    setSelectedLetter(letter);
                    setShowColorPicker(true);
                  }}
                >
                  <Text style={styles.colorSelectorText}>
                    {getColorName(letterSettings[letter]?.color || '#000000')}
                  </Text>
                  <Text style={styles.dropdownIcon}>▼</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Boldness</Text>
                <Switch
                  value={letterSettings[letter]?.bold || false}
                  onValueChange={(value) => updateLetterSetting(letter, 'bold', value)}
                  trackColor={{ false: "#D9D9D9", true: "#5F4B8B" }}
                  thumbColor={letterSettings[letter]?.bold ? "#FFFFFF" : "#F4F3F4"}
                />
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
      
      {/* Color picker modal */}
      <Modal
        visible={showColorPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowColorPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.colorPickerContainer}>
            {colors.map((color) => (
              <TouchableOpacity
                key={color.name}
                style={styles.colorOption}
                onPress={() => {
                  updateLetterSetting(selectedLetter, 'color', color.value);
                  setShowColorPicker(false);
                }}
              >
                <Text style={styles.colorName}>{color.name}</Text>
                <View style={[styles.colorSample, { backgroundColor: color.value }]} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
      
      {/* Apply button with LinearGradient */}
      <TouchableOpacity onPress={saveSettingsToFirestore}>
        <LinearGradient
          style={styles.applyButton}
          colors={['#03cdc0', '#7e34de']} // Blue to purple gradient
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
        >
          <Text style={styles.applyButtonText}>Apply Settings</Text>
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#5FC3C0', // Teal background from image
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 28,
    color: '#000',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  previewContainer: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 8,
    padding: 10,
  },
  previewText: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#E9E6EF',
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 25,
    padding: 5,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    padding: 10,
    fontSize: 16,
  },
  searchIcon: {
    padding: 10,
    borderTopRightRadius: 25,
    borderBottomRightRadius: 25,
  },
  scrollView: {
    flex: 1,
    marginBottom: 10,
  },
  letterSettings: {
    marginHorizontal: 15,
    marginVertical: 5,
  },
  letterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  settingsCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
  },
  settingRow: {
    marginBottom: 15,
  },
  settingLabel: {
    fontSize: 16,
    marginBottom: 5,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  colorSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 20,
    padding: 10,
    backgroundColor: 'white',
  },
  colorSelectorText: {
    fontSize: 16,
    color: '#666',
  },
  dropdownIcon: {
    fontSize: 12,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  colorPickerContainer: {
    width: '70%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
  },
  colorOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  colorName: {
    fontSize: 16,
  },
  colorSample: {
    width: 30,
    height: 20,
    borderRadius: 5,
  },
  applyButton: {
    borderRadius: 10,
    padding: 15,
    margin: 15,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF', // Changed to white for better contrast with gradient
  }
});