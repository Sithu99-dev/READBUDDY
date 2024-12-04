// Score.tsx
import React from 'react';
import { Text, StyleSheet } from 'react-native';

interface ScoreProps {
  score: number;
}

const Score: React.FC<ScoreProps> = ({ score }) => {
  return <Text style={styles.scoreText}>Score: {score}</Text>;
};

const styles = StyleSheet.create({
  scoreText: {
    fontSize: 18,
    color: '#12181e', // Matching color
    textAlign: 'center',
  },
});

export default Score;
