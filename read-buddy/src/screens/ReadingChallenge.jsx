/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable curly */
/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator, Modal } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Sound from 'react-native-sound';
import questionsData from '../data/Reading_Activity.json';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import { AppContext } from '../App.tsx';
import { myurl } from '../data/url'; // Add this import
import ResultScreen from '../screens/rActivityScreen/ResultScreen';

export default function ReadingChallenge({ navigation }) {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState('splash');
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [correctWord, setCorrectWord] = useState('');
  const [correctWordProps, setCorrectWordProps] = useState({
    fontSize: 24,
    space: 2,
    hLetters: [],
    color: 'red',
  });

  // Sound state
  const [backgroundSound, setBackgroundSound] = useState(null);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  
  // Add context for logged in user
  const { loggedInUser } = useContext(AppContext);

  const levelStructure = {
    1: ['1-1', '1-2', '1-3', '1-4', '1-5'],
    2: ['2-1', '2-2', '2-3', '2-4'],
    3: ['3-1', '3-2', '3-3', '3-4', '3-5'],
    4: ['4-1', '4-2', '4-3'],
    5: ['5-1', '5-2', '5-3'],
  };

  // Save score to Firestore when gameState changes to 'results'
  useEffect(() => {
    if (gameState === 'results') {
      const totalQuestions = currentQuestions.length;
      saveScoreToFirestore(currentLevel, score, totalQuestions);
    }
  }, [gameState, currentLevel, score, currentQuestions]);

  // Initialize sound
  useEffect(() => {
    // Enable playback in silence mode (iOS)
    Sound.setCategory('Playback');

    // Load background music
    const sound = new Sound('background_music.mp3', Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.log('Failed to load sound', error);
        return;
      }
      console.log('Sound loaded successfully');
      setBackgroundSound(sound);
      
      // Set sound properties
      sound.setNumberOfLoops(-1); // Loop indefinitely
      sound.setVolume(0.3); // Set volume to 30%
      
      // Play background music if sound is enabled
      if (isSoundEnabled) {
        sound.play((success) => {
          if (!success) {
            console.log('Sound playback failed');
          }
        });
      }
    });

    // Cleanup when component unmounts
    return () => {
      if (sound) {
        sound.stop();
        sound.release();
      }
    };
  }, []);

  // Control sound based on game state
  useEffect(() => {
    if (backgroundSound && isSoundEnabled) {
      if (gameState === 'playing') {
        backgroundSound.setVolume(0.3); // Normal volume during gameplay
      } else if (gameState === 'splash') {
        backgroundSound.setVolume(0.2); // Lower volume during splash
      } else if (gameState === 'results') {
        backgroundSound.setVolume(0.1); // Even lower volume during results
      }
    }
  }, [gameState, backgroundSound, isSoundEnabled]);

  // Toggle sound function
  const toggleSound = () => {
    setIsSoundEnabled(!isSoundEnabled);
    if (backgroundSound) {
      if (!isSoundEnabled) {
        // Turn sound on
        backgroundSound.play((success) => {
          if (!success) {
            console.log('Sound playback failed');
          }
        });
      } else {
        // Turn sound off
        backgroundSound.pause();
      }
    }
  };

  useEffect(() => {
    console.log('Component mounted, loading level:', currentLevel);
    loadLevelQuestions();
    setGameState('splash');
    const timer = setTimeout(() => {
      setGameState('playing');
    }, 2000);

    return () => clearTimeout(timer);
  }, [currentLevel]);

  useEffect(() => {
    const fetchImage = async () => {
      const question = currentQuestions[currentQuestionIndex];
      if (question && question.image) {
        console.log('Fetching image for:', question.image);
        try {
          const storageRef = storage().ref(question.image);
          const url = await storageRef.getDownloadURL();
          console.log('Image URL resolved:', url);
          setImageUrl(url);
        } catch (error) {
          console.log('Image fetch error:', error);
          setImageUrl(null);
        }
      } else {
        console.log('No valid question or image at index:', currentQuestionIndex);
        setImageUrl(null);
      }
    };
    fetchImage();
  }, [currentQuestions, currentQuestionIndex]);

  const loadLevelQuestions = () => {
    setIsLoading(true);
    const sets = levelStructure[currentLevel];
    console.log('Loading sets for level', currentLevel, ':', sets);
    const selectedQuestions = sets.map((set) => {
      const setQuestions = questionsData.filter(
        (q) => q.level === currentLevel && q['q-set'] === set
      );
      console.log(`Found ${setQuestions.length} questions for set ${set}`);
      if (setQuestions.length === 0) {
        console.log(`Warning: No questions for set ${set}`);
        return null;
      }
      const randomQuestion = setQuestions[Math.floor(Math.random() * setQuestions.length)];
      console.log('Picked question:', randomQuestion);
      return randomQuestion;
    }).filter(q => q !== null);
    console.log('Final questions array:', selectedQuestions);
    setCurrentQuestions(selectedQuestions);
    setCurrentQuestionIndex(0);
    setScore(0);
    setImageUrl(null);
    setIsLoading(false);
  };

  const renderWord = (word, fontSize, space, hLetters, color) => {
    if (!word) return <Text>Invalid word</Text>;
    const normalizedHLetters = hLetters.map(letter => letter.toLowerCase());
    console.log('Rendering word:', word, 'hLetters:', normalizedHLetters, 'color:', color);
    return word.split('').map((char, index) => {
      const isHighlighted = normalizedHLetters.includes(char.toLowerCase());
      return (
        <Text
          key={index}
          style={{
            fontSize,
            letterSpacing: space,
            color: isHighlighted ? color : 'black',
            fontWeight: currentLevel > 2 ? 'bold' : 'normal',
          }}
        >
          {char}
        </Text>
      );
    });
  };

  const handleAnswer = (isCorrect) => {
    console.log('Answer chosen, isCorrect:', isCorrect);

    if (isCorrect) {
      setScore(score + 1);
      goToNextQuestion();
    } else {
      const currentQuestion = currentQuestions[currentQuestionIndex];
      setCorrectWord(currentQuestion.correct_word);
      setCorrectWordProps({
        fontSize: currentQuestion.font_size || 24,
        space: currentQuestion.space || 2,
        hLetters: currentQuestion.h_letter || [],
        color: currentQuestion.color || 'red',
      });
      setShowCorrectAnswer(true);

      setTimeout(() => {
        setShowCorrectAnswer(false);
        goToNextQuestion();
      }, 2000);
    }
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex + 1 < currentQuestions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setGameState('results');
    }
  };

  // Add the saveScoreToFirestore function from the second component
  const saveScoreToFirestore = async (level, score, totalQuestions) => {
    if (!loggedInUser) {
      console.log('No logged-in user, skipping Firestore update');
      return;
    }
    const textScore = `${level}.${score}`;
    try {
      // Step 1: Save score to Firestore
      console.log('Saving textScore to Firestore:', textScore);
      await firestore()
        .collection('snake_game_leadersboard')
        .doc(loggedInUser)
        .set({ textScore }, { merge: true });
      console.log(`Saved textScore: ${textScore} for user: ${loggedInUser}`);
  
      // Step 2: Fetch user's current textSettings
      console.log('Fetching user document from Firestore');
      const userDoc = await firestore()
        .collection('snake_game_leadersboard')
        .doc(loggedInUser)
        .get();
  
      if (!userDoc.exists) {
        throw new Error('User document does not exist');
      }
  
      // Get the text settings and ensure all properties exist
      const rawTextSettings = userDoc.data()?.textSettings || {};
      
      // Create a new object with all required properties for each letter
      const textSettings = {};
      Object.keys(rawTextSettings).forEach(letter => {
        textSettings[letter] = {
          fontSize: rawTextSettings[letter].fontSize || 16,
          color: rawTextSettings[letter].color || 'black',
          bold: rawTextSettings[letter].bold !== undefined ? rawTextSettings[letter].bold : false
        };
      });
      
      console.log('Processed textSettings:', textSettings);
  
      // Step 3: Call the /readchallenge API
      const apiUrl = `${myurl}/readchallenge`;
      console.log('Calling API at:', apiUrl);
      console.log('Request payload:', { user_id: loggedInUser, text_score: textScore, text_settings: textSettings });
  
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: loggedInUser,
          text_score: textScore,
          text_settings: textSettings,
        }),
      });
  
      // Log the raw response text before parsing
      const responseText = await response.text();
      console.log('Raw API response:', responseText);
  
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}: ${responseText}`);
      }
  
      // Attempt to parse as JSON
      const result = JSON.parse(responseText);
      console.log('Parsed API response:', result);
  
      if (result.status === 'success') {
        console.log('Successfully updated clustering and recommendations');
      } else {
        throw new Error(`API returned error: ${result.message}`);
      }
    } catch (error) {
      console.error('Error in saveScoreToFirestore:', error.message || error);
      Alert.alert('Error', `Failed to save score or update recommendations: ${error.message || 'Unknown error'}`);
    }
  };

  const handleNextLevel = () => {
    if (currentLevel < 5) {
      setCurrentLevel(currentLevel + 1);
    } else {
      Alert.alert('Congratulations!', 'You\'ve completed all levels!');
      navigation.goBack();
    }
  };

  const handleRetry = () => {
    loadLevelQuestions();
    setGameState('splash');

    setTimeout(() => {
      setGameState('playing');
    }, 2000);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4eb3af" />
        <Text>Loading game...</Text>
      </View>
    );
  }

  if (gameState === 'splash') {
    return (
      <View style={styles.splashContainer}>
        {/* Sound toggle button */}
        <TouchableOpacity style={styles.soundButton} onPress={toggleSound}>
          <Text style={styles.soundButtonText}>
            {isSoundEnabled ? '🔊' : '🔇'}
          </Text>
        </TouchableOpacity>

        <LinearGradient
          style={styles.levelCircle}
          colors={['#03cdc0', '#7e34de']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
        >
          <Text style={styles.levelNumber}>{currentLevel}</Text>
        </LinearGradient>
        <Text style={styles.splashText}>Level {currentLevel}</Text>
        <Text style={styles.splashSubText}>Get ready!</Text>
      </View>
    );
  }

  if (gameState === 'results') {
    const totalQuestions = currentQuestions.length;
    return (
      <ResultScreen
        score={score}
        totalQuestions={totalQuestions}
        currentLevel={currentLevel}
        onNextLevel={handleNextLevel}
        onRetry={handleRetry}
      />
    );
  }

  const currentQuestion = currentQuestions[currentQuestionIndex];
  if (!currentQuestion) {
    return (
      <View style={styles.container}>
        <Text>No questions available for this level.</Text>
      </View>
    );
  }

  const { correct_word, incorrect_word, font_size, space, h_letter, color } = currentQuestion;
  console.log('Rendering currentQuestion:', currentQuestion);
  const answers = [
    { text: correct_word, isCorrect: true },
    { text: incorrect_word, isCorrect: false },
  ];
  const shuffledAnswers = [...answers].sort(() => Math.random() - 0.5);

  const getFontFamily = () => {
    if (currentLevel <= 2) {
      return 'OpenDyslexic3-Regular';
    } else {
      return 'normal';
    }
  };

  return (
    <View style={styles.pageContainer}>
      {/* Sound toggle button */}
      <TouchableOpacity style={styles.soundButtonGame} onPress={toggleSound}>
        <Text style={styles.soundButtonText}>
          {isSoundEnabled ? '🔊' : '🔇'}
        </Text>
      </TouchableOpacity>

      <LinearGradient
        style={styles.levelCircle}
        colors={['#03cdc0', '#7e34de']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
      >
        <Text style={styles.levelNumber}>{currentQuestionIndex + 1}</Text>
      </LinearGradient>

      <View style={styles.questionCard}>
        <Text style={styles.questionText}>Choose the correct answer?</Text>

        {imageUrl ? (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              resizeMode="contain"
              onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
              onLoad={() => console.log('Image loaded successfully')}
            />
          </View>
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>Image not available</Text>
          </View>
        )}

        <View style={styles.answerContainer}>
          {shuffledAnswers.map((answer, index) => {
            const buttonHeight = font_size ? Math.max(font_size * 2.5, 60) : 60;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.answerButton,
                  { height: buttonHeight },
                ]}
                onPress={() => handleAnswer(answer.isCorrect)}
              >
                <View style={styles.answerTextContainer}>
                  <Text style={[
                    styles.answerText,
                    { fontFamily: getFontFamily() },
                  ]}>
                    {renderWord(answer.text, font_size || 24, space || 2, h_letter || [], color || 'red')}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <Modal
        transparent={true}
        visible={showCorrectAnswer}
        animationType="fade"
        onRequestClose={() => setShowCorrectAnswer(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Correct Answer:</Text>
            <View style={styles.modalAnswer}>
              <Text style={[
                styles.answerText,
                { fontFamily: getFontFamily() },
              ]}>
                {renderWord(
                  correctWord,
                  correctWordProps.fontSize,
                  correctWordProps.space,
                  correctWordProps.hLetters,
                  correctWordProps.color
                )}
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: '#6cbec9',
    alignItems: 'center',
    paddingTop: -10,
    paddingHorizontal: 16,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#6cbec9',
  },
  levelCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 0,
  },
  levelNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
  },
  questionCard: {
    backgroundColor: '#e1e1e1',
    borderRadius: 20,
    padding: -20,
    width: '100%',
    alignItems: 'center',
    minHeight: '70%',
  },
  questionText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  imageContainer: {
    width: 280,
    height: 280,
    marginVertical: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imagePlaceholder: {
    width: 280,
    height: 280,
    backgroundColor: '#d9d9d9',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#bbb',
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  answerContainer: {
    width: '100%',
    marginTop: 20,
  },
  answerButton: {
    backgroundColor: '#ffffff',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    width: '100%',
  },
  answerTextContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
  answerText: {
    textAlign: 'center',
    fontSize: 24,
    flexDirection: 'row',
    display: 'flex',
  },
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6cbec9',
  },
  splashText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 20,
  },
  splashSubText: {
    fontSize: 24,
    color: 'white',
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalAnswer: {
    padding: 15,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
  },
  
  // Sound button styles
  soundButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  soundButtonGame: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  soundButtonText: {
    fontSize: 24,
  },
});