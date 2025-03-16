import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import questionsData from '../data/Reading_Activity.json'; // Adjust path as needed
import storage from '@react-native-firebase/storage'; // Import your Firebase config

export default function ReadingChallenge({ navigation }) {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState('playing');
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const levelStructure = {
    1: ['1-1', '1-2', '1-3', '1-4', '1-5'],
    2: ['2-1', '2-2', '2-3', '2-4'],
    3: ['3-1', '3-2', '3-3', '3-4', '3-5'],
    4: ['4-1', '4-2', '4-3'],
    5: ['5-1', '5-2', '5-3'],
  };

  useEffect(() => {
    console.log('Component mounted, loading level:', currentLevel);
    loadLevelQuestions();
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
    setGameState('playing');
    setImageUrl(null);
    setIsLoading(false);
  };

  const renderWord = (word, fontSize, space, hLetters, color) => {
    if (!word) return <Text>Invalid word</Text>;
    // Normalize hLetters to lowercase for consistent comparison
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
            fontWeight: 'normal',
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
    }
    if (currentQuestionIndex + 1 < currentQuestions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setGameState('results');
    }
  };

  const handleNextLevel = () => {
    if (currentLevel < 5) {
      setCurrentLevel(currentLevel + 1);
    } else {
      Alert.alert('Congratulations!', 'You’ve completed all levels!');
      navigation.goBack();
    }
  };

  const handleRetry = () => {
    loadLevelQuestions();
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading game...</Text>
      </View>
    );
  }

  if (gameState === 'results') {
    const totalQuestions = currentQuestions.length;
    const passed = score === totalQuestions;
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Level {currentLevel} Results</Text>
        <Text style={styles.scoreText}>
          Score: {score} / {totalQuestions}
        </Text>
        <Text style={styles.resultText}>
          {passed ? 'Well done! You passed!' : 'Try again to pass.'}
        </Text>
        {passed ? (
          <TouchableOpacity onPress={handleNextLevel}>
            <Text style={styles.positiveBtn}>
              {currentLevel < 5 ? 'Next Level' : 'Finish'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleRetry}>
            <Text style={styles.positiveBtn}>Retry Level</Text>
          </TouchableOpacity>
        )}
      </View>
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

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Level {currentLevel} - Question {currentQuestionIndex + 1}</Text>
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
          onLoad={() => console.log('Image loaded successfully')}
        />
      ) : (
        <Text>Image not available</Text>
      )}
      <View style={styles.buttonContainer}>
        {shuffledAnswers.map((answer, index) => (
          <TouchableOpacity
            key={index}
            style={styles.answerButton}
            onPress={() => handleAnswer(answer.isCorrect)}
          >
            <Text style={styles.answerText}>
              {renderWord(answer.text, font_size, space, h_letter, color)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  image: {
    width: 300,
    height: 300,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  answerButton: {
    backgroundColor: '#bcbcbc', // Changed from #85fe78 to #bcbcbc
    padding: 15,
    borderRadius: 10,
    minWidth: 120,
    alignItems: 'center',
  },
  answerText: {
    textAlign: 'center',
    fontFamily: 'OpenDyslexic3-Regular',
  },
  scoreText: {
    fontSize: 20,
    marginVertical: 10,
  },
  resultText: {
    fontSize: 18,
    marginBottom: 20,
  },
  positiveBtn: {
    fontSize: 18,
    fontWeight: '600',
    color: '#12181e',
    padding: 10,
    backgroundColor: '#85fe78',
    borderRadius: 10,
  },
});