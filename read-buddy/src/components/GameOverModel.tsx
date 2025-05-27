import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { BlurView } from '@react-native-community/blur'; // Optional: for blur effect

interface GameOverModalProps {
  visible: boolean;
  score: number;
  level: number;
  isNewHighScore?: boolean;
  onSeeResult: () => void;
  onPlayAgain?: () => void;
}

const GameOverModal: React.FC<GameOverModalProps> = ({
  visible,
  score,
  level,
  isNewHighScore = false,
  onSeeResult,
  onPlayAgain,
}) => {
  const scaleValue = React.useRef(new Animated.Value(0)).current;
  const opacityValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset values when not visible
      scaleValue.setValue(0);
      opacityValue.setValue(0);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      statusBarTranslucent={true}
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.7)" barStyle="light-content" />
      
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: opacityValue }]}>
        
        {/* Main Modal Container */}
        <Animated.View 
          style={[
            styles.modalContainer,
            {
              transform: [{ scale: scaleValue }],
              opacity: opacityValue,
            }
          ]}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.gameOverIconContainer}>
              <Text style={styles.gameOverIcon}>💀</Text>
            </View>
            <Text style={styles.gameOverTitle}>Game Over!</Text>
            {isNewHighScore && (
              <View style={styles.newHighScoreBadge}>
                <Text style={styles.newHighScoreText}>🏆 NEW HIGH SCORE!</Text>
              </View>
            )}
          </View>

          {/* Stats Section */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Final Score</Text>
              <Text style={styles.statValue}>{score.toLocaleString()}</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Level Reached</Text>
              <Text style={styles.statValue}>{level}</Text>
            </View>
          </View>

          {/* Performance Indicator */}
          <View style={styles.performanceContainer}>
            <View style={styles.performanceBar}>
              <View 
                style={[
                  styles.performanceFill,
                  { 
                    width: `${Math.min((score / 500) * 100, 100)}%`,
                    backgroundColor: score > 300 ? '#4CAF50' : score > 150 ? '#FF9800' : '#F44336'
                  }
                ]} 
              />
            </View>
            <Text style={styles.performanceText}>
              {score > 300 ? 'Excellent!' : score > 150 ? 'Good Job!' : 'Keep Practicing!'}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.primaryButton]}
              onPress={onSeeResult}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>See Results</Text>
              <Text style={styles.buttonIcon}>📊</Text>
            </TouchableOpacity>

            {onPlayAgain && (
              <TouchableOpacity 
                style={[styles.button, styles.secondaryButton]}
                onPress={onPlayAgain}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryButtonText}>Play Again</Text>
                <Text style={styles.buttonIcon}>🔄</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Decorative Elements */}
          <View style={styles.decorativeElements}>
            <Text style={styles.decorativeEmoji}>⭐</Text>
            <Text style={styles.decorativeEmoji}>🎮</Text>
            <Text style={styles.decorativeEmoji}>⭐</Text>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    paddingVertical: 30,
    paddingHorizontal: 25,
    width: Math.min(screenWidth - 40, 350),
    maxHeight: screenHeight * 0.8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  header: {
    alignItems: 'center',
    marginBottom: 25,
  },
  gameOverIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFE5E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#FF6B6B',
  },
  gameOverIcon: {
    fontSize: 40,
  },
  gameOverTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 10,
  },
  newHighScoreBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFA500',
  },
  newHighScoreText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 8,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  statDivider: {
    width: 2,
    height: 40,
    backgroundColor: '#DEE2E6',
    marginHorizontal: 15,
  },
  performanceContainer: {
    marginBottom: 25,
    alignItems: 'center',
  },
  performanceBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E9ECEF',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  performanceFill: {
    height: '100%',
    borderRadius: 4,
  },
  performanceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    position: 'relative',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  secondaryButton: {
    backgroundColor: '#34C759',
    shadowColor: '#34C759',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  buttonIcon: {
    fontSize: 18,
  },
  decorativeElements: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 15,
  },
  decorativeEmoji: {
    fontSize: 20,
    opacity: 0.6,
  },
});

export default GameOverModal;