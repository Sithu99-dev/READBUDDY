import React, { useEffect, useRef } from 'react';
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
import LinearGradient from 'react-native-linear-gradient';

interface SuccessPopupProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  buttonText?: string;
}

const SuccessPopup: React.FC<SuccessPopupProps> = ({
  visible,
  onClose,
  title = 'Success!',
  message = 'Your answer is correct!',
  buttonText = 'Continue',
}) => {
  const scaleValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;
  const confettiAnimation = useRef(new Animated.Value(0)).current;
  const checkMarkScale = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      // Start all animations
      Animated.parallel([
        // Modal scale and opacity
        Animated.spring(scaleValue, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        // Confetti animation
        Animated.sequence([
          Animated.delay(200),
          Animated.timing(confettiAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        // Check mark animation
        Animated.sequence([
          Animated.delay(400),
          Animated.spring(checkMarkScale, {
            toValue: 1,
            useNativeDriver: true,
            tension: 100,
            friction: 5,
          }),
        ]),
      ]).start();

      // Pulse animation for the check mark
      const pulseLoop = () => {
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (visible) pulseLoop();
        });
      };
      
      setTimeout(pulseLoop, 600);
    } else {
      // Reset animations
      scaleValue.setValue(0);
      opacityValue.setValue(0);
      confettiAnimation.setValue(0);
      checkMarkScale.setValue(0);
      pulseAnimation.setValue(1);
    }
  }, [visible]);

  const confettiPieces = Array.from({ length: 20 }, (_, index) => ({
    id: index,
    delay: Math.random() * 500,
    duration: 1000 + Math.random() * 1000,
    startX: Math.random() * screenWidth,
    endY: screenHeight + 100,
    color: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][Math.floor(Math.random() * 5)],
    size: 8 + Math.random() * 6,
  }));

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      statusBarTranslucent={true}
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.8)" barStyle="light-content" />
      
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: opacityValue }]}>
        
        {/* Confetti Animation */}
        {confettiPieces.map((piece) => (
          <Animated.View
            key={piece.id}
            style={[
              styles.confettiPiece,
              {
                backgroundColor: piece.color,
                width: piece.size,
                height: piece.size,
                left: piece.startX,
                transform: [
                  {
                    translateY: confettiAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-50, piece.endY],
                    }),
                  },
                  {
                    rotate: confettiAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '720deg'],
                    }),
                  },
                ],
                opacity: confettiAnimation.interpolate({
                  inputRange: [0, 0.8, 1],
                  outputRange: [1, 1, 0],
                }),
              },
            ]}
          />
        ))}

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
          {/* Success Icon with Pulse Animation */}
          <Animated.View 
            style={[
              styles.successIconContainer,
              {
                transform: [
                  { scale: checkMarkScale },
                  { scale: pulseAnimation }
                ],
              }
            ]}
          >
            <LinearGradient
              colors={['#4CAF50', '#45A049']}
              style={styles.successIconGradient}
            >
              <Text style={styles.checkMark}>✓</Text>
            </LinearGradient>
          </Animated.View>

          {/* Celebration Emojis */}
          <View style={styles.celebrationEmojis}>
            <Text style={styles.celebrationEmoji}>🎉</Text>
            <Text style={styles.celebrationEmoji}>🎊</Text>
            <Text style={styles.celebrationEmoji}>🎉</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Stats or Additional Info */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>⭐⭐⭐</Text>
              <Text style={styles.statLabel}>Perfect!</Text>
            </View>
          </View>

          {/* Continue Button */}
          <TouchableOpacity 
            style={styles.continueButton}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#FF6B6B', '#FF8E8E']}
              style={styles.continueGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.continueButtonText}>{buttonText}</Text>
              <Text style={styles.continueButtonIcon}>→</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Decorative Elements */}
          <View style={styles.decorativeElements}>
            <View style={styles.decorativeDot} />
            <View style={styles.decorativeDot} />
            <View style={styles.decorativeDot} />
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
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 30,
    paddingVertical: 40,
    paddingHorizontal: 30,
    width: Math.min(screenWidth - 40, 380),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 25,
  },
  successIconContainer: {
    marginBottom: 20,
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  successIconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#ffffff',
  },
  checkMark: {
    fontSize: 50,
    color: '#ffffff',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  celebrationEmojis: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    gap: 20,
  },
  celebrationEmoji: {
    fontSize: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  message: {
    fontSize: 18,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 24,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '600',
  },
  statDivider: {
    width: 2,
    height: 40,
    backgroundColor: '#E9ECEF',
    marginHorizontal: 20,
  },
  continueButton: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#FF6B6B',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
    width: '100%',
  },
  continueGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  continueButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginRight: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  continueButtonIcon: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  decorativeElements: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 10,
  },
  decorativeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E9ECEF',
  },
  confettiPiece: {
    position: 'absolute',
    borderRadius: 4,
  },
});

export default SuccessPopup;