import storage from '@react-native-firebase/storage';
import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  ImageBackground,
  SafeAreaView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import SignatureScreen from 'react-native-signature-canvas';
import Tts from 'react-native-tts';
import Video from 'react-native-video';
import writingWordsData from '../data/writing_words.json';
import lettersData from '../data/letters.json';
import { myurl } from '../data/url';

export default function WLevel1({ navigation, route }) {
  const signatureRef = useRef(null);
  const level = route.params?.level || 1;
  const [modelResult, setModelResult] = useState([]); // Current word result
  const [allResults, setAllResults] = useState([]); // Results for all 5 words
  const [currentWord, setCurrentWord] = useState(null);
  const [wordList, setWordList] = useState([]); // 5 selected words
  const [currentWordIndex, setCurrentWordIndex] = useState(0); // Index in wordList
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const [videoUrl, setVideoUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [videoQueue, setVideoQueue] = useState([]);

  const levelWords = writingWordsData.filter((word) => word.level === String(level));

  const click = async () => {
    try {
      const response = await fetch(myurl + '/words', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ word: currentWord.word }),
      });
      const data = await response.json();
      console.log('API Response:', data);
      // Convert 0/1 to false/true
      const result = data["res"].map((val) => val !== 0);
      return result;
    } catch (error) {
      console.error('Error fetching model result:', error);
      return null;
    }
  };

  useEffect(() => {
    resetLevel();
  }, [level]);

  const capitalizeFirstLetter = (word) => {
    if (!word) return '';
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  };

  const selectFiveWords = () => {
    const shuffled = [...levelWords].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(5, levelWords.length)).map((word) => ({
      ...word,
      word: capitalizeFirstLetter(word.word),
    }));
    return selected;
  };

  const resetLevel = () => {
    const newWordList = selectFiveWords();
    setWordList(newWordList);
    setCurrentWord(newWordList[0]);
    setCurrentWordIndex(0);
    setCurrentLetterIndex(0);
    setModelResult([]);
    setAllResults([]);
    setVideoUrl(null);
    setVideoQueue([]);
  };

  const moveToNextWord = () => {
    if (currentWordIndex + 1 < wordList.length) {
      setCurrentWord(wordList[currentWordIndex + 1]);
      setCurrentWordIndex(currentWordIndex + 1);
      setCurrentLetterIndex(0);
      setModelResult([]);
      setVideoUrl(null);
      setVideoQueue([]);
    } else {
      checkLevelCompletion();
    }
  };

  const checkLevelCompletion = () => {
    const allCorrect = allResults.every((result) => result.every((res) => res === true));
    if (allCorrect) {
      Alert.alert(
        'Congratulations!',
        `You've completed Level ${level} perfectly!`,
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
  };

  const playAudio = () => {
    try {
      if (currentWord) {
        Tts.setDefaultLanguage('en-US');
        Tts.setDefaultRate(0.3);
        Tts.speak(currentWord.word);
        console.log(`TTS: Speaking "${currentWord.word}"`);
      }
    } catch (e) {
      console.log('Error with TTS:', e);
      Alert.alert('Error', 'Failed to speak');
    }
  };

  const clearCanvas = () => {
    console.log('Clear button pressed');
    if (signatureRef.current) {
      signatureRef.current.clearSignature();
      console.log('Clear signature called');
    } else {
      console.log('Signature ref is not ready');
    }
  };

  const nextLetter = () => {
    console.log('Next button pressed');
    if (signatureRef.current) {
      setLoading(true);
      signatureRef.current.readSignature();
    } else {
      console.log('Signature ref is not ready');
    }
  };

  const submitWord = () => {
    console.log('Submit button pressed');
    if (signatureRef.current) {
      setLoading(true);
      signatureRef.current.readSignature();
    } else {
      console.log('Signature ref is not ready');
    }
  };

  const uploadSignature = async (base64Data) => {
    try {
      if (!base64Data || base64Data.length < 50) {
        console.log('Invalid or empty base64 data:', base64Data);
        Alert.alert('Error', 'Please draw something before submitting');
        setLoading(false);
        return;
      }
      const base64String = base64Data.replace(/^data:image\/\w+;base64,/, '');
      const storageRef = storage().ref(`screenshots/img_${currentLetterIndex}.jpg`);
      await storageRef.putString(base64String, 'base64', { contentType: 'image/jpeg' });
      console.log(`Uploaded img_${currentLetterIndex}.jpg`);

      clearCanvas();

      if (currentLetterIndex < currentWord.word.length - 1) {
        setCurrentLetterIndex(currentLetterIndex + 1);
        setLoading(false);
      } else {
        const result = await click();
        console.log('Model Result:', result);
        if (result === null) {
          setLoading(false);
          Alert.alert('Error', 'Failed to get model result. Please try again.');
          return;
        }

        setModelResult(result);
        setAllResults([...allResults, result]);
        setLoading(false);

        if (result.every((res) => res === true)) {
          console.log('All letters correct, moving to next word');
          moveToNextWord();
        } else {
          console.log('Some letters incorrect, queuing videos');
          const incorrectIndices = result
            .map((res, idx) => (res === false ? idx : null))
            .filter((idx) => idx !== null);
          const videosToPlay = incorrectIndices.map((idx) => {
            const letter = currentWord.word[idx];
            const letterData = lettersData.find((l) => l.letter === letter);
            return letterData ? letterData.answer : null;
          }).filter(Boolean);
          console.log('Videos to play:', videosToPlay);

          if (videosToPlay.length > 0) {
            setVideoQueue(videosToPlay);
            loadFirstVideo(videosToPlay);
          } else {
            console.log('No videos available, moving to next word');
            moveToNextWord();
          }
        }
      }
    } catch (error) {
      console.error('Error uploading signature:', error);
      Alert.alert('Error', 'Failed to upload signature');
      setLoading(false);
    }
  };

  const loadFirstVideo = async (queue) => {
    if (queue.length > 0) {
      const videoPath = queue[0];
      try {
        const videoRef = storage().ref(videoPath);
        const url = await videoRef.getDownloadURL();
        setVideoUrl(url);
      } catch (error) {
        console.error('Error fetching video:', error);
        Alert.alert('Error', 'Failed to fetch video');
        setVideoQueue(queue.slice(1));
        loadFirstVideo(queue.slice(1));
      }
    }
  };

  const nextVideo = () => {
    if (videoQueue.length > 0) {
      const nextQueue = videoQueue.slice(1);
      setVideoQueue(nextQueue);
      if (nextQueue.length > 0) {
        loadFirstVideo(nextQueue);
      } else {
        setVideoUrl(null);
        moveToNextWord();
      }
    }
  };

  const getOrdinal = (index) => {
    const n = index + 1;
    if (n % 10 === 1 && n % 100 !== 11) return `${n}st`;
    if (n % 10 === 2 && n % 100 !== 12) return `${n}nd`;
    if (n % 10 === 3 && n % 100 !== 13) return `${n}rd`;
    return `${n}th`;
  };

  const webStyle = `
    .m-signature-pad { width: 100%; height: 100%; margin: 0; padding: 0; }
    .m-signature-pad--body { border: none; width: 100%; height: 100%; }
    canvas { width: 100%; height: 100%; background-color: white; }
    .m-signature-pad--footer { display: none; }
    body { margin: 0; }
  `;

  return (
    <ImageBackground source={require('../assets/bg7.jpg')} style={styles.background} imageStyle={{opacity: 0.3}}>
      <SafeAreaView style={styles.container}>
        {!videoUrl && (
          <>
            <View style={styles.instructionCard}>
              <Text style={styles.instructionText}>
                Tap the speaker button to hear the pronunciation of the word.
              </Text>
              
              <Text style={styles.instructionText}>
                Listen carefully to the word.
              </Text>
              
              <Text style={styles.instructionText}>
                Type the word one letter at a time by clicking the Next button after each letter.
              </Text>
              
              <Text style={styles.highlightText}>
                1st letter should be capital
              </Text>
              
              <LinearGradient
                style={styles.speakerButton}
                colors={['#03cdc0', '#7e34de']} // Blue to purple gradient
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
              >
                <TouchableOpacity onPress={playAudio} style={styles.speakerTouchable}>
                  <Image source={require('../assets/speaker0.png')} style={styles.speakerIcon} />
                </TouchableOpacity>
              </LinearGradient>
            </View>
            
            <View style={styles.signatureCardContainer}>
              <View style={styles.signatureCard}>
                <View style={styles.canvasContainer}>
                  <SignatureScreen
                    ref={signatureRef}
                    webStyle={webStyle}
                    onOK={uploadSignature}
                    onEmpty={() => console.log('Signature is empty')}
                    onBegin={() => console.log('Drawing started')}
                    onEnd={() => console.log('Drawing ended')}
                  />
                </View>
                
                {/* Action buttons at the bottom of the white card */}
                <View style={styles.actionButtonsContainer}>
                  <TouchableOpacity
                    onPress={clearCanvas}
                    disabled={loading}
                    style={styles.buttonTouchable}
                  >
                    <LinearGradient
                      style={styles.actionButton}
                      colors={['#03cdc0', '#7e34de']} // Blue to purple gradient
                      start={{x: 0, y: 0}}
                      end={{x: 1, y: 0}}
                    >
                      <Text style={styles.actionButtonText}>CLEAR</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={currentLetterIndex < (currentWord?.word.length - 1 || 0) ? nextLetter : submitWord}
                    disabled={loading}
                    style={styles.buttonTouchable}
                  >
                    <LinearGradient
                      style={styles.actionButton}
                      colors={['#03cdc0', '#7e34de']} // Blue to purple gradient
                      start={{x: 0, y: 0}}
                      end={{x: 1, y: 0}}
                    >
                      <Text style={styles.actionButtonText}>NEXT</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </>
        )}

        {videoUrl && (
          <View style={styles.videoContainer}>
            <Text style={styles.videoTxt}>Nice Try! Here is the correct way to write it</Text>
            <Video
              source={{ uri: videoUrl }}
              style={styles.video}
              controls={true}
              resizeMode="contain"
              onLoad={() => console.log('Video loaded')}
              onError={(e) => {
                console.log('Video error:', e.error);
                Alert.alert('Error', 'Failed to play video');
                nextVideo();
              }}
            />
            <TouchableOpacity onPress={nextVideo} style={styles.nextVideoBtn}>
              <Text style={styles.nextVideoBtnText}>Next</Text>
            </TouchableOpacity>
          </View>
        )}

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#4e9ede" />
            <Text style={styles.loadingText}>Uploading...</Text>
          </View>
        )}
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  instructionCard: {
    width: '100%',
    backgroundColor: 'rgba(151, 216, 196, 0.9)',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
  },
  instructionText: {
    fontSize: 18,
    color: 'black',
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: '500',
  },
  highlightText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
  speakerButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  speakerTouchable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  speakerIcon: {
    width: 40,
    height: 40,
    tintColor: 'white',
  },
  signatureCardContainer: {
    width: '100%',
    flex: 1,
    marginVertical: 10,
  },
  signatureCard: {
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    justifyContent: 'space-between', // Ensures the buttons are at the bottom
  },
  canvasContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: 'white',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: 'white',
  },
  buttonTouchable: {
    width: '48%',
    overflow: 'hidden',
  },
  actionButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  videoContainer: {
    width: '100%',
    height: '80%',
    backgroundColor: 'black',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  video: {
    width: '100%',
    height: '80%',
  },
  videoTxt: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
    marginBottom: 15,
  },
  nextVideoBtn: {
    backgroundColor: '#4e9ede',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 15,
  },
  nextVideoBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 10,
  },
});