import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
  Platform,
  PermissionsAndroid,
  Image,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import words from '../data/speach_words.json';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import Sound from 'react-native-sound';
import storage from '@react-native-firebase/storage';
import { myurl } from '../data/url';
import IncorrectPronunciationPopup from './voice/IncorrectPronunciationPopup';
import SuccessPopup from './SuccessPopup';


const audioRecorderPlayer = new AudioRecorderPlayer();

export default function LetterAnimation({ navigation, route }) {
  const level = route.params?.level || 1;
  const [animationStep, setAnimationStep] = useState(1);
  const [status, setStatus] = useState('Say the word you see!');
  const [isAnimating, setIsAnimating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [modelResult, setModelResult] = useState(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [wordResults, setWordResults] = useState([]);
  const [imageUrl, setImageUrl] = useState(null);
  const [showIncorrectPopup, setShowIncorrectPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const click = async () => {
    try {
      const response = await fetch(myurl + '/speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ word: word }),
      });
      const data = await response.json();
      console.log('API Response:', data);
      return data["res"];
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  };

  const levelWords = words.filter((word) => word.level === level);
  const MAX_LETTERS = 10;
  const letterAnimations = useRef(
    Array(MAX_LETTERS)
      .fill(null)
      .map(() => new Animated.ValueXY({ x: 0, y: -100 }))
  ).current;

  useEffect(() => {
    resetForNewWord(0);
    loadImage(0);
  }, [level, loadImage]);

  const selectedWord = levelWords[currentWordIndex] || levelWords[0];
  const letterGroups = selectedWord.letterGroups;
  const word = selectedWord.word;
  const letterColors = selectedWord.letterColors;
  const audioPath = selectedWord.audio;

  const screenWidth = Dimensions.get('window').width;
  const fontSize = 50;
  
  // Dynamic letter spacing based on word length
  const getDynamicSpacing = () => {
    const totalLetters = letterGroups?.length || word.length;
    if (totalLetters <= 4) return 20;
    if (totalLetters <= 6) return 15;
    if (totalLetters <= 8) return 10;
    return 8; // For very long words
  };
  
  const letterSpacing = getDynamicSpacing();

  useEffect(() => {
    letterAnimations.forEach((anim) => {
      anim.setValue({ x: 0, y: -100 });
    });
  }, [currentWordIndex, letterAnimations]);

  const loadImage = useCallback(async (index) => {
    try {
      const imageRef = storage().ref(levelWords[index].image);
      const url = await imageRef.getDownloadURL();
      setImageUrl(url);
    } catch (error) {
      console.error('Error loading image:', error);
      setImageUrl(null);
    }
  }, [levelWords]);

  const resetForNewWord = (index) => {
    setCurrentWordIndex(index);
    setAnimationStep(1);
    setIsAnimating(false);
    setModelResult(null);
    setStatus('Say the word you see!');
    setCountdown(5);
    setShowIncorrectPopup(false);
  };

  const startAnimation = async () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setStatus(`Animating "${word}" and playing audio...`);
    setAnimationStep(2);
    
    // Close popup if it's open
    setShowIncorrectPopup(false);

    // Play the correct audio when animation starts
    await playCorrectAudio();

    const animations = letterGroups.map((_, index) => {
      // Calculate positions for horizontal layout
      const totalLetters = letterGroups.length;
      const letterWidth = 40; // Fixed width per letter
      const spacing = totalLetters > 6 ? 8 : 12; // Adjust spacing based on word length
      const totalWidth = totalLetters * letterWidth + (totalLetters - 1) * spacing;
      const containerWidth = screenWidth - 40;
      const startX = Math.max(10, (containerWidth - totalWidth) / 2);
      
      return Animated.timing(letterAnimations[index], {
        toValue: { 
          x: startX + index * (letterWidth + spacing), 
          y: 0 
        },
        duration: 800,
        delay: index * 100,
        useNativeDriver: true,
      });
    });

    Animated.parallel(animations).start(() => {
      setIsAnimating(false);
      setStatus('Animation complete! Click Reset to start over.');
    });
  };

  const resetAnimation = () => {
    setAnimationStep(1);
    setIsAnimating(false);
    setStatus('Say the word you see!');
    letterAnimations.forEach((anim) => {
      anim.setValue({ x: 0, y: -100 });
    });
  };

  const requestMicPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'This app needs access to your microphone to record audio.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Microphone permission granted');
          return true;
        } else {
          console.log('Microphone permission denied');
          setStatus('Microphone permission denied. Please enable it in settings.');
          return false;
        }
      } catch (err) {
        console.warn('Permission request error:', err);
        setStatus('Error requesting permission. Try again.');
        return false;
      }
    }
    return true; // iOS handles via Info.plist
  };

  const startRecording = async () => {
    if (isRecording) return;

    const hasPermission = await requestMicPermission();
    if (!hasPermission) return;

    setIsRecording(true);
    setStatus('Recording...');
    setCountdown(5);

    try {
      const uri = await audioRecorderPlayer.startRecorder();
      console.log('Recording started at:', uri);

      let timeLeft = 5;
      const countdownInterval = setInterval(() => {
        timeLeft -= 1;
        setCountdown(timeLeft);
        if (timeLeft <= 0) {
          clearInterval(countdownInterval);
          stopRecording();
        }
      }, 1000);
    } catch (error) {
      console.error('Recording error:', error);
      setIsRecording(false);
      setStatus('Failed to start recording. Try again.');
    }
  };

