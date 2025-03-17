import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const ResultScreen = ({ score, totalQuestions, currentLevel, onNextLevel, onRetry }) => {
  // Using 70% passing threshold
  const passed = score >= Math.floor(totalQuestions * 0.7);

  if (passed) {
    // Success screen
    return (
      <View style={styles.resultContainer}>
        <View style={styles.resultContent}>
          <Text style={styles.resultHeaderText}>Great{'\n'}Job !</Text>

          <Image
            source={require('../../assets/congradulations1.png')}
            style={styles.resultEmoji}
            // Fallback if image is missing
            onError={() => console.log('Emoji image not found')}
          />

          <Text style={styles.resultScoreText}>{score}/{totalQuestions}</Text>

          <TouchableOpacity
            onPress={onNextLevel}
          >
            <LinearGradient
              style={styles.nextLevelButton}
              colors={['#03cdc0', '#7e34de']} // Blue to purple gradient
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
            >
              <Text style={styles.nextLevelButtonText}>
                {currentLevel < 5 ? 'Next Level' : 'Finish'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  } else {
    // Failed screen
    return (
      <View style={styles.resultContainer}>
        <View style={styles.resultContent}>
          <Text style={styles.resultHeaderText}>Try Again</Text>
          <Text style={styles.resultScoreText}>{score}/{totalQuestions}</Text>
          <Text style={styles.resultSubText}>
            You need at least {Math.floor(totalQuestions * 0.7)} correct answers
          </Text>

          <TouchableOpacity
            onPress={onRetry}
          >
            <LinearGradient
              style={styles.retryButton}
              colors={['#03cdc0', '#7e34de']} // Blue to purple gradient
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
            >
              <Text style={styles.nextLevelButtonText}>Retry Level</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  // Results screen styles
  resultContainer: {
    flex: 1,
    backgroundColor: '#63b9ca', // Teal background
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: '#63b9ca', // Darker teal border
  },
  resultContent: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultHeaderText: {
    fontSize: 56,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 30,
  },
  resultEmoji: {
    width: 200,
    height: 200,
    marginVertical: 30,
  },
  resultScoreText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'black',
    marginVertical: 20,
  },
  resultSubText: {
    fontSize: 22,
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  nextLevelButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 30,
    minWidth: 200,
    alignItems: 'center',
  },
  nextLevelButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  retryButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 30,
    minWidth: 200,
    alignItems: 'center',
  },
});

export default ResultScreen;