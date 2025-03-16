import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Colors } from '../styles/colors'; // Adjust path as needed

type GameOverScreenProps = {
  score: number;
  result: {
    result: string;
    description: string;
    topic1: string;
    topic2: string;
    topic3: string;
    topic4: string;
    topic5: string;
    topic6: string;
    topic7: string;
    message1: string;
    message2: string;
    message3: string;
    message4: string;
    message5: string;
    message6: string;
    message7: string;
  };
  onRestart: () => void; // Callback to restart the game
};

export default function GameOverScreen({ score, result, onRestart }: GameOverScreenProps) {
  const topicsAndMessages = [
    { topic: result.topic1, message: result.message1 },
    { topic: result.topic2, message: result.message2 },
    { topic: result.topic3, message: result.message3 },
    { topic: result.topic4, message: result.message4 },
    { topic: result.topic5, message: result.message5 },
    { topic: result.topic6, message: result.message6 },
    { topic: result.topic7, message: result.message7 },
  ];

  return (
    <View style={styles.outerContainer}>

      <ScrollView contentContainerStyle={styles.scrolContainer}>
        {/* <Text style={styles.header}>Game Over</Text> */}
        <Text style={styles.header}>Score: {score}</Text>
        <Text style={styles.result}>Result: {result.result}</Text>
        <Text style={styles.description}>{result.description}</Text>

        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsHeader}>Suggestions for Improvement:</Text>
          {topicsAndMessages.map((item, index) => (
            <View key={index} style={styles.suggestionItem}>
              <Text style={styles.topic}>{item.topic}</Text>
              <Text style={styles.message}>{item.message}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.restartButton} onPress={onRestart}>
          <Text style={styles.restartText}>Restart Game</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    justifyContent: 'center', // Center vertically within the screen
    alignItems: 'center', // Center horizontally within the screen
    padding: 20,
    backgroundColor: 'rgba(50,100,50,0.7)', // Match the overlay style
    
  },
  scrolContainer: {
    flexGrow: 1,
    alignItems: 'center',
    // padding: 20,
    // backgroundColor: 'rgba(0,0,0,0.7)', // Match the overlay style
    // width: '100%',
    // overflow: 'scroll'
    
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  score: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 10,
  },
  result: {
    fontSize: 20,
    color: '#85fe78',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  suggestionsContainer: {
    width: '100%',
    marginBottom: 1,
  },
  suggestionsHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  suggestionItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
  },
  topic: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  message: {
    fontSize: 16,
    color: '#333',
  },
  restartButton: {
    backgroundColor: '#85fe78',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  restartText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#12181e',
  },
});