const stopRecording = async () => {
  try {
    const uri = await audioRecorderPlayer.stopRecorder();
    console.log('Recording stopped at:', uri);
    setIsRecording(false);
    setStatus('Uploading audio...');

    const reference = storage().ref(`speechrecord/audio.mp3`);
    await reference.putFile(uri);
    const downloadURL = await reference.getDownloadURL();
    console.log('Uploaded to Firebase:', downloadURL);

    const result = await click();
    console.log('Model Result:', result);
    if (result === null) {
      setStatus('Error fetching model result. Try again.');
      return;
    }

    setModelResult(result);
    setWordResults((prev) => [...prev.slice(0, currentWordIndex), result]);

    if (result === true) {
      // Show custom success popup instead of Alert.alert
      setShowSuccessPopup(true);
      setStatus('Perfect! Click Next to continue');
    } else {
      setStatus('Listen to the correct pronunciation');
      setShowIncorrectPopup(true);
    }
  } catch (error) {
    console.error('Stop recording/upload error:', error);
    setStatus('Error uploading audio. Try again.');
  }
};

const handleSuccessClose = () => {
  setShowSuccessPopup(false);
};


  const playCorrectAudio = async () => {
    try {
      const soundRef = storage().ref(audioPath);
      const url = await soundRef.getDownloadURL();

      const sound = new Sound(url, null, (error) => {
        if (error) {
          console.log('Failed to load sound', error);
          setStatus('Error playing audio. Click Replay to try again.');
          return;
        }
        sound.play(() => {
          sound.release();
          setStatus('Click Replay to hear again');
        });
      });
    } catch (error) {
      console.error('Audio playback error:', error);
      setStatus('Error fetching audio. Try again.');
    }
  };

  const replayAudio = async () => {
    setStatus('Replaying audio...');
    await playCorrectAudio();
  };

  const goToNextWord = () => {
    if (currentWordIndex + 1 < levelWords.length) {
      const nextIndex = currentWordIndex + 1;
      resetForNewWord(nextIndex);
      loadImage(nextIndex);
    } else {
      const allCorrect = wordResults.every((result) => result === true);
      if (allCorrect) {
        Alert.alert(
          'Congratulations!',
          'All the Answers are Correct!',
          [{ text: 'Back to Levels', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert(
          'Keep Going!',
          'Some answers were incorrect. Try this level again to improve!',
          [
            { text: 'Try Again', onPress: () => resetLevel() },
            { text: 'Back to Levels', onPress: () => navigation.goBack() },
          ]
        );
      }
    }
  };

  const resetLevel = () => {
    setCurrentWordIndex(0);
    setWordResults([]);
    resetForNewWord(0);
    loadImage(0);
  };

  const renderInitialWord = () => (
    <View style={styles.dividedLettersInit}>
      <Text style={[styles.initialWordText, { fontSize, color: '#000' }]}>{word}</Text>
    </View>
  );

  const renderAnimatedLetters = () => {
    const totalLetters = letterGroups.length;
    let adjustedFontSize = fontSize;
    
    // Scale down font size for very long words
    if (totalLetters > 8) {
      adjustedFontSize = 35;
    } else if (totalLetters > 6) {
      adjustedFontSize = 42;
    }
    
    return (
      <View style={styles.dividedLetters}>
        {letterGroups.map((group, index) => (
          <Animated.Text
            key={index}
            style={[
              styles.animatedLetter,
              { 
                fontSize: adjustedFontSize,
                color: letterColors[index % letterColors.length] 
              },
              { transform: letterAnimations[index].getTranslateTransform() },
            ]}
          >
            {group}
          </Animated.Text>
        ))}
      </View>
    );
  };

  return (
    <ScrollView 
      style={styles.scrollContainer}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        <View style={styles.levelIndicator}>
          <Text style={styles.levelText}>{level}</Text>
        </View>
        <View style={styles.instructions}>
          <Text style={styles.titleText}>Say the word</Text>
          <Text style={styles.wordTitle}>{word}</Text>
        </View>
        <Text style={styles.status}>
          {isRecording ? `Recording: ${countdown}s` : status}
        </Text>

        <View style={styles.animationContainer}>
          {imageUrl && (
            <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="contain" />
          )}
          {animationStep === 1 && renderInitialWord()}
          {animationStep === 2 && renderAnimatedLetters()}
        </View>

        {/* Initial State: Show only Speak button */}
        {modelResult === null && (
          <View style={styles.maincontrols}>
            <TouchableOpacity
              style={[styles.micContainer, isRecording && styles.buttonDisabled]}
              onPress={startRecording}
              disabled={isRecording}
            >
              <LinearGradient
                style={styles.micGradient}
                colors={['#FF6B6B', '#FF8E8E']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Image 
                  source={require('../assets/voice.png')} 
                  style={styles.microphoneIcon} 
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Conditional Buttons */}
        <View style={styles.controls}>
          {/* If modelResult is false, show Start Animation, Reset, Replay */}
          {modelResult === false && (
            <>
            <View style={styles.maincontrols}>
              <TouchableOpacity
                style={[styles.animationButtonContainer, isAnimating && styles.buttonDisabled]}
                onPress={startAnimation}
                disabled={isAnimating}
              >
               <LinearGradient
                    style={styles.animationGradientButton}
                    colors={['#4ECDC4', '#44A08D']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                  <Text style={styles.animationButtonText}>🎬 Start Animation</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButtonContainer, isRecording && styles.buttonDisabled]}
                onPress={startRecording}
                disabled={isRecording}
              >
                <LinearGradient
                  style={styles.actionGradientButton}
                  colors={['#667eea', '#764ba2']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                >
                  <Text style={styles.actionButtonText}>🎤 Speak</Text>
                </LinearGradient>
              </TouchableOpacity>
        
              <TouchableOpacity
                style={[styles.actionButtonContainer, animationStep === 1 && styles.buttonDisabled]}
                onPress={resetAnimation}
                disabled={animationStep === 1}
              >
                <LinearGradient
                  style={styles.actionGradientButton}
                  colors={['#F093FB', '#F5576C']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                >
                  <Text style={styles.actionButtonText}>🔄 Reset</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButtonContainer}
                onPress={replayAudio}
              >
                <LinearGradient
                  style={styles.actionGradientButton}
                  colors={['#4FACFE', '#00F2FE']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                >
                  <Text style={styles.actionButtonText}>🔊 Replay</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
            </>
          )}

          {/* If modelResult is true, show only Next button */}
          {modelResult === true && (
            <TouchableOpacity 
              style={styles.nextButtonContainer}
              onPress={goToNextWord}
            >
              <LinearGradient
                style={styles.nextGradientButton}
                colors={['#A8E6CF', '#7FCDCD']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
              >
                <Text style={styles.nextButtonText}>➡️ Next</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        {/* Incorrect Pronunciation Popup */}
        <IncorrectPronunciationPopup
          visible={showIncorrectPopup}
          onClose={() => setShowIncorrectPopup(false)}
          onStartAnimation={startAnimation}
        />
      </View>
        <SuccessPopup
        visible={showSuccessPopup}
        onClose={handleSuccessClose}
        title="🎉 Excellent!"
        message="Your pronunciation is perfect!"
        buttonText="Next Word"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: 'rgba(151, 216, 196, 0.8)',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 50,
  },
  background: {
    flex: 1,
    width: '100%',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 15,
  },
  titleText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#333',
  },
  micContainer: {
    borderRadius: 50,
    overflow: 'hidden',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  micGradient: {
    padding: 20,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  microphoneIcon: {
    width: 60,
    height: 60,
    tintColor: 'white',
  },
  wordTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginVertical: 8,
  },
  levelIndicator: {
    position: 'absolute',
    top: 20,
    left: '55%',
    marginLeft: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    marginTop:10,
    marginBottom:10,
  },
  levelText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  header: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  instructions: {
    backgroundColor: 'rgba(214, 220, 241, 0.6)',
    borderRadius: 10,
    padding: 15,
    shadowColor: 'rgba(180, 186, 243, 0.5)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 20,
    maxWidth: 500,
    justifyContent:'center',
    alignItems: 'center',
    width:'100%',
  },
  instructionsText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  animationContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#fff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '80%',
    height: 150,
    position: 'absolute',
    top: 10,
  },
  dividedLetters: {
    position: 'absolute',
    top: 200,
    left: 0,
    width: '100%',
    height: 80,
  },
  dividedLettersInit: {
    position: 'absolute',
    top: 200,
    width: '100%',
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialWordText: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  animatedLetter: {
    fontWeight: 'bold',
    position: 'absolute',
    textAlign: 'center',
    minWidth: 40,
    top: 0,
  },
  letter: {
    fontWeight: 'bold',
    marginRight: 10,
  },
  controls: {
    width: '100%',
    alignItems: 'center',
  },
  maincontrols: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  status: {
    backgroundColor: '#fba49a',
    padding: 10,
    borderRadius: 40,
    marginTop: -10,
    marginBottom:30,
    fontWeight: '800',
    textAlign: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.7,
    shadowRadius: 6,
  },
  // Animation Button Styles
  animationButtonContainer: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
    width: '85%',
    maxWidth: 320,
    marginBottom: 20,
  },
  animationGradientButton: {
    paddingVertical: 18,
    paddingHorizontal: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
  },
  animationButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 0.5,
  },
  // Action Button Styles (Speak, Reset, Replay)
  actionButtonContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
    flex: 1,
    minWidth: 100,
    maxWidth: 130,
  },
  actionGradientButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    textAlign: 'center',
  },
  // Next Button Styles
  nextButtonContainer: {
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#A8E6CF',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.5,
    shadowRadius: 25,
    elevation: 20,
    width: '70%',
    maxWidth: 280,
    marginTop: 20,
  },
  nextGradientButton: {
    paddingVertical: 20,
    paddingHorizontal: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
  },
  nextButtonText: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 1,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    height: '70%',
    backgroundColor: '#ffffff',
    borderRadius: 30,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 25,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2c3e50',
    marginBottom: 30,
    textAlign: 'center',
  },
  modalAnimationArea: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(151, 216, 196, 0.1)',
    borderRadius: 20,
    marginBottom: 20,
    position: 'relative',
  },
  closeModalButton: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#ff7675',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  closeModalGradient: {
    paddingVertical: 15,
    paddingHorizontal: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeModalText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});